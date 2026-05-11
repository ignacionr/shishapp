-- Update users table for Social Login and Preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10);

-- Ensure journal_entries uses user_id correctly
-- (The original schema already has this, but good to be sure)
