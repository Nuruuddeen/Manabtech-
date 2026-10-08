# HalalMatch matchmaking platform

This repository contains a responsive HTML/CSS/JavaScript prototype and a raw PHP API backed by MySQL. The UI can be explored without a backend, but accounts, matching, moderation, private uploads and payments require the PHP API and configured services.

## Prerequisites

- PHP 8.1+ with **PDO MySQL**, `fileinfo`, `openssl`, `sodium`, and `cURL` enabled. `mbstring` is recommended.
- MySQL 8.0+ (InnoDB, JSON columns, and CHECK constraints).
- A web server configured to serve `public/` as the document root. Do not expose the repository root or `private-storage/` over HTTP.
- For real OTP delivery: PHP `mail()` with a working mail transfer agent, or a server-side SMS adapter (see below).

## Local setup

1. Create a database and a dedicated database user. For example:

   ```sql
   CREATE DATABASE halalmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'halalmatch'@'127.0.0.1' IDENTIFIED BY 'use-a-unique-database-password';
   GRANT ALL PRIVILEGES ON halalmatch.* TO 'halalmatch'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```

2. Import the schema (includes default roles, permissions, feature flags, matching weights, and subscription plans):

   ```sh
   mysql -u halalmatch -p halalmatch < backend/schema.sql
   ```

3. Set the server environment. Keep these values in your host's secret manager or an untracked environment file; never put secrets in `public/` or commit them. `APP_KEY` must be a stable random value of at least 32 characters and must not be rotated without re-encrypting stored provider secrets.

   ```sh
   export APP_ENV=local
   export APP_KEY="$(php -r 'echo bin2hex(random_bytes(32));')"
   export DB_DSN='mysql:host=127.0.0.1;dbname=halalmatch;charset=utf8mb4'
   export DB_USER=halalmatch
   export DB_PASS='your-database-password'
   export APP_URL='http://localhost:8000'
   export PRIVATE_STORAGE_PATH='/srv/halalmatch/private-storage'
   export MAX_VERIFICATION_VIDEO_BYTES=104857600
   export MAIL_FROM='no-reply@your-domain.example'
   export FORCE_SECURE_COOKIES=0
   ```

   The default private storage path is the repository's `private-storage/` directory, outside `public/`. Prefer a dedicated directory with restrictive filesystem permissions in production. The application creates upload subdirectories with private permissions. Keep the same `APP_KEY` for the lifetime of encrypted payment settings and authenticator secrets. For production, set `APP_ENV=production`, use an HTTPS `APP_URL`, and set `FORCE_SECURE_COOKIES=1`; do not use the local HTTP cookie settings shown above.

4. Create the first administrator from the command line. The password is not stored in source code and must be unique and at least 16 characters.

   ```sh
   export SUPER_ADMIN_EMAIL='admin@your-domain.example'
   export SUPER_ADMIN_PASSWORD='a-long-unique-password-of-at-least-16-chars'
   php backend/seed.php
   unset SUPER_ADMIN_PASSWORD
   ```

   On first administrator sign-in, the app requires TOTP authenticator enrollment before it opens the admin workspace. Save the authenticator recovery information according to your organization's security policy.

5. Start a **development-only** PHP server:

   ```sh
   php -S 0.0.0.0:8000 -t public
   ```

   Visit `http://localhost:8000/`. For production, use HTTPS and a maintained PHP web server/runtime rather than PHP's built-in server.

## OTP delivery

Email verification calls PHP's `mail()` function using `MAIL_FROM`; the host must have a working MTA or a mail transport integration. SMS is deliberately not tied to a provider. To enable it, implement a server-side function named `halal_send_sms(string $destination, string $message): bool` in a trusted PHP adapter and set `SMS_ADAPTER_PATH` to its absolute path. The API loads that file only when sending SMS. Do not include provider credentials in JavaScript. Until delivery is configured, registration records the account but reports that OTP delivery is unavailable; the member must request a fresh code after delivery is enabled.

## Private uploads and PHP limits

Verification videos and profile photos are stored outside the public web root and streamed only through authenticated, permission-checked API routes. Configure the web server/PHP upload limits to match the app limit; for example, `upload_max_filesize=100M` and `post_max_size=120M`. Check available disk space, backups, retention and deletion policies before accepting real identity documents or videos. Do not add private uploads to Git or public object storage.

## Payment setup

An administrator with `settings.manage` can configure Paystack and Flutterwave public keys, secret keys, webhook secrets, and Flutterwave encryption keys under **Settings & audit → Payment providers**. Secret values are encrypted at rest using `APP_KEY`; they are write-only in the API. Configure each provider's webhook URL to:

- `https://your-domain.example/api.php?route=webhooks/paystack`
- `https://your-domain.example/api.php?route=webhooks/flutterwave`

Use the provider's live/test mode consistently, set the correct currency/plans, and verify webhook delivery, signatures, amount and currency in a provider sandbox before accepting payments. A checkout can start only for an enabled paid subscription plan and a member with an email address. Payment credentials and callbacks are not configured by this repository.

## Main API areas

All API requests use `public/api.php?route=...`. Non-GET requests require same-origin and CSRF protections. Authenticated endpoints use secure sessions and database-backed role/permission checks.

- `POST register`, `POST login`, `POST contact/otp/request`, `POST contact/otp/verify`, `POST logout`
- `GET profile`, `POST profile`, `POST profile/photos`, `POST verification/submit`
- `GET discover`, `GET/POST likes`, `GET conversations`, `POST conversations/{id}/messages`
- `GET community`, `POST community/posts`, community reactions/comments
- `GET admin/dashboard`, admin verification/photo review, users, feature settings, matching weights, roles and payment settings
- `POST payments/initialize` and signed Paystack/Flutterwave webhook routes

The schema also includes support, moderation, call, campaign, advertisement, notification, subscription, audit, rate-limit and login-activity tables for the broader platform. Not every operational workflow has a complete production UI or provider integration yet.

## Static preview and validation

The frontend can be served without PHP for a visual prototype:

```sh
python3 -m http.server 4173 --bind 0.0.0.0 --directory public
```

That static preview does **not** execute `api.php`, authenticate users, save data, deliver OTPs, stream uploads, or process payments. Production readiness requires running the PHP API against MySQL and completing tests with real PHP extensions and sandbox provider accounts.
