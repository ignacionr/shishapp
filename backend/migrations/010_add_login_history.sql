-- Create login_history table to track user sessions
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL, -- Supports IPv6
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);
