-- Add ratio and created_at columns to brewing_presets
ALTER TABLE brewing_presets ADD COLUMN IF NOT EXISTS ratio DOUBLE PRECISION;
ALTER TABLE brewing_presets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
