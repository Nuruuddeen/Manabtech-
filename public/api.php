<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/backend/db.php';
require_once dirname(__DIR__) . '/backend/http.php';
require_once dirname(__DIR__) . '/backend/auth.php';
require_once dirname(__DIR__) . '/backend/security.php';
require_once dirname(__DIR__) . '/backend/matching.php';

ini_set('display_errors', '0');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
start_secure_session();

function safe_user_payload(PDO $pdo, array $user): array
{
    $profileStmt = $pdo->prepare('SELECT full_name, state, lga, education, occupation, marital_status, religious_practice, languages, interests, about_me, marriage_intention, profile_completion FROM profiles WHERE user_id = ? LIMIT 1');
    $profileStmt->execute([(int)$user['id']]);
    $profile = $profileStmt->fetch() ?: [];
    $rolesStmt = $pdo->prepare('SELECT r.role_key, r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = ? ORDER BY r.name');
    $rolesStmt->execute([(int)$user['id']]);
    $roles = $rolesStmt->fetchAll();
    return [
        'id' => (int)$user['id'],
        'name' => $profile['full_name'] ?? '',
        'gender' => $user['gender'],
        'date_of_birth' => $user['date_of_birth'] ?? null,
        'state' => $profile['state'] ?? null,
        'lga' => $profile['lga'] ?? null,
        'education' => $profile['education'] ?? null,
        'occupation' => $profile['occupation'] ?? null,
        'marital_status' => $profile['marital_status'] ?? null,
        'religious_practice' => $profile['religious_practice'] ?? null,
        'languages' => json_decode((string)($profile['languages'] ?? '[]'), true) ?: [],
        'interests' => json_decode((string)($profile['interests'] ?? '[]'), true) ?: [],
        'about_me' => $profile['about_me'] ?? null,
        'marriage_intention' => $profile['marriage_intention'] ?? null,
        'profile_completion' => (int)($profile['profile_completion'] ?? 0),
        'account_status' => $user['account_status'],
        'verification_status' => $user['verification_status'],
        'contact_verified' => !empty($user['contact_verified_at']),
        'is_admin' => user_has_any_staff_permission((int)$user['id']),
        'roles' => array_map(static fn(array $role): array => ['key' => $role['role_key'], 'name' => $role['name']], $roles),
    ];
}

function log_login(PDO $pdo, ?int $userId, string $identifier, bool $success, ?string $reason = null): void
{
    $stmt = $pdo->prepare('INSERT INTO login_activity (user_id, identifier_hash, ip_address, user_agent, was_successful, failure_reason) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $userId,
        hash('sha256', strtolower(trim($identifier))),
        substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45) ?: null,
        substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 500) ?: null,
        $success ? 1 : 0,
        $reason,
    ]);
}

function finish_login(int $userId): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    unset($_SESSION['pending_user_id'], $_SESSION['pending_admin_user_id'], $_SESSION['pending_totp_secret']);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function handle_registration(PDO $pdo, array $data): never
{
    require_feature('registration');
    rate_limit('auth.register', 8, 3600);
    $name = valid_string($data['full_name'] ?? '', 120, true);
    $gender = strtolower(valid_string($data['gender'] ?? '', 8, true));
    if (!in_array($gender, ['male', 'female'], true)) api_error('Choose Male or Female for your account type.', 422);
    $email = strtolower(valid_string($data['email'] ?? '', 254));
    $phone = valid_string($data['phone'] ?? '', 32);
    if ($email === '' && $phone === '') api_error('Add an email address or phone number for OTP verification.', 422);
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) api_error('Enter a valid email address.', 422);
    if ($phone !== '' && !preg_match('/^\+?[0-9][0-9 ()-]{6,24}$/', $phone)) api_error('Enter a valid phone number.', 422);
    $password = (string)($data['password'] ?? '');
    if (strlen($password) < 10 || strlen($password) > 200) api_error('Use a password between 10 and 200 characters.', 422);
    $dobText = valid_string($data['date_of_birth'] ?? '', 10, true);
    $dob = DateTimeImmutable::createFromFormat('!Y-m-d', $dobText);
    if (!$dob || $dob->format('Y-m-d') !== $dobText || age_from_date($dobText) < 18) api_error('You must be at least 18 years old to join.', 422);

    $profileData = [
        'state' => valid_string($data['state'] ?? '', 80),
        'lga' => valid_string($data['lga'] ?? '', 100),
        'education' => valid_string($data['education'] ?? '', 120),
        'occupation' => valid_string($data['occupation'] ?? '', 120),
        'marital_status' => valid_string($data['marital_status'] ?? '', 60),
        'religious_practice' => valid_string($data['religious_practice'] ?? '', 100),
        'languages' => normalize_list($data['languages'] ?? []),
        'interests' => normalize_list($data['interests'] ?? []),
        'about_me' => valid_string($data['about_me'] ?? '', 1500),
        'marriage_intention' => valid_string($data['marriage_intention'] ?? '', 180),
    ];
    $completion = profile_completion($profileData);
    try {
        $pdo->beginTransaction();
        $insert = $pdo->prepare('INSERT INTO users (email, phone, password_hash, gender, date_of_birth) VALUES (?, ?, ?, ?, ?)');
        $insert->execute([$email ?: null, $phone ?: null, password_hash($password, PASSWORD_DEFAULT), $gender, $dobText]);
        $userId = (int)$pdo->lastInsertId();
        $profile = $pdo->prepare('INSERT INTO profiles (user_id, full_name, state, lga, education, occupation, marital_status, religious_practice, languages, interests, about_me, marriage_intention, profile_completion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $profile->execute([$userId, $name, $profileData['state'] ?: null, $profileData['lga'] ?: null, $profileData['education'] ?: null, $profileData['occupation'] ?: null, $profileData['marital_status'] ?: null, $profileData['religious_practice'] ?: null, json_encode($profileData['languages']), json_encode($profileData['interests']), $profileData['about_me'] ?: null, $profileData['marriage_intention'] ?: null, $completion]);
        $oppositeGender = $gender === 'male' ? 'female' : 'male';
        $minAge = max(18, min(70, (int)($data['minimum_age'] ?? 22)));
        $maxAge = max($minAge, min(80, (int)($data['maximum_age'] ?? 40)));
        $preferenceData = [
            'preferred_location' => valid_string($data['preferred_location'] ?? '', 120),
            'minimum_age' => $minAge,
            'maximum_age' => $maxAge,
            'preferred_education' => valid_string($data['education_preference'] ?? '', 120),
        ];
        $pref = $pdo->prepare('INSERT INTO profile_preferences (user_id, preferred_gender, minimum_age, maximum_age, preferred_state, preferred_education, marriage_intention, preference_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $pref->execute([$userId, $oppositeGender, $minAge, $maxAge, $preferenceData['preferred_location'] ?: null, $preferenceData['preferred_education'] ?: null, $profileData['marriage_intention'] ?: null, json_encode($preferenceData)]);
        $role = $pdo->prepare('SELECT id FROM roles WHERE role_key = ? LIMIT 1');
        $role->execute(['user']);
        $roleId = $role->fetchColumn();
        if (!$roleId) throw new RuntimeException('Default User role has not been seeded.');
        $pdo->prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)')->execute([$userId, (int)$roleId]);
        $pdo->commit();
    } catch (PDOException $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($error->getCode() === '23000') api_error('An account with that email or phone number already exists.', 409);
        throw $error;
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }

    $_SESSION['pending_user_id'] = $userId;
    $channel = $email !== '' ? 'email' : 'sms';
    $sent = false;
    try { $sent = create_contact_otp($pdo, $userId, $channel); } catch (Throwable) { $sent = false; }
    json_response([
        'ok' => true,
        'message' => $sent ? 'Account created. Enter the code sent to your contact method.' : 'Account created. OTP delivery must be configured by the platform administrator.',
        'requires_contact_verification' => true,
        'delivery_ready' => $sent,
        'channel' => $channel,
    ], 201);
}

function handle_login(PDO $pdo, array $data): never
{
    rate_limit('auth.login', 12, 900);
    $identifier = valid_string($data['identifier'] ?? $data['email'] ?? $data['phone'] ?? '', 254, true);
    $password = (string)($data['password'] ?? '');
    if ($password === '' || strlen($password) > 200) api_error('Enter your password.', 422);
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1');
    $stmt->execute([strtolower($identifier), $identifier]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        log_login($pdo, $user ? (int)$user['id'] : null, $identifier, false, 'invalid_credentials');
        api_error('Email, phone number or password was not recognised.', 401);
    }
    if ($user['account_status'] !== 'active') {
        log_login($pdo, (int)$user['id'], $identifier, false, 'account_not_active');
        api_error('This account is not active. Contact support for help.', 403);
    }
    if (empty($user['contact_verified_at'])) {
        $_SESSION['pending_user_id'] = (int)$user['id'];
        log_login($pdo, (int)$user['id'], $identifier, false, 'contact_verification_required');
        json_response(['ok' => true, 'requires_contact_verification' => true, 'message' => 'Verify your email or phone number before continuing.'], 202);
    }
    if (user_has_any_staff_permission((int)$user['id'])) {
        $_SESSION['pending_admin_user_id'] = (int)$user['id'];
        $authenticator = $pdo->prepare('SELECT 1 FROM admin_authenticators WHERE user_id = ?');
        $authenticator->execute([(int)$user['id']]);
        $hasAuthenticator = (bool)$authenticator->fetchColumn();
        log_login($pdo, (int)$user['id'], $identifier, false, 'admin_two_factor_required');
        json_response([
            'ok' => true,
            'requires_two_factor' => $hasAuthenticator,
            'requires_two_factor_setup' => !$hasAuthenticator,
            'message' => 'Administrator two-factor authentication is required.',
        ], 202);
    }
    finish_login((int)$user['id']);
    $pdo->prepare('UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?')->execute([(int)$user['id']]);
    log_login($pdo, (int)$user['id'], $identifier, true);
    json_response(['ok' => true, 'user' => safe_user_payload($pdo, $user), 'csrf_token' => $_SESSION['csrf_token']]);
}

