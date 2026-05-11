-- Migration 045: Role-Based Access Control (RBAC)

-- 1. Add country_code to venues
ALTER TABLE venues ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);

-- 2. Populate initial country_code for existing venues based on city
UPDATE venues SET country_code = 'AR' WHERE city IN ('Rosario', 'Santa Fe', 'Buenos Aires', 'Mar del Plata', 'Paraná', 'Villa Crespo');
UPDATE venues SET country_code = 'UY' WHERE city IN ('Montevideo');
UPDATE venues SET country_code = 'ES' WHERE city IN ('Madrid', 'Barcelona');

-- Fallback for any others
UPDATE venues SET country_code = 'AR' WHERE country_code IS NULL;

-- 3. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_type VARCHAR(20) NOT NULL, -- 'GLOBAL', 'COUNTRY', 'VENUE'
    target_id VARCHAR(255), -- NULL for GLOBAL, country_code for COUNTRY, venue_id (UUID) for VENUE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_type, target_id)
);

-- 4. Migrate existing is_admin users to GLOBAL role
INSERT INTO user_roles (user_id, role_type)
SELECT id, 'GLOBAL' FROM users WHERE is_admin = TRUE
ON CONFLICT DO NOTHING;
