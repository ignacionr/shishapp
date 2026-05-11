-- Add location_type and venue_id to journal_entries
ALTER TABLE journal_entries ADD COLUMN location_type VARCHAR(20) DEFAULT 'home';
ALTER TABLE journal_entries ADD COLUMN venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;

-- Backfill location_type based on existence of venue string
UPDATE journal_entries SET location_type = 'shop' WHERE venue IS NOT NULL AND venue != '';
