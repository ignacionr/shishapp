-- Create short_links table for QR code infrastructure
CREATE TABLE IF NOT EXISTS short_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    target_path TEXT NOT NULL, -- e.g. /checkin?venue_id=...
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_short_links_code ON short_links(code);

-- Initial seed data
INSERT INTO short_links (code, target_path, description) VALUES
('generic', '/', 'Generic homepage redirect'),
('qr1', '/search', 'Initial QR code pointing to venue search'),
('qr2', '/journey', 'Initial QR code pointing to user journey')
ON CONFLICT (code) DO NOTHING;