function handle_admin_totp_setup(PDO $pdo): never
{
    $pendingId = (int)($_SESSION['pending_admin_user_id'] ?? 0);
    if (!$pendingId) {
        $user = require_auth();
        if (!$user['is_admin']) api_error('Administrator access is required.', 403);
        $pendingId = (int)$user['id'];
    }
    $secret = base32_encode_secret(random_bytes(20));
    $_SESSION['pending_totp_secret'] = $secret;
    $stmt = $pdo->prepare('SELECT email FROM users WHERE id = ?');
    $stmt->execute([$pendingId]);
    $email = (string)$stmt->fetchColumn();
    $label = rawurlencode('HalalMatchmaking:' . ($email ?: ('Admin ' . $pendingId)));
    $issuer = rawurlencode('HalalMatchmaking');
    json_response(['ok' => true, 'secret' => $secret, 'otpauth_uri' => "otpauth://totp/{$label}?secret={$secret}&issuer={$issuer}&period=30&digits=6"]);
}

function handle_admin_totp_confirm(PDO $pdo, array $data, bool $setup): never
{
    $userId = (int)($_SESSION['pending_admin_user_id'] ?? 0);
    if (!$userId) {
        $user = require_auth();
        if (!$user['is_admin']) api_error('Administrator access is required.', 403);
        $userId = (int)$user['id'];
    }
    $code = valid_string($data['code'] ?? '', 6, true);
    if ($setup) {
        $secret = (string)($_SESSION['pending_totp_secret'] ?? '');
        if ($secret === '') api_error('Start administrator authenticator setup first.', 409);
        if (!verify_totp($secret, $code)) api_error('The authenticator code did not match. Try again.', 422);
        $encrypted = encrypt_secret($secret);
        $stmt = $pdo->prepare('INSERT INTO admin_authenticators (user_id, secret_ciphertext) VALUES (?, ?) ON DUPLICATE KEY UPDATE secret_ciphertext = VALUES(secret_ciphertext), enabled_at = UTC_TIMESTAMP()');
        $stmt->execute([$userId, $encrypted]);
        audit_log($pdo, $userId, 'admin.2fa_enabled', 'user', (string)$userId, null, ['enabled' => true]);
    } else {
        $stmt = $pdo->prepare('SELECT secret_ciphertext FROM admin_authenticators WHERE user_id = ?');
        $stmt->execute([$userId]);
        $ciphertext = $stmt->fetchColumn();
        if (!$ciphertext || !verify_totp(decrypt_secret((string)$ciphertext), $code)) api_error('The authenticator code did not match.', 422);
        $pdo->prepare('UPDATE admin_authenticators SET last_verified_at = UTC_TIMESTAMP() WHERE user_id = ?')->execute([$userId]);
    }
    finish_login($userId);
    $pdo->prepare('UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?')->execute([$userId]);
    log_login($pdo, $userId, 'administrator', true);
    $userStmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $userStmt->execute([$userId]);
    json_response(['ok' => true, 'user' => safe_user_payload($pdo, $userStmt->fetch()), 'csrf_token' => $_SESSION['csrf_token']]);
}

function handle_logout(): never
{
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId) audit_log(db(), $userId, 'auth.logout', 'user', (string)$userId, null, null);
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'], $params['httponly']);
    }
    session_destroy();
    json_response(['ok' => true, 'message' => 'Signed out.']);
}

function handle_discovery(PDO $pdo, array $query): never
{
    $user = require_verified_member();
    require_feature('discovery');
    $profiles = discover_profiles($pdo, $user, $query);
    json_response(['ok' => true, 'profiles' => $profiles]);
}

