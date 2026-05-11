-- Seed sample short link for code "1"
INSERT INTO short_links (code, target_path, description) VALUES
('1', '/checkin?venue_id=eaafc1eb-4040-48ee-89f5-1cdbdc369d15', 'Sample QR code for Coffee Lab check-in')
ON CONFLICT (code) DO NOTHING;
