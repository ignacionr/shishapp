-- Add admin flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set initial admin
UPDATE users SET is_admin = TRUE WHERE email = 'ignacionr@gmail.com';