function handle_create_like(PDO $pdo, array $data): never
{
    $viewer = require_verified_member();
    require_feature('discovery');
    $targetId = valid_id($data['user_id'] ?? null);
    $targetStmt = $pdo->prepare('SELECT u.id,u.gender,u.account_status,u.verification_status,u.date_of_birth,p.profile_visibility,pp.preferred_gender AS candidate_preferred_gender,pp.preference_data AS candidate_preference_data,EXISTS(SELECT 1 FROM profile_photos ph WHERE ph.user_id=u.id AND ph.is_primary=1 AND ph.review_status=\'approved\') AS has_primary_photo FROM users u JOIN profiles p ON p.user_id=u.id LEFT JOIN profile_preferences pp ON pp.user_id=u.id WHERE u.id=? LIMIT 1');
    $targetStmt->execute([$targetId]);
    $target = $targetStmt->fetch();
    if (!$target || $target['profile_visibility'] !== 'visible' || !(bool)$target['has_primary_photo']) api_error('This profile is not available.', 404);
    assert_discovery_pair($viewer, $target);
    $viewerPreferencesStmt = $pdo->prepare('SELECT u.gender,u.date_of_birth,pp.minimum_age,pp.maximum_age,pp.preferred_gender FROM users u LEFT JOIN profile_preferences pp ON pp.user_id=u.id WHERE u.id=? LIMIT 1');
    $viewerPreferencesStmt->execute([(int)$viewer['id']]);
    $viewerPreferences = $viewerPreferencesStmt->fetch() ?: [];
    $targetAge = age_from_date((string)$target['date_of_birth']);
    $minAge = (int)($viewerPreferences['minimum_age'] ?? 18);
    $maxAge = (int)($viewerPreferences['maximum_age'] ?? 99);
    if ($targetAge < $minAge || $targetAge > $maxAge || !candidate_accepts_viewer($viewerPreferences,$target)) api_error('This profile does not match your discovery preferences.',404);

    $pdo->beginTransaction();
    try {
        $lockUsers = $pdo->prepare('SELECT id FROM users WHERE id IN (?,?) ORDER BY id FOR UPDATE');
        $lockUsers->execute([min((int)$viewer['id'],$targetId),max((int)$viewer['id'],$targetId)]);
        $pdo->prepare('INSERT IGNORE INTO likes (from_user_id, to_user_id) VALUES (?, ?)')->execute([(int)$viewer['id'], $targetId]);
        $reciprocal = $pdo->prepare('SELECT 1 FROM likes WHERE from_user_id = ? AND to_user_id = ? LIMIT 1');
        $reciprocal->execute([$targetId, (int)$viewer['id']]);
        $matched = (bool)$reciprocal->fetchColumn();
        $conversationId = null;
        if ($matched) {
            $low = min((int)$viewer['id'], $targetId);
            $high = max((int)$viewer['id'], $targetId);
            $pdo->prepare('INSERT IGNORE INTO matches (user_low_id, user_high_id, status) VALUES (?, ?, \'active\')')->execute([$low, $high]);
            $matchStmt = $pdo->prepare('SELECT id FROM matches WHERE user_low_id = ? AND user_high_id = ? AND status = \'active\'');
            $matchStmt->execute([$low, $high]);
            $matchId = (int)$matchStmt->fetchColumn();
            $pdo->prepare('INSERT IGNORE INTO conversations (match_id) VALUES (?)')->execute([$matchId]);
            $conversationStmt = $pdo->prepare('SELECT id FROM conversations WHERE match_id = ?');
            $conversationStmt->execute([$matchId]);
            $conversationId = (int)$conversationStmt->fetchColumn();
            $pdo->prepare('INSERT IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)')->execute([$conversationId, $low, $conversationId, $high]);
            $notice = $pdo->prepare('INSERT INTO notifications (user_id, notification_type, title, body, data) VALUES (?, ?, ?, ?, ?)');
            $notice->execute([$targetId, 'match', 'It is a mutual connection', 'You and another member have chosen to connect.', json_encode(['conversation_id' => $conversationId])]);
        }
        audit_log($pdo, (int)$viewer['id'], 'member.like_sent', 'user', (string)$targetId, null, ['matched' => $matched]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
    json_response(['ok' => true, 'liked' => true, 'matched' => $matched, 'conversation_id' => $conversationId], $matched ? 201 : 200);
}

function handle_list_likes(PDO $pdo, array $query): never
{
    $user = require_verified_member();
    require_feature('discovery');
    $direction = ($query['direction'] ?? 'received') === 'sent' ? 'sent' : 'received';
    $strictStmt = $pdo->prepare('SELECT enabled FROM feature_settings WHERE feature_key=?');
    $strictStmt->execute(['opposite_gender_matching']);
    $strict = (int)$strictStmt->fetchColumn() === 1;
    if ($direction === 'received') {
        $sql = 'SELECT u.id, p.full_name, u.gender, u.date_of_birth, p.state, p.education, p.occupation, p.marriage_intention FROM likes l JOIN users u ON u.id=l.from_user_id JOIN profiles p ON p.user_id=u.id WHERE l.to_user_id=? AND u.account_status=\'active\' AND u.verification_status=\'approved\' AND (?=0 OR u.gender<>?) AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id=? AND b.blocked_id=u.id) OR (b.blocker_id=u.id AND b.blocked_id=?)) ORDER BY l.created_at DESC LIMIT 100';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([(int)$user['id'], $strict ? 1 : 0, $user['gender'], (int)$user['id'], (int)$user['id']]);
    } else {
        $sql = 'SELECT u.id, p.full_name, u.gender, u.date_of_birth, p.state, p.education, p.occupation, p.marriage_intention FROM likes l JOIN users u ON u.id=l.to_user_id JOIN profiles p ON p.user_id=u.id WHERE l.from_user_id=? AND u.account_status=\'active\' AND u.verification_status=\'approved\' AND (?=0 OR u.gender<>?) ORDER BY l.created_at DESC LIMIT 100';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([(int)$user['id'], $strict ? 1 : 0, $user['gender']]);
    }
    $people = array_map(static fn(array $row): array => [
        'id' => (int)$row['id'], 'name' => $row['full_name'], 'age' => age_from_date($row['date_of_birth']),
        'location' => $row['state'], 'education' => $row['education'], 'occupation' => $row['occupation'],
        'marriage_intention' => $row['marriage_intention'], 'verified' => true,
    ], $stmt->fetchAll());
    json_response(['ok' => true, 'direction' => $direction, 'profiles' => $people]);
}

function handle_conversations(PDO $pdo, array $user): never
{
    require_feature('messaging');
    require_verified_member();
    $stmt = $pdo->prepare(
        'SELECT c.id AS conversation_id, other.id AS member_id, p.full_name, other.gender, other.verification_status, c.last_message_at, '
        . '(SELECT body FROM messages m WHERE m.conversation_id=c.id AND m.deleted_at IS NULL ORDER BY m.id DESC LIMIT 1) AS last_message, '
        . '(SELECT COUNT(*) FROM messages m WHERE m.conversation_id=c.id AND m.sender_id<>? AND m.read_at IS NULL AND m.deleted_at IS NULL) AS unread_count '
        . 'FROM conversation_members mine JOIN conversations c ON c.id=mine.conversation_id '
        . 'JOIN conversation_members theirs ON theirs.conversation_id=c.id AND theirs.user_id<>mine.user_id '
        . 'JOIN users other ON other.id=theirs.user_id JOIN profiles p ON p.user_id=other.id '
        . 'JOIN matches ma ON ma.id=c.match_id AND ma.status=\'active\' '
        . 'WHERE mine.user_id=? AND other.account_status=\'active\' ORDER BY c.last_message_at DESC LIMIT 100'
    );
    $stmt->execute([(int)$user['id'], (int)$user['id']]);
    json_response(['ok' => true, 'conversations' => $stmt->fetchAll()]);
}

function conversation_for_member(PDO $pdo, int $conversationId, int $userId): array
{
    $stmt = $pdo->prepare(
        'SELECT c.id, c.match_id FROM conversations c '
        . 'JOIN conversation_members cm ON cm.conversation_id=c.id '
        . 'JOIN matches ma ON ma.id=c.match_id AND ma.status=\'active\' '
        . 'WHERE c.id=? AND cm.user_id=? LIMIT 1'
    );
    $stmt->execute([$conversationId, $userId]);
    $row = $stmt->fetch();
    if (!$row) api_error('This conversation is not available.', 404);
    return $row;
}

function handle_conversation_messages(PDO $pdo, array $user, int $conversationId, string $method, array $data = []): never
{
    require_feature('messaging');
    require_verified_member();
    conversation_for_member($pdo, $conversationId, (int)$user['id']);
    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT id, sender_id, body, message_type, delivered_at, read_at, created_at FROM messages WHERE conversation_id=? AND deleted_at IS NULL ORDER BY id DESC LIMIT 100');
        $stmt->execute([$conversationId]);
        $messages = array_reverse($stmt->fetchAll());
        $pdo->prepare('UPDATE conversation_members SET last_read_at=UTC_TIMESTAMP() WHERE conversation_id=? AND user_id=?')->execute([$conversationId, (int)$user['id']]);
        json_response(['ok' => true, 'messages' => $messages]);
    }
    $body = valid_string($data['body'] ?? '', 2000, true);
    if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $body)) api_error('Message contains unsupported characters.', 422);
    $pdo->beginTransaction();
    try {
        $insert = $pdo->prepare('INSERT INTO messages (conversation_id, sender_id, body, message_type, delivered_at) VALUES (?, ?, ?, \'text\', UTC_TIMESTAMP())');
        $insert->execute([$conversationId, (int)$user['id'], $body]);
        $messageId = (int)$pdo->lastInsertId();
        $pdo->prepare('UPDATE conversations SET last_message_at=UTC_TIMESTAMP() WHERE id=?')->execute([$conversationId]);
        $recipient = $pdo->prepare('SELECT user_id FROM conversation_members WHERE conversation_id=? AND user_id<>?');
        $recipient->execute([$conversationId, (int)$user['id']]);
        $recipientId = (int)$recipient->fetchColumn();
        if ($recipientId) $pdo->prepare('INSERT INTO notifications (user_id, notification_type, title, body, data) VALUES (?, ?, ?, ?, ?)')->execute([$recipientId, 'message', 'You have a new message', 'A matched member sent you a message.', json_encode(['conversation_id' => $conversationId])]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
    json_response(['ok' => true, 'message' => ['id' => $messageId, 'conversation_id' => $conversationId, 'sender_id' => (int)$user['id'], 'body' => $body, 'message_type' => 'text', 'created_at' => gmdate('Y-m-d H:i:s')]], 201);
}

function handle_community_feed(PDO $pdo, array $query): never
{
    $user = require_auth();
    require_feature('community');
    $limit = max(1, min(50, (int)($query['limit'] ?? 20)));
    $stmt = $pdo->prepare(
        'SELECT cp.id, cp.body, cp.visibility, cp.created_at, p.full_name, p.state, u.verification_status, '
        . '(SELECT COUNT(*) FROM community_reactions cr WHERE cr.post_id=cp.id) AS reaction_count, '
        . '(SELECT COUNT(*) FROM community_comments cc WHERE cc.post_id=cp.id AND cc.status=\'published\') AS comment_count, '
        . 'EXISTS(SELECT 1 FROM community_reactions cr WHERE cr.post_id=cp.id AND cr.user_id=?) AS viewer_reacted '
        . 'FROM community_posts cp JOIN users u ON u.id=cp.user_id JOIN profiles p ON p.user_id=u.id '
        . 'WHERE cp.status=\'published\' AND cp.visibility IN (\'community\',\'public\') AND u.account_status=\'active\' '
        . 'ORDER BY cp.created_at DESC LIMIT ' . $limit
    );
    $stmt->execute([(int)$user['id']]);
    json_response(['ok' => true, 'posts' => $stmt->fetchAll()]);
}

function handle_create_community_post(PDO $pdo, array $data): never
{
    $user = require_auth();
    require_feature('community');
    $body = valid_string($data['body'] ?? '', 1200, true);
    if (empty($user['contact_verified_at'])) api_error('Verify your email or phone before posting.', 403);
    if ($user['account_status'] !== 'active') api_error('This account cannot post right now.', 403);
    $visibility = ($data['visibility'] ?? 'community') === 'public' ? 'public' : 'community';
    $stmt = $pdo->prepare('INSERT INTO community_posts (user_id, body, visibility, status) VALUES (?, ?, ?, \'published\')');
    $stmt->execute([(int)$user['id'], $body, $visibility]);
    $postId = (int)$pdo->lastInsertId();
    audit_log($pdo, (int)$user['id'], 'community.post_created', 'community_post', (string)$postId, null, ['visibility' => $visibility]);
    json_response(['ok' => true, 'post_id' => $postId], 201);
}

function handle_community_reaction(PDO $pdo, array $user, int $postId, string $action = 'like', array $data = []): never
{
    require_feature('community');
    if ($action === 'comment') require_feature('comments');
    $post = $pdo->prepare('SELECT id FROM community_posts WHERE id=? AND status=\'published\'');
    $post->execute([$postId]);
    if (!$post->fetchColumn()) api_error('Community post was not found.', 404);
    if ($action === 'comment') {
        $body = valid_string($data['body'] ?? '', 600, true);
        $pdo->prepare('INSERT INTO community_comments (post_id, user_id, body) VALUES (?, ?, ?)')->execute([$postId, (int)$user['id'], $body]);
        json_response(['ok' => true, 'message' => 'Your comment was added.'], 201);
    }
    $existing = $pdo->prepare('SELECT id FROM community_reactions WHERE post_id=? AND user_id=?');
    $existing->execute([$postId, (int)$user['id']]);
    $wasReacted = (bool)$existing->fetchColumn();
    if ($wasReacted) $pdo->prepare('DELETE FROM community_reactions WHERE post_id=? AND user_id=?')->execute([$postId, (int)$user['id']]);
    else $pdo->prepare('INSERT INTO community_reactions (post_id, user_id, reaction) VALUES (?, ?, \'like\')')->execute([$postId, (int)$user['id']]);
    json_response(['ok' => true, 'reacted' => !$wasReacted]);
}

function handle_submit_verification(PDO $pdo): never
{
    $user = require_auth();
    require_feature('video_verification');
    if (empty($user['contact_verified_at'])) api_error('Verify your email or phone before submitting a verification video.', 403);
    if ($user['account_status'] !== 'active') api_error('This account cannot submit verification right now.', 403);
    if ($user['verification_status'] === 'approved') api_error('Your profile is already approved.', 409);
    $active = $pdo->prepare('SELECT id FROM verification_requests WHERE user_id=? AND status IN (\'pending\',\'under_review\') LIMIT 1');
    $active->execute([(int)$user['id']]);
    if ($active->fetchColumn()) api_error('You already have a verification request being reviewed.', 409);

    $config = require dirname(__DIR__) . '/backend/config.php';
    [$videoFile, $videoMime] = require_uploaded_file('video', (int)$config['max_video_bytes'], ['video/mp4','video/webm','video/quicktime']);
    $videoExtension = ['video/mp4'=>'mp4','video/webm'=>'webm','video/quicktime'=>'mov'][$videoMime];
    $videoPath = save_private_upload($videoFile, $videoMime, 'verifications', $videoExtension);
    $selfiePath = null;
    if (isset($_FILES['selfie']) && ($_FILES['selfie']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        [$selfieFile, $selfieMime] = require_uploaded_file('selfie', 10485760, ['image/jpeg','image/png','image/webp']);
        $selfieExtension = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$selfieMime];
        $selfiePath = save_private_upload($selfieFile, $selfieMime, 'verification-selfies', $selfieExtension);
    }
    $idDocumentPath = null;
    if (isset($_FILES['id_document']) && ($_FILES['id_document']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        [$documentFile, $documentMime] = require_uploaded_file('id_document', 10485760, ['application/pdf','image/jpeg','image/png','image/webp']);
        $documentExtension = ['application/pdf'=>'pdf','image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$documentMime];
        $idDocumentPath = save_private_upload($documentFile, $documentMime, 'verification-documents', $documentExtension);
    }
    $identity = [
        'full_name' => valid_string($_POST['full_name'] ?? '', 120),
        'date_of_birth' => valid_string($_POST['date_of_birth'] ?? '', 10),
        'state' => valid_string($_POST['state'] ?? '', 80),
    ];
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('INSERT INTO verification_requests (user_id, status, video_storage_path, selfie_storage_path, id_document_storage_path, identity_data) VALUES (?, \'pending\', ?, ?, ?, ?)');
        $stmt->execute([(int)$user['id'], $videoPath, $selfiePath, $idDocumentPath, json_encode($identity)]);
        $requestId = (int)$pdo->lastInsertId();
        $pdo->prepare('UPDATE users SET verification_status=\'pending\' WHERE id=?')->execute([(int)$user['id']]);
        audit_log($pdo, (int)$user['id'], 'verification.submitted', 'verification_request', (string)$requestId, null, ['status' => 'pending']);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $videoRealPath = resolve_private_upload($videoPath);
        @unlink($videoRealPath);
        if ($selfiePath) @unlink(resolve_private_upload($selfiePath));
        if ($idDocumentPath) @unlink(resolve_private_upload($idDocumentPath));
        throw $error;
    }
    json_response(['ok' => true, 'request_id' => $requestId, 'status' => 'pending'], 201);
}

function handle_profile_update(PDO $pdo, array $data): never
{
    $user = require_auth();
    $profileData = [
        'full_name' => valid_string($data['full_name'] ?? '', 120, true),
        'state' => valid_string($data['state'] ?? '', 80),
        'lga' => valid_string($data['lga'] ?? '', 100),
        'education' => valid_string($data['education'] ?? '', 120),
        'occupation' => valid_string($data['occupation'] ?? '', 120),
        'marital_status' => valid_string($data['marital_status'] ?? '', 60),
        'religious_practice' => valid_string($data['religious_practice'] ?? '', 100),
        'languages' => normalize_list($data['languages'] ?? []),
        'interests' => normalize_list($data['interests'] ?? []),
        'about_me' => valid_string($data['about_me'] ?? '', 1500),
        'marriage_intention' => valid_string($data['marriage_intention'] ?? '', 180),
    ];
    $completion = profile_completion($profileData);
    $beforeStmt = $pdo->prepare('SELECT full_name,state,lga,education,occupation,marital_status,religious_practice,languages,interests,about_me,marriage_intention FROM profiles WHERE user_id=?');
    $beforeStmt->execute([(int)$user['id']]);
    $before = $beforeStmt->fetch() ?: [];
    $stmt = $pdo->prepare('UPDATE profiles SET full_name=?,state=?,lga=?,education=?,occupation=?,marital_status=?,religious_practice=?,languages=?,interests=?,about_me=?,marriage_intention=?,profile_completion=? WHERE user_id=?');
    $stmt->execute([$profileData['full_name'], $profileData['state'] ?: null, $profileData['lga'] ?: null, $profileData['education'] ?: null, $profileData['occupation'] ?: null, $profileData['marital_status'] ?: null, $profileData['religious_practice'] ?: null, json_encode($profileData['languages']), json_encode($profileData['interests']), $profileData['about_me'] ?: null, $profileData['marriage_intention'] ?: null, $completion, (int)$user['id']]);
    audit_log($pdo, (int)$user['id'], 'profile.updated', 'user', (string)$user['id'], $before, $profileData);
    json_response(['ok' => true, 'profile_completion' => $completion]);
}

function handle_block(PDO $pdo, array $user, array $data): never
{
    $targetId = valid_id($data['user_id'] ?? null);
    if ($targetId === (int)$user['id']) api_error('You cannot block your own account.', 422);
    $stmt = $pdo->prepare('INSERT IGNORE INTO blocks (blocker_id, blocked_id, reason) VALUES (?, ?, ?)');
    $stmt->execute([(int)$user['id'], $targetId, valid_string($data['reason'] ?? '', 500)]);
    $low = min((int)$user['id'], $targetId);
    $high = max((int)$user['id'], $targetId);
    $pdo->prepare('UPDATE matches SET status=\'blocked\' WHERE user_low_id=? AND user_high_id=?')->execute([$low, $high]);
    audit_log($pdo, (int)$user['id'], 'member.blocked', 'user', (string)$targetId, null, null);
    json_response(['ok' => true, 'blocked' => true]);
}

function handle_report(PDO $pdo, array $user, array $data): never
{
    $targetType = valid_string($data['target_type'] ?? '', 40, true);
    $allowed = ['user','message','community_post','community_comment','advertisement'];
    if (!in_array($targetType, $allowed, true)) api_error('Choose a valid report type.', 422);
    $targetId = valid_id($data['target_id'] ?? null);
    $reason = valid_string($data['reason'] ?? '', 120, true);
    $details = valid_string($data['details'] ?? '', 1500);
    $stmt = $pdo->prepare('INSERT INTO reports (reporter_id,target_type,target_id,reason,details) VALUES (?,?,?,?,?)');
    $stmt->execute([(int)$user['id'], $targetType, $targetId, $reason, $details ?: null]);
    json_response(['ok' => true, 'report_id' => (int)$pdo->lastInsertId()], 201);
}

function handle_admin_dashboard(PDO $pdo): never
{
    $admin = require_permission('settings.view');
    $count = static function (string $sql): int { return (int)db()->query($sql)->fetchColumn(); };
    $revenue = (int)$pdo->query("SELECT COALESCE(SUM(amount_minor),0) FROM payments WHERE status='successful' AND created_at >= DATE_FORMAT(UTC_DATE(), '%Y-%m-01')")->fetchColumn();
    $pendingPayments = $count("SELECT COUNT(*) FROM payments WHERE status='pending'");
    $activeMatches = $count("SELECT COUNT(*) FROM matches WHERE status='active'");
    $pendingVerification = $count("SELECT COUNT(*) FROM verification_requests WHERE status IN ('pending','under_review')");
    $todayMessages = $count('SELECT COUNT(*) FROM messages WHERE created_at >= UTC_DATE()');
    $todayCalls = $count('SELECT COUNT(*) FROM calls WHERE started_at >= UTC_DATE()');
    $result = [
        'users_total' => $count("SELECT COUNT(*) FROM users WHERE account_status='active'"),
        'male_users' => $count("SELECT COUNT(*) FROM users WHERE account_status='active' AND gender='male'"),
        'female_users' => $count("SELECT COUNT(*) FROM users WHERE account_status='active' AND gender='female'"),
        'verified_users' => $count("SELECT COUNT(*) FROM users WHERE account_status='active' AND verification_status='approved'"),
        'pending_verification' => $pendingVerification,
        'rejected_profiles' => $count("SELECT COUNT(*) FROM users WHERE verification_status='rejected'"),
        'active_matches' => $activeMatches,
        'messages_today' => $todayMessages,
        'calls_today' => $todayCalls,
        'community_posts' => $count("SELECT COUNT(*) FROM community_posts WHERE status='published'"),
        'reports_open' => $count("SELECT COUNT(*) FROM reports WHERE status IN ('open','under_review')") + $count("SELECT COUNT(*) FROM community_reports WHERE status IN ('open','under_review')"),
        'subscriptions_active' => $count("SELECT COUNT(*) FROM subscriptions WHERE status='active' AND ends_at > UTC_TIMESTAMP()"),
        'revenue_minor_month' => $revenue,
        'pending_payments' => $pendingPayments,
        'active_campaigns' => $count("SELECT COUNT(*) FROM campaigns WHERE status='active' AND (ends_at IS NULL OR ends_at > UTC_TIMESTAMP())"),
        'active_advertisements' => $count("SELECT COUNT(*) FROM advertisements WHERE status='active'"),
        'features' => feature_snapshot(),
    ];
    json_response(['ok' => true, 'dashboard' => $result]);
}

function handle_admin_verification_list(PDO $pdo, array $query): never
{
    require_permission('verification.view');
    $status = valid_string($query['status'] ?? '', 40);
    $allowed = ['pending','under_review','approved','rejected','resubmission_requested'];
    $params = [];
    $where = '';
    if ($status !== '' && in_array($status, $allowed, true)) {
        $where = 'WHERE vr.status = ?';
        $params[] = $status;
    }
    $limit = max(1, min(100, (int)($query['limit'] ?? 50)));
    $sql = 'SELECT vr.id, vr.user_id, vr.status, vr.submitted_at, vr.reviewed_at, vr.reviewer_id, vr.rejection_reason, p.full_name, p.state, p.lga, p.occupation, u.gender, u.date_of_birth, reviewerProfile.full_name AS reviewer_name '
        . 'FROM verification_requests vr JOIN users u ON u.id=vr.user_id JOIN profiles p ON p.user_id=u.id '
        . 'LEFT JOIN profiles reviewerProfile ON reviewerProfile.user_id=vr.reviewer_id ' . $where . ' ORDER BY vr.submitted_at ASC LIMIT ' . $limit;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = array_map(static function (array $row): array {
        return [
            'id' => (int)$row['id'], 'user_id' => (int)$row['user_id'], 'name' => $row['full_name'], 'gender' => $row['gender'],
            'age' => age_from_date($row['date_of_birth']), 'state' => $row['state'], 'lga' => $row['lga'], 'occupation' => $row['occupation'],
            'status' => $row['status'], 'submitted_at' => $row['submitted_at'], 'reviewed_at' => $row['reviewed_at'],
            'reviewer' => $row['reviewer_name'], 'rejection_reason' => $row['rejection_reason'],
        ];
    }, $stmt->fetchAll());
    json_response(['ok' => true, 'requests' => $rows]);
}

function handle_verification_review(PDO $pdo, array $admin, int $requestId, array $data): never
{
    $decision = valid_string($data['decision'] ?? '', 40, true);
    if (!in_array($decision, ['approve','reject','request_resubmission','suspend'], true)) api_error('Choose a valid verification decision.', 422);
    if ($decision === 'approve') {
        if (!has_permission((int)$admin['id'], 'verification.approve')) api_error('You do not have permission to approve verification.', 403);
    } elseif ($decision === 'suspend') {
        if (!has_permission((int)$admin['id'], 'users.suspend')) api_error('You do not have permission to suspend accounts.', 403);
    } elseif (!has_permission((int)$admin['id'], 'verification.reject')) {
        api_error('You do not have permission to reject or request resubmission.', 403);
    }
    $reason = valid_string($data['reason'] ?? '', 2000);
    if (in_array($decision, ['reject','request_resubmission','suspend'], true) && text_length($reason) < 4) api_error('Provide a reason for this decision.', 422);
    $statusByDecision = ['approve'=>'approved','reject'=>'rejected','request_resubmission'=>'resubmission_requested'];

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT id,user_id,status FROM verification_requests WHERE id=? FOR UPDATE');
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();
        if (!$request) { $pdo->rollBack(); api_error('Verification request was not found.', 404); }
        if (in_array($request['status'], ['approved','rejected'], true)) { $pdo->rollBack(); api_error('This request has already received a final decision.', 409); }
        $userId = (int)$request['user_id'];
        $old = ['request_status'=>$request['status']];
        if ($decision === 'suspend') {
            $pdo->prepare('UPDATE users SET account_status=\'suspended\',verification_status=\'rejected\' WHERE id=?')->execute([$userId]);
            $pdo->prepare('UPDATE verification_requests SET status=\'rejected\',reviewer_id=?,reviewed_at=UTC_TIMESTAMP(),rejection_reason=? WHERE id=?')->execute([(int)$admin['id'],$reason,$requestId]);
            $new = ['account_status'=>'suspended','verification_status'=>'rejected','reason'=>$reason];
        } else {
            $status = $statusByDecision[$decision];
            $pdo->prepare('UPDATE verification_requests SET status=?, reviewer_id=?, reviewed_at=UTC_TIMESTAMP(), rejection_reason=? WHERE id=?')->execute([$status, (int)$admin['id'], $reason ?: null, $requestId]);
            $pdo->prepare('UPDATE users SET verification_status=? WHERE id=?')->execute([$status, $userId]);
            $new = ['request_status'=>$status,'reviewer_id'=>(int)$admin['id'],'reason'=>$reason ?: null];
        }
        $pdo->prepare('INSERT INTO verification_reviews (request_id,reviewer_id,decision,reason,review_data) VALUES (?,?,?,?,?)')->execute([$requestId, (int)$admin['id'], $decision, $reason ?: null, json_encode(['ip' => $_SERVER['REMOTE_ADDR'] ?? null])]);
        audit_log($pdo, (int)$admin['id'], 'verification.' . $decision, 'verification_request', (string)$requestId, $old, $new);
        if ($decision !== 'suspend') {
            $pdo->prepare('INSERT INTO notifications (user_id,notification_type,title,body,data) VALUES (?,?,?,?,?)')->execute([$userId, 'verification', 'Verification update', $decision === 'approve' ? 'Your profile has been approved.' : ($decision === 'reject' ? 'Your verification was not approved.' : 'Please submit a new verification video.'), json_encode(['request_id'=>$requestId,'status'=>$statusByDecision[$decision]])]);
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
    json_response(['ok' => true, 'decision' => $decision, 'request_id' => $requestId]);
}

function handle_private_verification_video(PDO $pdo, array $admin, int $requestId): never
{
    require_permission('verification.view');
    $stmt = $pdo->prepare('SELECT video_storage_path FROM verification_requests WHERE id=? LIMIT 1');
    $stmt->execute([$requestId]);
    $relative = $stmt->fetchColumn();
    if (!$relative) api_error('Verification video was not found.', 404);
    $path = resolve_private_upload((string)$relative);
    audit_log($pdo, (int)$admin['id'], 'verification.video_viewed', 'verification_request', (string)$requestId, null, null);
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($path) ?: 'application/octet-stream';
    session_write_close();
    http_response_code(200);
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: inline; filename="verification-review.' . pathinfo($path, PATHINFO_EXTENSION) . '"');
    header('Cache-Control: no-store, private, max-age=0');
    header('Content-Security-Policy: default-src \'none\'; media-src \'self\'; sandbox');
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
}

function handle_feature_settings(PDO $pdo): never
{
    require_permission('features.view');
    json_response(['ok' => true, 'features' => $pdo->query('SELECT feature_key AS `key`,enabled,description,updated_at FROM feature_settings ORDER BY feature_key')->fetchAll()]);
}

function handle_feature_update(PDO $pdo, array $admin, string $featureKey, array $data): never
{
    if (!has_permission((int)$admin['id'], 'features.toggle')) api_error('You do not have permission to change feature availability.', 403);
    $enabled = filter_var($data['enabled'] ?? null, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
    if ($enabled === null) api_error('Provide enabled as true or false.', 422);
    $stmt = $pdo->prepare('SELECT enabled,description FROM feature_settings WHERE feature_key=?');
    $stmt->execute([$featureKey]);
    $previous = $stmt->fetch();
    if (!$previous) api_error('Feature setting was not found.', 404);
    $pdo->prepare('UPDATE feature_settings SET enabled=?,updated_by=? WHERE feature_key=?')->execute([$enabled ? 1 : 0, (int)$admin['id'], $featureKey]);
    audit_log($pdo, (int)$admin['id'], 'feature.toggled', 'feature', $featureKey, ['enabled'=>(bool)$previous['enabled']], ['enabled'=>$enabled]);
    json_response(['ok' => true, 'key' => $featureKey, 'enabled' => $enabled]);
}

function handle_admin_users(PDO $pdo, array $query): never
{
    require_permission('users.view');
    $limit = max(1, min(100, (int)($query['limit'] ?? 50)));
    $status = valid_string($query['status'] ?? '', 40);
    $gender = valid_string($query['gender'] ?? '', 8);
    $where = [];
    $params = [];
    if (in_array($status, ['active','suspended','deleted'], true)) { $where[]='u.account_status=?'; $params[]=$status; }
    if (in_array($gender, ['male','female'], true)) { $where[]='u.gender=?'; $params[]=$gender; }
    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $stmt = $pdo->prepare('SELECT u.id,u.gender,u.account_status,u.verification_status,u.created_at,p.full_name,p.state,p.lga,p.profile_completion FROM users u JOIN profiles p ON p.user_id=u.id ' . $whereSql . ' ORDER BY u.created_at DESC LIMIT ' . $limit);
    $stmt->execute($params);
    json_response(['ok'=>true,'users'=>$stmt->fetchAll()]);
}

function handle_admin_roles(PDO $pdo, array $admin, string $method, array $data = []): never
{
    if ($method === 'GET') {
        require_permission('roles.view');
        $roles = $pdo->query('SELECT r.id,r.role_key,r.name,r.description,r.is_system,COUNT(DISTINCT ur.user_id) AS member_count FROM roles r LEFT JOIN user_roles ur ON ur.role_id=r.id GROUP BY r.id ORDER BY r.is_system DESC,r.name')->fetchAll();
        foreach ($roles as &$role) {
            $permissionStmt = $pdo->prepare('SELECT p.permission_key FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id WHERE rp.role_id=? ORDER BY p.permission_key');
            $permissionStmt->execute([(int)$role['id']]);
            $role['permissions'] = array_column($permissionStmt->fetchAll(), 'permission_key');
        }
        unset($role);
        json_response(['ok'=>true,'roles'=>$roles]);
    }
    if (!has_permission((int)$admin['id'], 'roles.create')) api_error('You do not have permission to create staff roles.', 403);
    $name = valid_string($data['name'] ?? '', 120, true);
    $description = valid_string($data['description'] ?? '', 500);
    $permissions = $data['permissions'] ?? [];
    if (!is_array($permissions) || count($permissions) > 80) api_error('Provide a valid list of permissions.', 422);
    $permissions = array_values(array_unique(array_filter(array_map(static fn($item): string => trim((string)$item), $permissions))));
    if (!$permissions) api_error('Choose at least one permission for the role.', 422);
    if (in_array('*', $permissions, true) && !has_permission((int)$admin['id'], '*')) api_error('Only Super Admin can assign wildcard access.', 403);
    $placeholders = implode(',', array_fill(0, count($permissions), '?'));
    $permissionStmt = $pdo->prepare("SELECT permission_key,id FROM permissions WHERE permission_key IN ({$placeholders})");
    $permissionStmt->execute($permissions);
    $permissionRows = $permissionStmt->fetchAll();
    if (count($permissionRows) !== count($permissions)) api_error('One or more permission keys are not recognised.', 422);
    $key = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '_', $name) ?? '', '_'));
    if ($key === '') api_error('Role name must include letters or numbers.', 422);
    try {
        $pdo->beginTransaction();
        $pdo->prepare('INSERT INTO roles (role_key,name,description,is_system,created_by) VALUES (?,?,?,0,?)')->execute([$key, $name, $description ?: null, (int)$admin['id']]);
        $roleId = (int)$pdo->lastInsertId();
        $assign = $pdo->prepare('INSERT INTO role_permissions (role_id,permission_id) VALUES (?,?)');
        foreach ($permissionRows as $permission) $assign->execute([$roleId, (int)$permission['id']]);
        audit_log($pdo, (int)$admin['id'], 'role.created', 'role', (string)$roleId, null, ['name'=>$name,'permissions'=>$permissions]);
        $pdo->commit();
    } catch (PDOException $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($error->getCode() === '23000') api_error('A role with this name already exists.', 409);
        throw $error;
    }
    json_response(['ok'=>true,'role_id'=>$roleId], 201);
}

function handle_role_assignment(PDO $pdo, array $admin, int $targetUserId, array $data): never
{
    if (!has_permission((int)$admin['id'],'permissions.manage') && !has_permission((int)$admin['id'],'roles.edit')) api_error('You do not have permission to assign roles.',403);
    $roleKey = valid_string($data['role_key'] ?? '',80,true);
    $operation = valid_string($data['operation'] ?? 'assign',20,true);
    if (!in_array($operation,['assign','revoke'],true)) api_error('Choose assign or revoke.',422);
    $target = $pdo->prepare('SELECT id,account_status FROM users WHERE id=? LIMIT 1');
    $target->execute([$targetUserId]);
    $member = $target->fetch();
    if (!$member || $member['account_status'] === 'deleted') api_error('The member account was not found.',404);
    $roleStmt = $pdo->prepare('SELECT id,role_key FROM roles WHERE role_key=? LIMIT 1');
    $roleStmt->execute([$roleKey]);
    $role = $roleStmt->fetch();
    if (!$role) api_error('The requested role was not found.',404);
    if ($roleKey === 'super_admin' && !has_permission((int)$admin['id'],'*')) api_error('Only a current Super Admin can assign the Super Admin role.',403);
    if ($operation === 'revoke' && $roleKey === 'super_admin') {
        $count = $pdo->prepare("SELECT COUNT(*) FROM user_roles ur JOIN roles r ON r.id=ur.role_id JOIN users u ON u.id=ur.user_id WHERE r.role_key='super_admin' AND u.account_status='active'");
        $count->execute();
        $assigned = $pdo->prepare('SELECT 1 FROM user_roles WHERE user_id=? AND role_id=?');
        $assigned->execute([$targetUserId,(int)$role['id']]);
        if ($assigned->fetchColumn() && (int)$count->fetchColumn() <= 1) api_error('You cannot revoke the last active Super Admin role.',409);
    }
    if ($operation === 'assign') {
        $pdo->prepare('INSERT IGNORE INTO user_roles (user_id,role_id,assigned_by) VALUES (?,?,?)')->execute([$targetUserId,(int)$role['id'],(int)$admin['id']]);
    } else {
        $pdo->prepare('DELETE FROM user_roles WHERE user_id=? AND role_id=?')->execute([$targetUserId,(int)$role['id']]);
    }
    audit_log($pdo,(int)$admin['id'],'role.' . $operation,'user_role',(string)$targetUserId,null,['role_key'=>$roleKey,'target_user_id'=>$targetUserId]);
    json_response(['ok'=>true,'operation'=>$operation,'user_id'=>$targetUserId,'role_key'=>$roleKey]);
}

function handle_matching_weights(PDO $pdo, array $admin, string $method, array $data = []): never
{
    if ($method === 'GET') {
        require_permission('matching.view');
        json_response(['ok'=>true,'weights'=>$pdo->query('SELECT weight_key,weight FROM matching_weights ORDER BY weight_key')->fetchAll()]);
    }
    if (!has_permission((int)$admin['id'], 'matching.manage') && !has_permission((int)$admin['id'], 'settings.manage')) api_error('You do not have permission to edit matching weights.', 403);
    $weights = $data['weights'] ?? null;
    if (!is_array($weights) || count($weights) !== 8) api_error('Provide all eight matching weights.', 422);
    $expected = ['age_compatibility','location','marriage_intention','education','religion_practice','shared_interests','languages','lifestyle'];
    $normalized = [];
    foreach ($expected as $key) {
        $value = filter_var($weights[$key] ?? null, FILTER_VALIDATE_FLOAT);
        if ($value === false || $value < 0 || $value > 100) api_error('Each matching weight must be between 0 and 100.', 422);
        $normalized[$key] = (float)$value;
    }
    if (abs(array_sum($normalized) - 100.0) > 0.01) api_error('Matching weights must total exactly 100%.', 422);
    $before = matching_weights($pdo);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('UPDATE matching_weights SET weight=?,updated_by=? WHERE weight_key=?');
        foreach ($normalized as $key=>$value) $stmt->execute([$value,(int)$admin['id'],$key]);
        audit_log($pdo,(int)$admin['id'],'matching.weights_updated','matching_weights','global',$before,$normalized);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
    json_response(['ok'=>true,'weights'=>$normalized]);
}

function payment_setting(PDO $pdo, string $provider, string $field, bool $decrypt = false): string
{
    $stmt = $pdo->prepare('SELECT setting_value,is_secret FROM system_settings WHERE setting_key=? LIMIT 1');
    $stmt->execute(["payment.{$provider}.{$field}"]);
    $row = $stmt->fetch();
    if (!$row || $row['setting_value'] === null || $row['setting_value'] === '') return '';
    if ($decrypt && (int)$row['is_secret'] === 1) return decrypt_secret((string)$row['setting_value']);
    return (string)$row['setting_value'];
}

function save_payment_setting(PDO $pdo, int $adminId, string $provider, string $field, string $value, bool $secret): void
{
    $stored = $value === '' ? null : ($secret ? encrypt_secret($value) : $value);
    $stmt = $pdo->prepare('INSERT INTO system_settings (setting_key,setting_value,is_secret,updated_by) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value),is_secret=VALUES(is_secret),updated_by=VALUES(updated_by),updated_at=UTC_TIMESTAMP()');
    $stmt->execute(["payment.{$provider}.{$field}",$stored,$secret ? 1 : 0,$adminId]);
}

function handle_payment_settings(PDO $pdo, array $admin, string $method, array $data = []): never
{
    if ($method === 'GET') {
        require_permission('settings.view');
        $providers = [];
        foreach (['paystack','flutterwave'] as $provider) {
            $public = payment_setting($pdo,$provider,'public_key');
            $secret = payment_setting($pdo,$provider,'secret_key');
            $webhook = payment_setting($pdo,$provider,'webhook_secret');
            $providers[$provider] = [
                'public_key' => $public,
                'secret_configured' => $secret !== '',
                'webhook_secret_configured' => $webhook !== '',
                'encryption_key_configured' => $provider === 'flutterwave' ? payment_setting($pdo,$provider,'encryption_key') !== '' : null,
            ];
        }
        json_response(['ok'=>true,'providers'=>$providers]);
    }
    if (!has_permission((int)$admin['id'],'settings.manage')) api_error('You do not have permission to manage payment provider settings.',403);
    $provider = valid_string($data['provider'] ?? '',20,true);
    if (!in_array($provider,['paystack','flutterwave'],true)) api_error('Choose Paystack or Flutterwave.',422);
    $public = valid_string($data['public_key'] ?? '',300);
    $secret = valid_string($data['secret_key'] ?? '',500);
    $webhook = valid_string($data['webhook_secret'] ?? '',500);
    if ($public !== '') save_payment_setting($pdo,(int)$admin['id'],$provider,'public_key',$public,false);
    if ($secret !== '') save_payment_setting($pdo,(int)$admin['id'],$provider,'secret_key',$secret,true);
    if ($webhook !== '') save_payment_setting($pdo,(int)$admin['id'],$provider,'webhook_secret',$webhook,true);
    if ($provider === 'flutterwave') {
        $encryptionKey = valid_string($data['encryption_key'] ?? '',500);
        if ($encryptionKey !== '') save_payment_setting($pdo,(int)$admin['id'],$provider,'encryption_key',$encryptionKey,true);
    }
    audit_log($pdo,(int)$admin['id'],'payment_provider.settings_updated','payment_provider',$provider,null,['public_key_configured'=>$public !== '','secret_key_updated'=>$secret !== '','webhook_secret_updated'=>$webhook !== '']);
    json_response(['ok'=>true,'message'=>'Provider configuration saved securely. Secret values are write-only.']);
}

function provider_request(string $method, string $url, array $headers, ?array $payload = null): array
{
    if (!function_exists('curl_init')) throw new RuntimeException('The cURL extension is required for payment provider requests.');
    $curl = curl_init($url);
    $requestHeaders = array_merge(['Accept: application/json'], $headers);
    $options = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => strtoupper($method),
        CURLOPT_HTTPHEADER => $requestHeaders,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ];
    if ($payload !== null) {
        $options[CURLOPT_POSTFIELDS] = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $options[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
    }
    curl_setopt_array($curl, $options);
    $body = curl_exec($curl);
    $status = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    if ($body === false || $status < 200 || $status >= 300) throw new RuntimeException('Payment provider request failed.' . ($error ? ' ' . $error : ''));
    $decoded = json_decode((string)$body,true);
    if (!is_array($decoded)) throw new RuntimeException('Payment provider returned an invalid response.');
    return $decoded;
}

function app_base_url(): string
{
    $config = require dirname(__DIR__) . '/backend/config.php';
    $configured = trim((string)($config['app_url'] ?? ''));
    if ($configured !== '') return rtrim($configured,'/');
    $https = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') ? 'https' : 'http';
    return $https . '://' . (string)($_SERVER['HTTP_HOST'] ?? 'localhost');
}

function handle_payment_initialize(PDO $pdo, array $user, array $data): never
{
    require_feature('premium_membership');
    if (empty($user['contact_verified_at'])) api_error('Verify your contact details before starting a subscription.',403);
    $provider = valid_string($data['provider'] ?? '',20,true);
    if (!in_array($provider,['paystack','flutterwave'],true)) api_error('Choose Paystack or Flutterwave.',422);
    $planKey = valid_string($data['plan_key'] ?? '',80,true);
    $planStmt = $pdo->prepare('SELECT id,plan_key,name,amount_minor,currency,duration_days FROM subscription_plans WHERE plan_key=? AND enabled=1 LIMIT 1');
    $planStmt->execute([$planKey]);
    $plan = $planStmt->fetch();
    if (!$plan || (int)$plan['amount_minor'] < 1) api_error('Subscription plan is not available for payment.',404);
    if (empty($user['email'])) api_error('Add and verify an email address before paying for a subscription.',422);
    $publicKey = payment_setting($pdo,$provider,'public_key');
    $secret = payment_setting($pdo,$provider,'secret_key',true);
    if ($publicKey === '' || $secret === '') api_error('This payment provider is not configured yet.',503);
    $profile = $pdo->prepare('SELECT full_name FROM profiles WHERE user_id=?');
    $profile->execute([(int)$user['id']]);
    $fullName = (string)$profile->fetchColumn();
    $reference = 'HLM-' . gmdate('YmdHis') . '-' . strtoupper(bin2hex(random_bytes(5)));
    $pdo->beginTransaction();
    try {
        $sub = $pdo->prepare('INSERT INTO subscriptions (user_id,plan_id,status,provider) VALUES (?,? ,\'pending\',?)');
        $sub->execute([(int)$user['id'],(int)$plan['id'],$provider]);
        $subscriptionId = (int)$pdo->lastInsertId();
        $payment = $pdo->prepare('INSERT INTO payments (user_id,subscription_id,amount_minor,currency,provider,provider_reference,status,metadata) VALUES (?,?,?,?,?,?,\'pending\',?)');
        $payment->execute([(int)$user['id'],$subscriptionId,(int)$plan['amount_minor'],$plan['currency'],$provider,$reference,json_encode(['plan_key'=>$planKey])]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
    try {
        if ($provider === 'paystack') {
            $response = provider_request('POST','https://api.paystack.co/transaction/initialize',['Authorization: Bearer ' . $secret],[
                'email'=>$user['email'],'amount'=>(int)$plan['amount_minor'],'currency'=>$plan['currency'],'reference'=>$reference,
                'callback_url'=>app_base_url() . '/?payment=complete','metadata'=>['user_id'=>(int)$user['id'],'subscription_id'=>$subscriptionId,'plan_key'=>$planKey],
            ]);
            $url = $response['data']['authorization_url'] ?? null;
            if (($response['status'] ?? false) !== true || !is_string($url)) throw new RuntimeException('Paystack did not return a checkout link.');
        } else {
            $response = provider_request('POST','https://api.flutterwave.com/v3/payments',['Authorization: Bearer ' . $secret],[
                'tx_ref'=>$reference,'amount'=>number_format((int)$plan['amount_minor']/100,2,'.',''),'currency'=>$plan['currency'],
                'redirect_url'=>app_base_url() . '/?payment=complete','customer'=>['email'=>$user['email'],'name'=>$fullName],
                'customizations'=>['title'=>'HalalMatchmaking','description'=>$plan['name'],'logo'=>app_base_url() . '/assets/images/halal-mark.svg'],
                'meta'=>['user_id'=>(int)$user['id'],'subscription_id'=>$subscriptionId,'plan_key'=>$planKey],
            ]);
            $url = $response['data']['link'] ?? null;
            if (($response['status'] ?? '') !== 'success' || !is_string($url)) throw new RuntimeException('Flutterwave did not return a checkout link.');
        }
    } catch (Throwable $error) {
        $pdo->prepare('UPDATE payments SET status=\'failed\' WHERE provider_reference=?')->execute([$reference]);
        $pdo->prepare('UPDATE subscriptions SET status=\'cancelled\' WHERE id=?')->execute([$subscriptionId]);
        api_error('Could not start the payment with the selected provider. Please try again later.',502);
    }
    json_response(['ok'=>true,'checkout_url'=>$url,'reference'=>$reference,'provider'=>$provider]);
}

function verify_provider_transaction(PDO $pdo, string $provider, string $reference, string $providerTransactionId): array
{
    $secret = payment_setting($pdo,$provider,'secret_key',true);
    if ($secret === '') throw new RuntimeException('Payment provider secret is not configured.');
    if ($provider === 'paystack') {
        $verified = provider_request('GET','https://api.paystack.co/transaction/verify/' . rawurlencode($reference),['Authorization: Bearer ' . $secret]);
        $data = $verified['data'] ?? [];
        if (($verified['status'] ?? false) !== true || ($data['status'] ?? '') !== 'success' || ($data['reference'] ?? '') !== $reference) throw new RuntimeException('Paystack transaction did not verify successfully.');
        return ['amount'=>(int)($data['amount'] ?? 0),'currency'=>(string)($data['currency'] ?? ''),'reference'=>(string)($data['reference'] ?? ''),'transaction_id'=>(string)($data['id'] ?? $providerTransactionId)];
    }
    $id = filter_var($providerTransactionId,FILTER_VALIDATE_INT);
    if ($id === false || (int)$id < 1) throw new RuntimeException('Flutterwave transaction ID is invalid.');
    $verified = provider_request('GET','https://api.flutterwave.com/v3/transactions/' . (int)$id . '/verify',['Authorization: Bearer ' . $secret]);
    $data = $verified['data'] ?? [];
    if (($verified['status'] ?? '') !== 'success' || ($data['status'] ?? '') !== 'successful' || ($data['tx_ref'] ?? '') !== $reference) throw new RuntimeException('Flutterwave transaction did not verify successfully.');
    return ['amount'=>(int)round(((float)($data['amount'] ?? 0))*100),'currency'=>(string)($data['currency'] ?? ''),'reference'=>(string)($data['tx_ref'] ?? ''),'transaction_id'=>(string)($data['id'] ?? $id)];
}

function handle_payment_webhook(PDO $pdo, string $provider): never
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '' || strlen($raw) > 1048576) api_error('Invalid webhook body.',413);
    $signature = (string)($_SERVER[$provider === 'paystack' ? 'HTTP_X_PAYSTACK_SIGNATURE' : 'HTTP_VERIF_HASH'] ?? '');
    $webhookSecret = payment_setting($pdo,$provider,'webhook_secret',true);
    $providerSecret = payment_setting($pdo,$provider,'secret_key',true);
    $signatureSecret = $provider === 'paystack' ? ($providerSecret ?: $webhookSecret) : $webhookSecret;
    if ($signatureSecret === '') api_error('Webhook verification is not configured.',503);
    $expected = $provider === 'paystack' ? hash_hmac('sha512',$raw,$signatureSecret) : $signatureSecret;
    if ($signature === '' || !hash_equals($expected,$signature)) {
        $pdo->prepare('INSERT INTO payment_webhooks (provider,event_id,payload_hash,signature_valid,processing_status) VALUES (?,NULL,?,0,\'rejected\')')->execute([$provider,hash('sha256',$raw)]);
        api_error('Webhook signature is invalid.',401);
    }
    $payload = json_decode($raw,true);
    if (!is_array($payload)) api_error('Webhook payload is invalid.',400);
    $event = (string)($payload['event'] ?? $payload['type'] ?? '');
    $data = $payload['data'] ?? [];
    $reference = $provider === 'paystack' ? (string)($data['reference'] ?? '') : (string)($data['tx_ref'] ?? '');
    $providerTransactionId = (string)($data['id'] ?? $reference);
    $eventId = substr($provider . ':' . ($providerTransactionId ?: hash('sha256',$raw)),0,180);
    try {
        $pdo->prepare('INSERT INTO payment_webhooks (provider,event_id,payload_hash,signature_valid,processing_status) VALUES (?,?,?,1,\'received\')')->execute([$provider,$eventId,hash('sha256',$raw)]);
    } catch (PDOException $error) {
        if ($error->getCode() === '23000') json_response(['ok'=>true,'duplicate'=>true]);
        throw $error;
    }
    $webhookId = (int)$pdo->lastInsertId();
    $successfulEvent = $provider === 'paystack' ? $event === 'charge.success' : in_array($event,['charge.completed','transfer.completed'],true);
    if (!$successfulEvent || $reference === '') {
        $pdo->prepare('UPDATE payment_webhooks SET processing_status=\'verified\',response_code=200 WHERE id=?')->execute([$webhookId]);
        json_response(['ok'=>true,'received'=>true]);
    }
    try {
        $verified = verify_provider_transaction($pdo,$provider,$reference,$providerTransactionId);
        $pdo->beginTransaction();
        $pending = $pdo->prepare('SELECT id,user_id,subscription_id,amount_minor,currency,status FROM payments WHERE provider=? AND provider_reference=? FOR UPDATE');
        $pending->execute([$provider,$reference]);
        $payment = $pending->fetch();
        if (!$payment || $payment['status'] !== 'pending' || (int)$payment['amount_minor'] !== (int)$verified['amount'] || $payment['currency'] !== $verified['currency'] || $verified['reference'] !== $reference) {
            $pdo->prepare('UPDATE payment_webhooks SET processing_status=\'rejected\',response_code=202 WHERE id=?')->execute([$webhookId]);
            $pdo->commit();
            json_response(['ok'=>true,'received'=>true,'payment_activated'=>false],202);
        }
        $pdo->prepare('UPDATE payments SET status=\'successful\',verified_at=UTC_TIMESTAMP(),metadata=JSON_SET(COALESCE(metadata,JSON_OBJECT()),\'$.provider_transaction_id\',?) WHERE id=?')->execute([$verified['transaction_id'],(int)$payment['id']]);
        if ($payment['subscription_id']) {
            $duration = $pdo->prepare('SELECT sp.duration_days FROM subscriptions s JOIN subscription_plans sp ON sp.id=s.plan_id WHERE s.id=?');
            $duration->execute([(int)$payment['subscription_id']]);
            $days = max(1,(int)$duration->fetchColumn());
            $pdo->prepare('UPDATE subscriptions SET status=\'active\',starts_at=UTC_TIMESTAMP(),ends_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? DAY) WHERE id=?')->execute([$days,(int)$payment['subscription_id']]);
        }
        $pdo->prepare('UPDATE payment_webhooks SET processing_status=\'verified\',response_code=200 WHERE id=?')->execute([$webhookId]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $pdo->prepare('UPDATE payment_webhooks SET processing_status=\'failed\',response_code=202 WHERE id=?')->execute([$webhookId]);
        error_log('Payment webhook verification failed: ' . $error->getMessage());
        json_response(['ok'=>true,'received'=>true,'payment_activated'=>false],202);
    }
    json_response(['ok'=>true,'received'=>true,'payment_activated'=>true]);
}

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$route = trim((string)($_GET['route'] ?? ''), '/');

try {
    $pdo = db();
    if (in_array($route, ['webhooks/paystack','webhooks/flutterwave'], true)) {
        request_method('POST');
        handle_payment_webhook($pdo, str_ends_with($route,'paystack') ? 'paystack' : 'flutterwave');
    }
    if ($method !== 'GET') {
        require_same_origin();
        require_csrf();
    }

    if ($route === 'session' && $method === 'GET') {
        $user = current_user();
        $pendingUser = !empty($_SESSION['pending_user_id']);
        $pendingAdmin = !empty($_SESSION['pending_admin_user_id']);
        json_response([
            'ok'=>true,
            'csrf_token'=>$_SESSION['csrf_token'] ?? '',
            'user'=>$user ? safe_user_payload($pdo,$user) : null,
            'pending_contact_verification'=>$pendingUser,
            'pending_admin_two_factor'=>$pendingAdmin,
            'features'=>feature_snapshot(),
        ]);
    }
    if ($route === 'register' && $method === 'POST') handle_registration($pdo, request_data());
    if ($route === 'login' && $method === 'POST') handle_login($pdo, request_data());
    if ($route === 'logout' && $method === 'POST') handle_logout();

    if ($route === 'contact/otp/request' && $method === 'POST') {
        rate_limit('auth.otp.request',6,900);
        $userId = (int)($_SESSION['pending_user_id'] ?? 0);
        if (!$userId && current_user()) $userId = (int)current_user()['id'];
        if (!$userId) api_error('Start registration or sign in before requesting a code.',401);
        $channel = (string)(request_data()['channel'] ?? 'email');
        $sent = create_contact_otp($pdo,$userId,$channel);
        if (!$sent) api_error('OTP delivery is not configured for this contact method. Ask the platform administrator to enable email or SMS delivery.',503);
        json_response(['ok'=>true,'message'=>'A new verification code was sent.']);
    }
    if ($route === 'contact/otp/verify' && $method === 'POST') {
        rate_limit('auth.otp.verify',12,900);
        $userId = (int)($_SESSION['pending_user_id'] ?? 0);
        if (!$userId) api_error('There is no account waiting for contact verification.',401);
        $result = verify_contact_otp($pdo,$userId,(string)(request_data()['code'] ?? ''));
        json_response(['ok'=>true] + $result);
    }
    if ($route === 'auth/admin-2fa/setup' && $method === 'POST') handle_admin_totp_setup($pdo);
    if ($route === 'auth/admin-2fa/verify-setup' && $method === 'POST') handle_admin_totp_confirm($pdo,request_data(),true);
    if ($route === 'auth/admin-2fa/verify' && $method === 'POST') handle_admin_totp_confirm($pdo,request_data(),false);

    if ($route === 'profile' && $method === 'GET') {
        $user = require_auth();
        json_response(['ok'=>true,'user'=>safe_user_payload($pdo,$user)]);
    }
    if ($route === 'profile' && $method === 'POST') handle_profile_update($pdo,request_data());
    if ($route === 'profile/photos' && $method === 'POST') handle_profile_photo_upload($pdo);
    if (preg_match('#^profile-photos/(\\d+)$#',$route,$matches) && $method === 'GET') handle_profile_photo_media($pdo,require_auth(),(int)$matches[1]);
    if ($route === 'discover' && $method === 'GET') handle_discovery($pdo,$_GET);
    if ($route === 'likes' && $method === 'GET') handle_list_likes($pdo,$_GET);
    if ($route === 'likes' && $method === 'POST') handle_create_like($pdo,request_data());
    if ($route === 'blocks' && $method === 'POST') handle_block($pdo,require_auth(),request_data());
    if ($route === 'reports' && $method === 'POST') handle_report($pdo,require_auth(),request_data());
    if ($route === 'conversations' && $method === 'GET') handle_conversations($pdo,require_auth());
    if (preg_match('#^conversations/(\d+)/messages$#',$route,$matches)) {
        $user = require_auth();
        if ($method === 'GET') handle_conversation_messages($pdo,$user,(int)$matches[1],'GET');
        if ($method === 'POST') handle_conversation_messages($pdo,$user,(int)$matches[1],'POST',request_data());
    }
    if ($route === 'community' && $method === 'GET') handle_community_feed($pdo,$_GET);
    if ($route === 'community/posts' && $method === 'POST') handle_create_community_post($pdo,request_data());
    if (preg_match('#^community/posts/(\d+)/reaction$#',$route,$matches) && $method === 'POST') {
        $user = require_auth();
        handle_community_reaction($pdo,$user,(int)$matches[1],'like');
    }
    if (preg_match('#^community/posts/(\d+)/comments$#',$route,$matches) && $method === 'POST') {
        $user = require_auth();
        handle_community_reaction($pdo,$user,(int)$matches[1],'comment',request_data());
    }
    if ($route === 'verification/submit' && $method === 'POST') handle_submit_verification($pdo);

    if ($route === 'admin/dashboard' && $method === 'GET') handle_admin_dashboard($pdo);
    if ($route === 'admin/users' && $method === 'GET') handle_admin_users($pdo,$_GET);
    if ($route === 'admin/verifications' && $method === 'GET') handle_admin_verification_list($pdo,$_GET);
    if ($route === 'admin/profile-photos' && $method === 'GET') handle_admin_profile_photos($pdo);
    if (preg_match('#^admin/profile-photos/(\\d+)/media$#',$route,$matches) && $method === 'GET') handle_admin_profile_photo_media($pdo,(int)$matches[1]);
    if (preg_match('#^admin/profile-photos/(\\d+)/review$#',$route,$matches) && $method === 'POST') handle_admin_profile_photo_review($pdo,require_auth(),(int)$matches[1],request_data());
    if (preg_match('#^admin/verifications/(\d+)/review$#',$route,$matches) && $method === 'POST') {
        $admin = require_auth();
        handle_verification_review($pdo,$admin,(int)$matches[1],request_data());
    }
    if (preg_match('#^admin/verifications/(\d+)/video$#',$route,$matches) && $method === 'GET') {
        $admin = require_auth();
        handle_private_verification_video($pdo,$admin,(int)$matches[1]);
    }
    if ($route === 'admin/features' && $method === 'GET') handle_feature_settings($pdo);
    if (preg_match('#^admin/features/([a-z0-9_]+)$#',$route,$matches) && in_array($method,['POST','PUT'],true)) {
        $admin = require_auth();
        handle_feature_update($pdo,$admin,$matches[1],request_data());
    }
    if ($route === 'admin/roles' && in_array($method,['GET','POST'],true)) {
        $admin = require_auth();
        handle_admin_roles($pdo,$admin,$method,$method === 'POST' ? request_data() : []);
    }
    if (preg_match('#^admin/users/(\\d+)/roles$#',$route,$matches) && $method === 'POST') handle_role_assignment($pdo,require_auth(),(int)$matches[1],request_data());
    if ($route === 'admin/matching/weights' && in_array($method,['GET','PUT'],true)) {
        $admin = require_auth();
        handle_matching_weights($pdo,$admin,$method,$method === 'PUT' ? request_data() : []);
    }
    if ($route === 'admin/payment-settings' && in_array($method,['GET','PUT'],true)) {
        $admin = require_auth();
        handle_payment_settings($pdo,$admin,$method,$method === 'PUT' ? request_data() : []);
    }
    if ($route === 'payments/initialize' && $method === 'POST') handle_payment_initialize($pdo,require_auth(),request_data());

    api_error('API route was not found.',404);
} catch (ApiError $error) {
    api_error($error->getMessage(),$error->status);
} catch (Throwable $error) {
    error_log('HalalMatch API error: ' . $error->getMessage() . ' in ' . $error->getFile() . ':' . $error->getLine());
    $config = require dirname(__DIR__) . '/backend/config.php';
    $message = $config['app_env'] === 'local' ? $error->getMessage() : 'Something went wrong. Please try again later.';
    api_error($message,500);
}

function handle_profile_photo_upload(PDO $pdo): never
{
    $user = require_auth();
    if ($user['account_status'] !== 'active' || empty($user['contact_verified_at'])) api_error('Verify your contact details before uploading profile photos.',403);
    [$file,$mime] = require_uploaded_file('photo',10485760,['image/jpeg','image/png','image/webp']);
    $extension = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$mime];
    $relative = save_private_upload($file,$mime,'profile-photos',$extension);
    $stmt = $pdo->prepare('INSERT INTO profile_photos (user_id,storage_path,is_primary,review_status) VALUES (?,?,0,\'pending\')');
    $stmt->execute([(int)$user['id'],$relative]);
    $photoId = (int)$pdo->lastInsertId();
    audit_log($pdo,(int)$user['id'],'profile.photo_submitted','profile_photo',(string)$photoId,null,['review_status'=>'pending']);
    json_response(['ok'=>true,'photo_id'=>$photoId,'review_status'=>'pending'],201);
}

function stream_private_media(PDO $pdo, string $relative, string $auditAction, string $targetType, string $targetId, ?int $actorId = null): never
{
    $path = resolve_private_upload($relative);
    if ($actorId) audit_log($pdo,$actorId,$auditAction,$targetType,$targetId,null,null);
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($path) ?: 'application/octet-stream';
    session_write_close();
    http_response_code(200);
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: inline; filename="private-media.' . pathinfo($path,PATHINFO_EXTENSION) . '"');
    header('Cache-Control: no-store, private, max-age=0');
    header('Content-Security-Policy: default-src \'none\'; img-src \'self\'; media-src \'self\'; sandbox');
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
}

function handle_profile_photo_media(PDO $pdo, array $viewer, int $photoId): never
{
    $stmt = $pdo->prepare('SELECT ph.id,ph.user_id,ph.storage_path,ph.review_status,u.gender,u.account_status,u.verification_status FROM profile_photos ph JOIN users u ON u.id=ph.user_id WHERE ph.id=? LIMIT 1');
    $stmt->execute([$photoId]);
    $photo = $stmt->fetch();
    if (!$photo) api_error('Profile photo was not found.',404);
    $isOwner = (int)$photo['user_id'] === (int)$viewer['id'];
    if ($isOwner) {
        if ($photo['review_status'] === 'rejected') api_error('This photo is not available.',404);
    } else {
        if ($photo['review_status'] !== 'approved') api_error('Profile photo was not found.',404);
        assert_discovery_pair($viewer,$photo);
    }
    stream_private_media($pdo,(string)$photo['storage_path'],'profile.photo_viewed','profile_photo',(string)$photoId,null);
}

function handle_admin_profile_photo_review(PDO $pdo, array $admin, int $photoId, array $data): never
{
    $decision = valid_string($data['decision'] ?? '',20,true);
    if (!in_array($decision,['approve','reject'],true)) api_error('Choose approve or reject.',422);
    $permission = $decision === 'approve' ? 'verification.approve' : 'verification.reject';
    if (!has_permission((int)$admin['id'],$permission)) api_error('You do not have permission to review profile photos.',403);
    $reason = valid_string($data['reason'] ?? '',1000);
    if ($decision === 'reject' && text_length($reason) < 4) api_error('Provide a reason for rejecting this photo.',422);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT id,user_id,review_status,is_primary FROM profile_photos WHERE id=? FOR UPDATE');
        $stmt->execute([$photoId]);
        $photo = $stmt->fetch();
        if (!$photo) { $pdo->rollBack(); api_error('Profile photo was not found.',404); }
        $status = $decision === 'approve' ? 'approved' : 'rejected';
        $primary = (int)$photo['is_primary'];
        if ($decision === 'approve') {
            $lockUser = $pdo->prepare('SELECT id FROM users WHERE id=? FOR UPDATE');
            $lockUser->execute([(int)$photo['user_id']]);
            $existing = $pdo->prepare('SELECT id FROM profile_photos WHERE user_id=? AND is_primary=1 AND review_status=\'approved\' AND id<>? LIMIT 1');
            $existing->execute([(int)$photo['user_id'],$photoId]);
            if (!$existing->fetchColumn()) $primary = 1;
        } else $primary = 0;
        $pdo->prepare('UPDATE profile_photos SET review_status=?,is_primary=? WHERE id=?')->execute([$status,$primary,$photoId]);
        audit_log($pdo,(int)$admin['id'],'profile.photo_' . $decision,'profile_photo',(string)$photoId,['review_status'=>$photo['review_status'],'is_primary'=>(int)$photo['is_primary']],['review_status'=>$status,'is_primary'=>$primary,'reason'=>$reason ?: null]);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
    json_response(['ok'=>true,'photo_id'=>$photoId,'review_status'=>$status,'is_primary'=>(bool)$primary]);
}

function handle_admin_profile_photos(PDO $pdo): never
{
    require_permission('verification.view');
    $stmt = $pdo->query('SELECT ph.id,ph.user_id,ph.is_primary,ph.review_status,ph.created_at,p.full_name,u.gender,p.state,p.lga FROM profile_photos ph JOIN users u ON u.id=ph.user_id JOIN profiles p ON p.user_id=u.id WHERE ph.review_status=\'pending\' ORDER BY ph.created_at ASC LIMIT 100');
    json_response(['ok'=>true,'photos'=>$stmt->fetchAll()]);
}

function handle_admin_profile_photo_media(PDO $pdo, int $photoId): never
{
    $admin = require_permission('verification.view');
    $stmt = $pdo->prepare('SELECT storage_path,review_status FROM profile_photos WHERE id=? LIMIT 1');
    $stmt->execute([$photoId]);
    $row = $stmt->fetch();
    if (!$row) api_error('Profile photo was not found.',404);
    stream_private_media($pdo,(string)$row['storage_path'],'profile.photo_reviewed','profile_photo',(string)$photoId,(int)$admin['id']);
}
