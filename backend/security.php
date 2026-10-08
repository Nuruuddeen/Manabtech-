<?php
declare(strict_types=1);

function create_contact_otp(PDO $pdo, int $userId, string $channel): bool
{
    $stmt = $pdo->prepare('SELECT email, phone FROM users WHERE id = ? AND account_status = \'active\' LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) api_error('Account was not found.', 404);
    $channel = $channel === 'sms' ? 'sms' : 'email';
    $destination = $channel === 'sms' ? (string)$user['phone'] : (string)$user['email'];
    if ($destination === '') api_error('No verified contact method is available for this account.', 422);

    $code = (string)random_int(100000, 999999);
    $config = require __DIR__ . '/config.php';
    if ($channel === 'sms' && !function_exists('halal_send_sms') && !empty($config['sms_adapter_path'])) {
        $adapterPath = realpath((string)$config['sms_adapter_path']);
        if ($adapterPath && is_file($adapterPath) && is_readable($adapterPath)) require_once $adapterPath;
    }
    $pdo->prepare('UPDATE contact_verifications SET verified_at = UTC_TIMESTAMP() WHERE user_id = ? AND verified_at IS NULL')->execute([$userId]);
    $insert = $pdo->prepare('INSERT INTO contact_verifications (user_id, channel, destination, code_hash, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE))');
    $insert->execute([$userId, $channel, $destination, password_hash($code, PASSWORD_DEFAULT)]);

    if ($channel === 'email') {
        $subject = 'Your HalalMatch verification code';
        $message = "Your HalalMatch verification code is {$code}. It expires in 10 minutes. If you did not request this, you can ignore this email.";
        $headers = "From: {$config['mail_from']}\r\nContent-Type: text/plain; charset=UTF-8\r\n";
        return @mail($destination, $subject, $message, $headers);
    }

    // Define halal_send_sms() in a server-side provider adapter before enabling SMS registration.
    if (function_exists('halal_send_sms')) {
        return (bool)halal_send_sms($destination, "Your HalalMatch code is {$code}. It expires in 10 minutes.");
    }
    return false;
}

function verify_contact_otp(PDO $pdo, int $userId, string $code): array
{
    if (!preg_match('/^\d{6}$/', $code)) api_error('Enter the six-digit code.', 422);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT id, code_hash, attempts FROM contact_verifications WHERE user_id = ? AND verified_at IS NULL AND expires_at > UTC_TIMESTAMP() ORDER BY id DESC LIMIT 1 FOR UPDATE');
        $stmt->execute([$userId]);
        $record = $stmt->fetch();
        if (!$record || (int)$record['attempts'] >= 5) {
            $pdo->rollBack();
            api_error('This code has expired or has too many attempts. Request a new code.', 422);
        }
        $pdo->prepare('UPDATE contact_verifications SET attempts = attempts + 1 WHERE id = ?')->execute([(int)$record['id']]);
        if (!password_verify($code, $record['code_hash'])) {
            $pdo->commit();
            api_error('That code did not match. Please try again.', 422);
        }
        $pdo->prepare('UPDATE contact_verifications SET verified_at = UTC_TIMESTAMP() WHERE id = ?')->execute([(int)$record['id']]);
        $pdo->prepare('UPDATE users SET contact_verified_at = UTC_TIMESTAMP() WHERE id = ?')->execute([$userId]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }

    $userStmt = $pdo->prepare('SELECT id, email, phone, gender, date_of_birth, account_status, verification_status FROM users WHERE id = ? LIMIT 1');
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();
    if (!$user) api_error('Account was not found.', 404);
    if (user_has_any_staff_permission($userId)) {
        $_SESSION['pending_admin_user_id'] = $userId;
        $authenticator = $pdo->prepare('SELECT 1 FROM admin_authenticators WHERE user_id = ?');
        $authenticator->execute([$userId]);
        $hasAuthenticator = (bool)$authenticator->fetchColumn();
        return ['requires_two_factor' => true, 'requires_two_factor_setup' => !$hasAuthenticator, 'user' => safe_user_payload($pdo, $user)];
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    unset($_SESSION['pending_user_id']);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    return ['requires_two_factor' => false, 'user' => safe_user_payload($pdo, $user), 'csrf_token' => $_SESSION['csrf_token']];
}

function base32_encode_secret(string $data): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $binary = '';
    foreach (str_split($data) as $char) $binary .= str_pad(decbin(ord($char)), 8, '0', STR_PAD_LEFT);
    $output = '';
    foreach (str_split($binary, 5) as $chunk) {
        if (strlen($chunk) < 5) $chunk = str_pad($chunk, 5, '0', STR_PAD_RIGHT);
        $output .= $alphabet[bindec($chunk)];
    }
    return $output;
}

function base32_decode_secret(string $encoded): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $encoded = strtoupper(rtrim($encoded, '='));
    $binary = '';
    foreach (str_split($encoded) as $char) {
        $position = strpos($alphabet, $char);
        if ($position === false) throw new RuntimeException('Invalid authenticator secret.');
        $binary .= str_pad(decbin($position), 5, '0', STR_PAD_LEFT);
    }
    $output = '';
    foreach (str_split($binary, 8) as $byte) {
        if (strlen($byte) === 8) $output .= chr(bindec($byte));
    }
    return $output;
}

function totp_code(string $secret, int $timestamp): string
{
    $key = base32_decode_secret($secret);
    $counter = intdiv($timestamp, 30);
    $message = pack('N*', 0) . pack('N*', $counter);
    $hash = hash_hmac('sha1', $message, $key, true);
    $offset = ord($hash[19]) & 0x0f;
    $value = ((ord($hash[$offset]) & 0x7f) << 24) | ((ord($hash[$offset + 1]) & 0xff) << 16) | ((ord($hash[$offset + 2]) & 0xff) << 8) | (ord($hash[$offset + 3]) & 0xff);
    return str_pad((string)($value % 1000000), 6, '0', STR_PAD_LEFT);
}

function verify_totp(string $secret, string $code): bool
{
    if (!preg_match('/^\d{6}$/', $code)) return false;
    $now = time();
    for ($window = -1; $window <= 1; $window++) {
        if (hash_equals(totp_code($secret, $now + $window * 30), $code)) return true;
    }
    return false;
}

function save_private_upload(array $file, string $mime, string $folder, string $extension): string
{
    $config = require __DIR__ . '/config.php';
    $root = rtrim($config['private_storage_path'], DIRECTORY_SEPARATOR);
    $directory = $root . DIRECTORY_SEPARATOR . trim($folder, DIRECTORY_SEPARATOR);
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        api_error('Private storage is not available.', 500);
    }
    @chmod($root, 0700);
    @chmod($directory, 0700);
    $filename = bin2hex(random_bytes(24)) . '.' . $extension;
    $destination = $directory . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file((string)$file['tmp_name'], $destination)) {
        api_error('The file could not be stored securely.', 500);
    }
    @chmod($destination, 0600);
    return trim($folder, DIRECTORY_SEPARATOR) . '/' . $filename;
}

function resolve_private_upload(string $relativePath): string
{
    $config = require __DIR__ . '/config.php';
    $root = realpath($config['private_storage_path']);
    if (!$root || str_contains($relativePath, '..') || str_contains($relativePath, "\0")) {
        api_error('Private media was not found.', 404);
    }
    $path = realpath($root . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath));
    if (!$path || !str_starts_with($path, $root . DIRECTORY_SEPARATOR) || !is_file($path)) {
        api_error('Private media was not found.', 404);
    }
    return $path;
}
