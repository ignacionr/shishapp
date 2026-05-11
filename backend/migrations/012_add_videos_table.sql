-- Create videos table for home feed content management
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE, -- YouTube Video ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial video
INSERT INTO videos (slug, title, description) VALUES
('aqyq43r62Xg', 'The Ultimate V60 Guide', 'Master the art of the pour-over with this comprehensive guide to the Hario V60.')
ON CONFLICT (slug) DO NOTHING;
