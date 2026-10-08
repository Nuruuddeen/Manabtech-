<?php
declare(strict_types=1);

return [
    'app_env' => getenv('APP_ENV') ?: 'production',
    'app_key' => getenv('APP_KEY') ?: '',
    'db_dsn' => getenv('DB_DSN') ?: 'mysql:host=127.0.0.1;dbname=halalmatch;charset=utf8mb4',
    'db_user' => getenv('DB_USER') ?: 'halalmatch',
    'db_pass' => getenv('DB_PASS') ?: '',
    'app_url' => getenv('APP_URL') ?: '',
    'private_storage_path' => getenv('PRIVATE_STORAGE_PATH') ?: dirname(__DIR__) . '/private-storage',
    'max_video_bytes' => (int)(getenv('MAX_VERIFICATION_VIDEO_BYTES') ?: 104857600),
    'mail_from' => getenv('MAIL_FROM') ?: 'no-reply@halalmatch.example',
    'sms_adapter_path' => getenv('SMS_ADAPTER_PATH') ?: '',
    'force_secure_cookies' => getenv('FORCE_SECURE_COOKIES') === '1',
];
