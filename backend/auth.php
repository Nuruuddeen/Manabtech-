<?php
declare(strict_types=1);

function current_user(): ?array
{
    static $cachedUser = false;
    if (is_array($cachedUser)) {
        return $cachedUser;
    }
    if ($cachedUser === null || empty($_SESSION['user_id'])) {
        return null;
    }
    $stmt = db()->prepare('SELECT id, email, phone, gender, date_of_birth, account_status, verification_status, contact_verified_at, last_login_at FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user || $user['account_status'] !== 'active') {
        unset($_SESSION['user_id']);
        $cachedUser = null;
        return null;
    }
    $user['id'] = (int)$user['id'];
    $user['is_admin'] = user_has_any_staff_permission($user['id']);
    $cachedUser = $user;
    return $user;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        api_error('Please sign in to continue.', 401);
    }
    return $user;
}

function user_has_any_staff_permission(int $userId): bool
{
    $stmt = db()->prepare(
        'SELECT 1 FROM user_roles ur '
        . 'JOIN role_permissions rp ON rp.role_id = ur.role_id '
        . 'JOIN permissions p ON p.id = rp.permission_id '
        . 'WHERE ur.user_id = ? LIMIT 1'
    );
    $stmt->execute([$userId]);
    return (bool)$stmt->fetchColumn();
}

function has_permission(int $userId, string $permission): bool
{
    $stmt = db()->prepare(
        'SELECT 1 FROM user_roles ur '
        . 'JOIN role_permissions rp ON rp.role_id = ur.role_id '
        . 'JOIN permissions p ON p.id = rp.permission_id '
        . 'WHERE ur.user_id = ? AND p.permission_key IN (?, ?) LIMIT 1'
    );
    $stmt->execute([$userId, $permission, '*']);
    return (bool)$stmt->fetchColumn();
}

function require_permission(string $permission): array
{
    $user = require_auth();
    if (!has_permission((int)$user['id'], $permission)) {
        api_error('You do not have permission to perform this action.', 403);
    }
    return $user;
}

function has_role(int $userId, string $roleKey): bool
{
    $stmt = db()->prepare('SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? AND r.role_key = ? LIMIT 1');
    $stmt->execute([$userId, $roleKey]);
    return (bool)$stmt->fetchColumn();
}

function require_feature(string $featureKey): void
{
    $stmt = db()->prepare('SELECT enabled FROM feature_settings WHERE feature_key = ? LIMIT 1');
    $stmt->execute([$featureKey]);
    if ((int)$stmt->fetchColumn() !== 1) {
        api_error('This feature is currently unavailable.', 503, ['feature' => $featureKey]);
    }
}

function feature_snapshot(): array
{
    $rows = db()->query('SELECT feature_key AS `key`, enabled FROM feature_settings ORDER BY feature_key')->fetchAll();
    return array_map(static fn(array $row): array => ['key' => $row['key'], 'enabled' => (bool)$row['enabled']], $rows);
}

function require_verified_member(): array
{
    $user = require_auth();
    if ($user['verification_status'] !== 'approved') {
        api_error('Your profile must be approved before using discovery or messaging.', 403, ['verification_status' => $user['verification_status']]);
    }
    return $user;
}

function audit_log(PDO $pdo, ?int $adminId, string $action, ?string $targetType = null, ?string $targetId = null, mixed $previous = null, mixed $next = null): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO audit_logs (admin_id, action, target_type, target_id, ip_address, user_agent, previous_value, new_value) '
        . 'VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $adminId,
        $action,
        $targetType,
        $targetId,
        substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45) ?: null,
        substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 500) ?: null,
        $previous === null ? null : json_encode($previous, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        $next === null ? null : json_encode($next, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
}

function profile_completion(array $data): int
{
    $fields = ['state', 'lga', 'education', 'occupation', 'marital_status', 'religious_practice', 'about_me', 'marriage_intention'];
    $complete = 0;
    foreach ($fields as $field) {
        if (trim((string)($data[$field] ?? '')) !== '') {
            $complete++;
        }
    }
    foreach (['languages', 'interests'] as $field) {
        if (!empty($data[$field]) && (is_array($data[$field]) || trim((string)$data[$field]) !== '')) {
            $complete++;
        }
    }
    return (int)round($complete / 10 * 100);
}

function normalize_list(mixed $value, int $limit = 20): array
{
    if (is_string($value)) {
        $value = preg_split('/[,;\n]+/', $value) ?: [];
    }
    if (!is_array($value)) {
        return [];
    }
    $items = [];
    foreach (array_slice($value, 0, $limit) as $entry) {
        $entry = trim((string)$entry);
        if ($entry !== '') {
            $items[] = text_substr($entry, 0, 80);
        }
    }
    return array_values(array_unique($items));
}

function encrypt_secret(string $secret): string
{
    $config = require __DIR__ . '/config.php';
    if (strlen($config['app_key']) < 32) {
        throw new RuntimeException('APP_KEY must contain at least 32 characters before secrets can be stored.');
    }
    $key = hash('sha256', $config['app_key'], true);
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    return base64_encode($nonce . sodium_crypto_secretbox($secret, $nonce, $key));
}

function decrypt_secret(string $ciphertext): string
{
    $config = require __DIR__ . '/config.php';
    if (strlen($config['app_key']) < 32) {
        throw new RuntimeException('APP_KEY must contain at least 32 characters before secrets can be read.');
    }
    $binary = base64_decode($ciphertext, true);
    if ($binary === false || strlen($binary) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
        throw new RuntimeException('Invalid encrypted secret.');
    }
    $nonce = substr($binary, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $message = sodium_crypto_secretbox_open(substr($binary, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES), $nonce, hash('sha256', $config['app_key'], true));
    if ($message === false) {
        throw new RuntimeException('Secret decryption failed. Check the APP_KEY.');
    }
    return $message;
}
