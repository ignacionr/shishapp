-- Ensure admin flag is set regardless of email casing
UPDATE users SET is_admin = TRUE WHERE LOWER(email) = 'ignacionr@gmail.com';
