-- Add venue field to journal_entries
-- This field stores the specific coffee shop or location name,
-- which might be pre-populated via deep links from partner shops.

ALTER TABLE journal_entries ADD COLUMN venue VARCHAR(255);
