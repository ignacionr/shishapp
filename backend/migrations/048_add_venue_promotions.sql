-- Migration 048: Add Venue Promotions
CREATE TABLE IF NOT EXISTS venue_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- e.g., 'SUGGESTION', 'VIDEO'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image_url TEXT,
    youtube_id VARCHAR(20),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_venue_promotions_venue_id ON venue_promotions(venue_id);
CREATE INDEX idx_venue_promotions_active ON venue_promotions(start_date, end_date);
