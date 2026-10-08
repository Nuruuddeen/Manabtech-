<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit("Not found\n");
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/http.php';
require_once __DIR__ . '/auth.php';

$email = strtolower(trim((string)(getenv('SUPER_ADMIN_EMAIL') ?: '')));
$password = (string)(getenv('SUPER_ADMIN_PASSWORD') ?: '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Set SUPER_ADMIN_EMAIL to a valid email address.\n");
    exit(2);
}
if (strlen($password) < 16) {
    fwrite(STDERR, "Set SUPER_ADMIN_PASSWORD to a unique password of at least 16 characters.\n");
    exit(2);
}

$pdo = db();
$pdo->beginTransaction();
try {
    $roleStmt = $pdo->prepare('SELECT id FROM roles WHERE role_key = ? LIMIT 1');
    $roleStmt->execute(['super_admin']);
    $roleId = $roleStmt->fetchColumn();
    if (!$roleId) {
        throw new RuntimeException('Default roles were not seeded. Import backend/schema.sql first.');
    }

    $existing = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $existing->execute([$email]);
    $userId = (int)$existing->fetchColumn();
    if ($userId > 0) {
        $pdo->prepare('UPDATE users SET password_hash = ?, contact_verified_at = COALESCE(contact_verified_at, UTC_TIMESTAMP()), account_status = \'active\' WHERE id = ?')
            ->execute([password_hash($password, PASSWORD_DEFAULT), $userId]);
        fwrite(STDOUT, "Updated the existing Super Admin account.\n");
    } else {
        $pdo->prepare('INSERT INTO users (email,password_hash,gender,date_of_birth,account_status,verification_status,contact_verified_at) VALUES (?,?,\'male\',\'1980-01-01\',\'active\',\'approved\',UTC_TIMESTAMP())')
            ->execute([$email, password_hash($password, PASSWORD_DEFAULT)]);
        $userId = (int)$pdo->lastInsertId();
        $pdo->prepare('INSERT INTO profiles (user_id,full_name,profile_completion,profile_visibility) VALUES (?,?,100,\'hidden\')')
            ->execute([$userId, 'HalalMatch Super Admin']);
        fwrite(STDOUT, "Created the Super Admin account.\n");
    }
    $pdo->prepare('INSERT IGNORE INTO user_roles (user_id,role_id) VALUES (?,?)')->execute([$userId,(int)$roleId]);
    audit_log($pdo,$userId,'seed.super_admin_account','user',(string)$userId,null,['role'=>'super_admin']);
    $pdo->commit();
    fwrite(STDOUT, "Administrator 2FA enrolment will be required on first sign-in.\n");
} catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
