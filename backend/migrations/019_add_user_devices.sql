-- Migration: Add user_devices table for push notifications
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'web' (PWA)
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fcm_token)
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_fcm_token ON user_devices(fcm_token);
