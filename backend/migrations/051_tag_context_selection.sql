-- Migration 051: Tag Context Selection (Country and Venue overrides)

-- Table for country-specific suggested tags
CREATE TABLE IF NOT EXISTS country_tags (
    country_code VARCHAR(10) NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    PRIMARY KEY (country_code, tag_id)
);

-- Table for venue-specific suggested tags
CREATE TABLE IF NOT EXISTS venue_tags (
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    PRIMARY KEY (venue_id, tag_id)
);

-- Seed defaults for existing countries
-- We'll make all currently active tags available for our main countries by default
DO $$
DECLARE
    tag_rec RECORD;
    c_code TEXT;
    countries TEXT[] := ARRAY['AR', 'UY', 'ES', 'BR', 'GE'];
BEGIN
    FOR c_code IN SELECT unnest(countries) LOOP
        FOR tag_rec IN SELECT id, display_order FROM tags WHERE is_active = true LOOP
            INSERT INTO country_tags (country_code, tag_id, display_order)
            VALUES (c_code, tag_rec.id, tag_rec.display_order)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
