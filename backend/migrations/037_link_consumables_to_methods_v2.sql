-- Migration: Link consumables with brewing methods
-- Add consumables column to brewing_methods

ALTER TABLE brewing_methods ADD COLUMN IF NOT EXISTS consumables TEXT;

-- Update existing methods with their relevant consumables
UPDATE brewing_methods SET consumables = 'V60 Paper Filters AR' WHERE id = 'v60';
UPDATE brewing_methods SET consumables = 'Chemex Bonded Filters' WHERE id = 'chemex';
UPDATE brewing_methods SET consumables = 'Aeropress Micro-Filters' WHERE id = 'aeropress';
UPDATE brewing_methods SET consumables = 'Nespresso Compatible Capsules' WHERE id = 'capsules';
UPDATE brewing_methods SET consumables = 'Specialty Coffee Beans' WHERE id NOT IN ('capsules');
