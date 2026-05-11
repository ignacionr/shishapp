-- Add slug column to equipment for deep-linking
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Populate slugs for existing equipment
UPDATE equipment SET slug = 'v60' WHERE name = 'V60';
UPDATE equipment SET slug = 'chemex' WHERE name = 'Chemex';
UPDATE equipment SET slug = 'aeropress' WHERE name = 'Aeropress';
UPDATE equipment SET slug = 'french-press' WHERE name = 'French Press';
UPDATE equipment SET slug = 'espresso' WHERE name = 'Espresso';
UPDATE equipment SET slug = 'moka-pot' WHERE name = 'Moka Pot';
UPDATE equipment SET slug = 'syphon' WHERE name = 'Syphon';
UPDATE equipment SET slug = 'cold-brew' WHERE name = 'Cold Brew';
UPDATE equipment SET slug = 'brik' WHERE name = 'Brik';
UPDATE equipment SET slug = 'kalita-wave' WHERE name = 'Kalita Wave';
UPDATE equipment SET slug = 'clever-dripper' WHERE name = 'Clever Dripper';
UPDATE equipment SET slug = 'hand-grinder' WHERE name = 'Hand Grinder';
UPDATE equipment SET slug = 'electric-grinder' WHERE name = 'Electric Grinder';
UPDATE equipment SET slug = 'electric-kettle' WHERE name = 'Electric Kettle';
UPDATE equipment SET slug = 'gooseneck-kettle' WHERE name = 'Gooseneck Kettle';
UPDATE equipment SET slug = 'digital-scale' WHERE name = 'Digital Scale';
UPDATE equipment SET slug = 'cloth-filter' WHERE name = 'Cloth Filter';

-- Make slug NOT NULL for future entries
ALTER TABLE equipment ALTER COLUMN slug SET NOT NULL;

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_equipment_slug ON equipment(slug);
