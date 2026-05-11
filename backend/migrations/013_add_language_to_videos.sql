-- Add language_code to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS language_code VARCHAR(10) NOT NULL DEFAULT 'en';

-- Index for faster feed filtering
CREATE INDEX IF NOT EXISTS idx_videos_language_code ON videos(language_code);

-- Update existing seed video to be specifically English
UPDATE videos SET language_code = 'en' WHERE slug = 'aqyq43r62Xg';
