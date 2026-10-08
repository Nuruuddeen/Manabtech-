-- HalalMatchmaking · MySQL 8+ schema
-- Create a dedicated database first, then import this file.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NULL UNIQUE,
  phone VARCHAR(32) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  gender ENUM('male','female') NOT NULL,
  date_of_birth DATE NOT NULL,
  account_status ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
  verification_status ENUM('not_submitted','pending','under_review','approved','rejected','resubmission_requested') NOT NULL DEFAULT 'not_submitted',
  contact_verified_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_discovery (account_status, verification_status, gender),
  INDEX idx_users_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role_key VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  permission_key VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_assigner FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  state VARCHAR(80) NULL,
  lga VARCHAR(100) NULL,
  education VARCHAR(120) NULL,
  occupation VARCHAR(120) NULL,
  marital_status VARCHAR(60) NULL,
  religious_practice VARCHAR(100) NULL,
  languages JSON NULL,
  interests JSON NULL,
  about_me TEXT NULL,
  marriage_intention VARCHAR(180) NULL,
  profile_completion TINYINT UNSIGNED NOT NULL DEFAULT 0,
  profile_visibility ENUM('visible','hidden') NOT NULL DEFAULT 'visible',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_profiles_state (state),
  INDEX idx_profiles_visibility (profile_visibility)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile_preferences (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  preferred_gender ENUM('male','female','any') NULL,
  minimum_age TINYINT UNSIGNED NULL,
  maximum_age TINYINT UNSIGNED NULL,
  preferred_state VARCHAR(120) NULL,
  preferred_education VARCHAR(120) NULL,
  marriage_intention VARCHAR(180) NULL,
  preference_data JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_preferences_age CHECK (minimum_age IS NULL OR maximum_age IS NULL OR minimum_age <= maximum_age)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile_photos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  review_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_photos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_profile_photos_user_status (user_id, review_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS verification_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','under_review','approved','rejected','resubmission_requested') NOT NULL DEFAULT 'pending',
  video_storage_path VARCHAR(500) NOT NULL,
  selfie_storage_path VARCHAR(500) NULL,
  identity_data JSON NULL,
  id_document_storage_path VARCHAR(500) NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewer_id BIGINT UNSIGNED NULL,
  rejection_reason TEXT NULL,
  CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_verification_status_date (status, submitted_at),
  INDEX idx_verification_user (user_id, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS verification_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  reviewer_id BIGINT UNSIGNED NOT NULL,
  decision ENUM('approve','reject','request_resubmission','suspend') NOT NULL,
  reason TEXT NULL,
  review_data JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_reviews_request FOREIGN KEY (request_id) REFERENCES verification_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_verification_reviews_request (request_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_verifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  channel ENUM('email','sms') NOT NULL,
  destination VARCHAR(254) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_verifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_contact_verifications_user (user_id, channel, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_authenticators (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  secret_ciphertext TEXT NOT NULL,
  enabled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_verified_at DATETIME NULL,
  CONSTRAINT fk_admin_authenticator_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS likes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  from_user_id BIGINT UNSIGNED NOT NULL,
  to_user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_like_pair (from_user_id, to_user_id),
  CONSTRAINT fk_likes_from FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_to FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_likes_received (to_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matches (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_low_id BIGINT UNSIGNED NOT NULL,
  user_high_id BIGINT UNSIGNED NOT NULL,
  matched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active','ended','blocked') NOT NULL DEFAULT 'active',
  UNIQUE KEY uq_match_pair (user_low_id, user_high_id),
  CONSTRAINT fk_matches_low FOREIGN KEY (user_low_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_high FOREIGN KEY (user_high_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_matches_low_status (user_low_id, status),
  INDEX idx_matches_high_status (user_high_id, status),
  CONSTRAINT chk_match_order CHECK (user_low_id < user_high_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id BIGINT UNSIGNED NOT NULL,
  blocked_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT fk_blocks_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_blocks_blocked FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_blocks_blocked (blocked_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NOT NULL,
  target_type ENUM('user','message','community_post','community_comment','advertisement') NOT NULL,
  target_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(120) NOT NULL,
  details TEXT NULL,
  status ENUM('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
  assigned_to BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reports_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reports_status_created (status, created_at),
  INDEX idx_reports_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  match_id BIGINT UNSIGNED NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME NULL,
  CONSTRAINT fk_conversations_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  INDEX idx_conversations_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_read_at DATETIME NULL,
  PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT fk_conversation_members_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversation_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  body TEXT NULL,
  message_type ENUM('text','image','voice','system') NOT NULL DEFAULT 'text',
  delivered_at DATETIME NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_messages_conversation_date (conversation_id, created_at),
  INDEX idx_messages_sender_date (sender_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_attachments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  message_id BIGINT UNSIGNED NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_attachments_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calls (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  call_type ENUM('audio','video') NOT NULL,
  provider VARCHAR(60) NULL,
  provider_call_id VARCHAR(180) NULL,
  status ENUM('ringing','answered','completed','unanswered','declined','failed') NOT NULL DEFAULT 'ringing',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME NULL,
  ended_at DATETIME NULL,
  duration_seconds INT UNSIGNED NULL,
  CONSTRAINT fk_calls_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_calls_started (started_at),
  INDEX idx_calls_provider (provider, provider_call_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS call_participants (
  call_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  joined_at DATETIME NULL,
  left_at DATETIME NULL,
  PRIMARY KEY (call_id, user_id),
  CONSTRAINT fk_call_participants_call FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
  CONSTRAINT fk_call_participants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  visibility ENUM('community','public') NOT NULL DEFAULT 'community',
  status ENUM('published','hidden','removed') NOT NULL DEFAULT 'published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_community_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_community_posts_feed (status, visibility, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_post_media (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT UNSIGNED NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  media_type ENUM('image','video') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_community_post_media_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  body TEXT NOT NULL,
  status ENUM('published','hidden','removed') NOT NULL DEFAULT 'published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_community_comments_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_comments_parent FOREIGN KEY (parent_id) REFERENCES community_comments(id) ON DELETE CASCADE,
  INDEX idx_community_comments_post (post_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_reactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  post_id BIGINT UNSIGNED NOT NULL,
  reaction ENUM('like','love','support') NOT NULL DEFAULT 'like',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_community_reaction (user_id, post_id),
  CONSTRAINT fk_community_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_reactions_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_shares (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  share_type ENUM('internal','copy_link','whatsapp','facebook','x','telegram') NOT NULL,
  share_token CHAR(48) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_community_shares_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_shares_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_community_shares_post (post_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NOT NULL,
  post_id BIGINT UNSIGNED NULL,
  comment_id BIGINT UNSIGNED NULL,
  reason VARCHAR(120) NOT NULL,
  details TEXT NULL,
  status ENUM('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
  assigned_to BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_community_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_community_reports_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_reports_comment FOREIGN KEY (comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_reports_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_community_reports_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaigns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  target_gender ENUM('male','female','all') NOT NULL DEFAULT 'all',
  minimum_age TINYINT UNSIGNED NULL,
  maximum_age TINYINT UNSIGNED NULL,
  target_location VARCHAR(180) NULL,
  status ENUM('draft','scheduled','active','paused','completed') NOT NULL DEFAULT 'draft',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  budget_minor BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_campaigns_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_campaigns_status_schedule (status, starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_targets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_value VARCHAR(180) NOT NULL,
  CONSTRAINT fk_campaign_targets_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_campaign_targets_campaign (campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  event_type ENUM('impression','reach','click','registration','verified','match','conversion') NOT NULL,
  event_key CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_campaign_events_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_campaign_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_campaign_events_report (campaign_id, event_type, created_at),
  INDEX idx_campaign_events_key (event_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS advertisements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  advertiser_user_id BIGINT UNSIGNED NULL,
  ad_type ENUM('banner','image','video','sponsored_post','featured_profile','sponsored_campaign') NOT NULL,
  creative_storage_path VARCHAR(500) NULL,
  target_data JSON NULL,
  budget_minor BIGINT UNSIGNED NULL,
  status ENUM('draft','pending_review','approved','active','paused','rejected','completed') NOT NULL DEFAULT 'draft',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  approved_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ads_advertiser FOREIGN KEY (advertiser_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_ads_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ads_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ads_status_type (status, ad_type),
  INDEX idx_ads_dates (starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS advert_placements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  placement_key VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  max_items TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS advertisement_placements (
  advertisement_id BIGINT UNSIGNED NOT NULL,
  placement_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (advertisement_id, placement_id),
  CONSTRAINT fk_advertisement_placements_ad FOREIGN KEY (advertisement_id) REFERENCES advertisements(id) ON DELETE CASCADE,
  CONSTRAINT fk_advertisement_placements_placement FOREIGN KEY (placement_id) REFERENCES advert_placements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS advert_impressions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  advertisement_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  placement_id BIGINT UNSIGNED NOT NULL,
  event_key CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_advert_impressions_ad FOREIGN KEY (advertisement_id) REFERENCES advertisements(id) ON DELETE CASCADE,
  CONSTRAINT fk_advert_impressions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_advert_impressions_placement FOREIGN KEY (placement_id) REFERENCES advert_placements(id) ON DELETE RESTRICT,
  INDEX idx_advert_impressions_date (advertisement_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS advert_clicks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  advertisement_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  placement_id BIGINT UNSIGNED NOT NULL,
  event_key CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_advert_clicks_ad FOREIGN KEY (advertisement_id) REFERENCES advertisements(id) ON DELETE CASCADE,
  CONSTRAINT fk_advert_clicks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_advert_clicks_placement FOREIGN KEY (placement_id) REFERENCES advert_placements(id) ON DELETE RESTRICT,
  INDEX idx_advert_clicks_date (advertisement_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_key VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  amount_minor BIGINT UNSIGNED NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'NGN',
  duration_days SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  feature_data JSON NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','active','expired','cancelled','past_due') NOT NULL DEFAULT 'pending',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  provider VARCHAR(40) NULL,
  provider_subscription_id VARCHAR(180) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  INDEX idx_subscriptions_user_status (user_id, status, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NULL,
  amount_minor BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'NGN',
  provider ENUM('paystack','flutterwave','manual') NOT NULL,
  provider_reference VARCHAR(180) NOT NULL,
  status ENUM('pending','successful','failed','refunded','reversed') NOT NULL DEFAULT 'pending',
  verified_at DATETIME NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_provider_reference (provider, provider_reference),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  INDEX idx_payments_status_date (status, created_at),
  INDEX idx_payments_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_webhooks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  provider ENUM('paystack','flutterwave') NOT NULL,
  event_id VARCHAR(180) NULL,
  payload_hash CHAR(64) NOT NULL,
  signature_valid TINYINT(1) NOT NULL,
  processing_status ENUM('received','verified','rejected','failed') NOT NULL DEFAULT 'received',
  response_code SMALLINT UNSIGNED NULL,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payment_webhook_event (provider, event_id),
  INDEX idx_payment_webhooks_hash (payload_hash),
  INDEX idx_payment_webhooks_received (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_tickets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  assigned_to BIGINT UNSIGNED NULL,
  subject VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  status ENUM('open','in_progress','escalated','resolved','closed') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_support_tickets_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_support_tickets_status (status, priority, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  is_internal TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_support_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_support_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_support_messages_ticket (ticket_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  notification_type VARCHAR(80) NOT NULL,
  title VARCHAR(180) NOT NULL,
  body TEXT NULL,
  data JSON NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_unread (user_id, read_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feature_settings (
  feature_key VARCHAR(100) NOT NULL PRIMARY KEY,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  updated_by BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_feature_settings_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matching_weights (
  weight_key VARCHAR(100) NOT NULL PRIMARY KEY,
  weight DECIMAL(5,2) NOT NULL,
  updated_by BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_matching_weights_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_matching_weight CHECK (weight >= 0 AND weight <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(140) NOT NULL PRIMARY KEY,
  setting_value LONGTEXT NULL,
  is_secret TINYINT(1) NOT NULL DEFAULT 0,
  updated_by BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_system_settings_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NULL,
  action VARCHAR(140) NOT NULL,
  target_type VARCHAR(80) NULL,
  target_id VARCHAR(100) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  previous_value JSON NULL,
  new_value JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_logs_admin_date (admin_id, created_at),
  INDEX idx_audit_logs_target (target_type, target_id),
  INDEX idx_audit_logs_action_date (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_activity (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  identifier_hash CHAR(64) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  was_successful TINYINT(1) NOT NULL DEFAULT 0,
  failure_reason VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_login_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_login_activity_user (user_id, created_at),
  INDEX idx_login_activity_ip (ip_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
  key_hash CHAR(64) NOT NULL PRIMARY KEY,
  bucket_started_at INT UNSIGNED NOT NULL,
  hit_count INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_password_resets_user (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default permissions. `*` is a server-side wildcard reserved for Super Admin.
INSERT IGNORE INTO permissions (permission_key, description) VALUES
('*','Super Admin wildcard permission'),
('users.view','View member accounts'),('users.create','Create member accounts'),('users.edit','Edit member accounts'),('users.suspend','Suspend accounts'),('users.delete','Delete accounts'),
('verification.view','View verification submissions'),('verification.approve','Approve verification submissions'),('verification.reject','Reject or request resubmission'),
('matching.view','View matching configuration'),('matching.manage','Change matching configuration'),
('community.view','View community content'),('community.create','Create platform content'),('community.moderate','Moderate community content'),('community.delete','Remove community content'),
('messages.view','View conversation metadata'),('messages.moderate','Review reported messages'),('calls.view','View call metadata'),
('payments.view','View payments and transactions'),('payments.refund','Issue payment refunds'),('payments.export','Export transaction records'),('subscriptions.view','View member subscriptions'),('subscriptions.manage','Manage subscription plans'),
('ads.create','Create advertisements'),('ads.edit','Edit advertisements'),('ads.approve','Approve advertisements'),('ads.delete','Delete advertisements'),('ads.analytics','View advertisement analytics'),
('campaign.create','Create campaigns'),('campaign.edit','Edit campaigns'),('campaign.analytics','View campaign analytics'),
('support.view','View support tickets'),('support.manage','Manage support tickets'),('reports.view','View member reports'),('reports.resolve','Resolve member reports'),
('settings.view','View platform settings'),('settings.manage','Manage platform settings'),('features.view','View feature settings'),('features.toggle','Toggle platform features'),
('roles.view','View roles and permissions'),('roles.create','Create staff roles'),('roles.edit','Edit staff roles'),('permissions.manage','Assign permissions'),('audit.view','View administrator audit log');

INSERT IGNORE INTO roles (role_key, name, description, is_system) VALUES
('super_admin','Super Admin','Full platform privilege, RBAC, settings and security.',1),
('admin','Admin','General platform and member management.',1),
('finance','Finance','Payments, subscriptions, transactions and refunds.',1),
('support','Support','Member support, complaints and ticket management.',1),
('verification_officer','Verification Officer','Review profile and video verification submissions.',1),
('moderator','Moderator','Community safety, reports and moderation.',1),
('advert_manager','Advert Manager','Advertising campaigns, placements and analytics.',1),
('content_manager','Content Manager','Community and platform content management.',1),
('user','User','Standard member account.',1);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.role_key='super_admin' AND p.permission_key='*';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('users.view','users.create','users.edit','users.suspend','verification.view','community.view','community.moderate','messages.view','calls.view','support.view','support.manage','reports.view','reports.resolve','settings.view','features.view','roles.view','audit.view') WHERE r.role_key='admin';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('payments.view','payments.refund','payments.export','subscriptions.view','subscriptions.manage') WHERE r.role_key='finance';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('users.view','support.view','support.manage','reports.view','reports.resolve') WHERE r.role_key='support';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('users.view','verification.view','verification.approve','verification.reject') WHERE r.role_key='verification_officer';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('community.view','community.moderate','community.delete','reports.view','reports.resolve') WHERE r.role_key='moderator';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('ads.create','ads.edit','ads.approve','ads.delete','ads.analytics','campaign.create','campaign.edit','campaign.analytics') WHERE r.role_key='advert_manager';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('community.view','community.create','community.moderate') WHERE r.role_key='content_manager';

INSERT IGNORE INTO feature_settings (feature_key, enabled, description) VALUES
('registration',1,'Phone and email registration with OTP verification.'),
('discovery',1,'Approved member profiles and compatibility-led introductions.'),
('opposite_gender_matching',1,'Enforce approved opposite-gender discovery.'),
('video_verification',1,'Private video verification submission and review.'),
('audio_calls',1,'Platform audio calling.'),('video_calls',1,'Platform video calling.'),('messaging',1,'Private messaging between mutual matches.'),
('community',1,'Community posts and discussions.'),('comments',1,'Community comments and replies.'),('sharing',1,'Public community post sharing links.'),
('campaigns',1,'Campaign creation and analytics.'),('advertisements',1,'Advertisement review and placements.'),
('premium_membership',1,'Premium plans and member features.'),('notifications',1,'In-app and email notifications.'),
('gifts',0,'Virtual gifts between members.'),('events',0,'Member events and gatherings.');

INSERT IGNORE INTO matching_weights (weight_key, weight) VALUES
('age_compatibility',20),('location',15),('marriage_intention',15),('education',10),('religion_practice',15),('shared_interests',10),('languages',5),('lifestyle',10);

INSERT IGNORE INTO advert_placements (placement_key,name,enabled,max_items) VALUES
('homepage','Homepage',1,2),('discovery','Discovery',1,2),('community_feed','Community Feed',1,3),('profile_page','Profile Page',1,1),('messages','Messages',1,1),('dashboard','Dashboard',1,2);

INSERT IGNORE INTO subscription_plans (plan_key,name,amount_minor,currency,duration_days,feature_data,enabled) VALUES
('free','Free',0,'NGN',0,'{"likes_per_day":10,"advanced_filters":false}',1),
('premium_monthly','Premium',250000,'NGN',30,'{"unlimited_likes":true,"advanced_filters":true,"see_likes":true}',1),
('premium_plus_quarterly','Premium Plus',600000,'NGN',90,'{"unlimited_likes":true,"advanced_filters":true,"profile_boost":true}',1),
('vip_annual','VIP',2000000,'NGN',365,'{"unlimited_likes":true,"priority_verification":true,"featured_profile":true}',1);
