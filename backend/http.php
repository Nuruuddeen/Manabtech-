<?php
declare(strict_types=1);

final class ApiError extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 400)
    {
        parent::__construct($message);
    }
}

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    $config = require __DIR__ . '/config.php';
    $https = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') || $config['force_secure_cookies'] || $config['app_env'] === 'production';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('halalmatch_session');
    session_start();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private, max-age=0');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function api_error(string $message, int $status = 400, array $extra = []): never
{
    json_response(['ok' => false, 'message' => $message] + $extra, $status);
}

function request_method(string $method): void
{
    if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== strtoupper($method)) {
        header('Allow: ' . strtoupper($method));
        api_error('Method not allowed.', 405);
    }
}

function request_data(): array
{
    $contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
    if (str_contains($contentType, 'application/json')) {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }
        try {
            $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            api_error('Request body must contain valid JSON.', 400);
        }
        if (!is_array($data)) {
            api_error('Request body must be a JSON object.', 400);
        }
        return $data;
    }
    return $_POST;
}

function require_csrf(): void
{
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $expected = (string)($_SESSION['csrf_token'] ?? '');
    if ($provided === '' || $expected === '' || !hash_equals($expected, $provided)) {
        api_error('Your session has expired. Refresh the page and try again.', 419);
    }
}

function require_same_origin(): void
{
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === '') {
        return;
    }
    $host = (string)($_SERVER['HTTP_HOST'] ?? '');
    $scheme = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') ? 'https' : 'http';
    $expected = $scheme . '://' . $host;
    if (!hash_equals(strtolower($expected), strtolower(rtrim($origin, '/')))) {
        api_error('Cross-origin requests are not accepted.', 403);
    }
}

function rate_limit(string $scope, int $limit, int $windowSeconds): void
{
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = hash('sha256', $scope . '|' . $ip);
    $now = time();
    $cutoff = $now - $windowSeconds;
    $stmt = db()->prepare(
        'INSERT INTO rate_limits (key_hash, bucket_started_at, hit_count) VALUES (?, ?, 1) '
        . 'ON DUPLICATE KEY UPDATE hit_count = IF(bucket_started_at < ?, 1, hit_count + 1), '
        . 'bucket_started_at = IF(bucket_started_at < ?, ?, bucket_started_at)'
    );
    $stmt->execute([$key, $now, $cutoff, $cutoff, $now]);
    $read = db()->prepare('SELECT hit_count FROM rate_limits WHERE key_hash = ?');
    $read->execute([$key]);
    if ((int)$read->fetchColumn() > $limit) {
        api_error('Too many attempts. Please wait a moment and try again.', 429);
    }
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function text_lower(string $value): string
{
    return function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);
}

function text_substr(string $value, int $start, int $length): string
{
    return function_exists('mb_substr') ? mb_substr($value, $start, $length, 'UTF-8') : substr($value, $start, $length);
}

function valid_string(mixed $value, int $maxLength, bool $required = false): string
{
    $value = trim((string)($value ?? ''));
    if ($required && $value === '') {
        api_error('Please complete all required fields.', 422);
    }
    if (text_length($value) > $maxLength) {
        api_error('One or more fields are longer than allowed.', 422);
    }
    return $value;
}

function valid_id(mixed $value): int
{
    if (!is_scalar($value) || filter_var((string)$value, FILTER_VALIDATE_INT) === false || (int)$value < 1) {
        api_error('A valid record ID is required.', 422);
    }
    return (int)$value;
}

function require_uploaded_file(string $key, int $maxBytes, array $allowedMimes): array
{
    if (!isset($_FILES[$key]) || !is_array($_FILES[$key])) {
        api_error('A verification video is required.', 422);
    }
    $file = $_FILES[$key];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        api_error('The uploaded file could not be received.', 422);
    }
    if ((int)($file['size'] ?? 0) < 1 || (int)$file['size'] > $maxBytes || !is_uploaded_file((string)$file['tmp_name'])) {
        api_error('The uploaded file is empty or exceeds the allowed size.', 413);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file((string)$file['tmp_name']);
    if (!is_string($mime) || !in_array($mime, $allowedMimes, true)) {
        api_error('The uploaded file type is not allowed.', 415);
    }
    return [$file, $mime];
}
