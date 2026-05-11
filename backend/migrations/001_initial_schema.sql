-- Initial database schema for Vidita Cafe

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS user_equipment (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS brewing_methods (
    id VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    required_equipment TEXT, -- Comma-separated names for now to match mobile
    optional_equipment TEXT
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date BIGINT NOT NULL,
    coffee_name VARCHAR(255) NOT NULL,
    brewing_method VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    rating DOUBLE PRECISION,
    tags TEXT, -- Comma-separated tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_name VARCHAR(255) REFERENCES equipment(name) ON DELETE CASCADE,
    description VARCHAR(255),
    url TEXT,
    country_code VARCHAR(10),
    price DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS brewing_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    method_id VARCHAR(50) NOT NULL,
    coffee_dose DOUBLE PRECISION,
    water_yield DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    grind_size VARCHAR(50)
);

-- Seed Data (from mobile apps)
INSERT INTO equipment (name, category, description, image_url) VALUES
('V60', 'brewer', 'The Hario V60 is a classic pour-over brewer known for its conical shape and large single hole, allowing for a clean and highlight-driven cup of coffee.', '/static/images/v60.jpg'),
('Chemex', 'brewer', 'Designed by a chemist, the Chemex uses thick paper filters to produce a remarkably clear and sediment-free brew, highlighting bright acidity.', '/static/images/chemex.jpg'),
('Aeropress', 'brewer', 'A versatile and portable brewer that uses pressure to extract rich flavors. It''s famous for its durability and the ''inverted method'' community.', '/static/images/aeropress.jpg'),
('French Press', 'brewer', 'A full-immersion brewer that uses a metal mesh filter, resulting in a heavy-bodied cup with rich oils and a textured mouthfeel.', '/static/images/french_press.jpg'),
('Espresso', 'brewer', 'The foundation of many coffee drinks, espresso is brewed by forcing hot water through finely-ground coffee at high pressure.', '/static/images/espresso.jpg'),
('Moka Pot', 'brewer', 'A stovetop brewer that produces a strong, espresso-like coffee using steam pressure. A staple in many Italian households.', '/static/images/moka_pot.jpg'),
('Syphon', 'brewer', 'A vacuum brewer that combines full immersion and cloth filtering, producing a very clean and hot cup with theatrical flair.', '/static/images/syphon.jpg'),
('Cold Brew', 'brewer', 'A method involving steeping coarse grounds in cold water for 12-24 hours, resulting in a low-acid, naturally sweet concentrate.', '/static/images/cold_brew.jpg'),
('Brik', 'brewer', 'A Brik (also known as a Cezve) is a small long-handled pot with a pouring lip, traditionally used to brew Turkish coffee. Its design is ideal for creating the characteristic foam.', '/static/images/brik.jpeg'),
('Kalita Wave', 'brewer', 'A flat-bottomed pour-over brewer with three small holes, providing a more even extraction and a sweeter, more balanced profile than the V60.', '/static/images/v60.jpg'),
('Clever Dripper', 'brewer', 'Combines immersion brewing with a filter release mechanism, giving the body of a French Press with the clarity of a pour-over.', '/static/images/v60.jpg'),
('Hand Grinder', 'grinder', 'A manual tool for grinding coffee beans. Perfect for travel and providing a tactile connection to your daily brew.', '/static/images/grinder.jpg'),
('Electric Grinder', 'grinder', 'Offers speed and consistency for your daily grind, with adjustable settings for everything from espresso to cold brew.', '/static/images/grinder.jpg'),
('Electric Kettle', 'kettle', 'Quickly heats water to the desired temperature, essential for consistent brewing and convenience.', '/static/images/kettle.jpg'),
('Gooseneck Kettle', 'kettle', 'Provides precision control over water flow and placement, which is crucial for achieving even extraction in pour-over methods.', '/static/images/kettle.jpg'),
('Digital Scale', 'scale', 'Ensures precision by measuring coffee and water by weight rather than volume, the key to repeatable brewing excellence.', '/static/images/kettle.jpg')
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;

INSERT INTO brewing_methods (id, display_name, description, required_equipment, optional_equipment) VALUES
('v60', 'V60', 'Hario V60 pour over', 'V60, Hand Grinder, Electric Kettle', 'Digital Scale'),
('chemex', 'Chemex', 'Chemex pour over', 'Chemex, Hand Grinder, Electric Kettle', 'Digital Scale'),
('aeropress', 'Aeropress', 'Aeropress immersion', 'Aeropress, Hand Grinder, Electric Kettle', ''),
('french_press', 'French Press', 'French Press immersion', 'French Press, Hand Grinder, Electric Kettle', ''),
('espresso', 'Espresso', 'Espresso machine', 'Espresso, Electric Grinder', ''),
('moka_pot', 'Moka Pot', 'Moka Pot stove top', 'Moka Pot, Hand Grinder, Electric Kettle', ''),
('syphon', 'Syphon', 'Vacuum brewing', 'Syphon, Hand Grinder, Electric Kettle', ''),
('cold_brew', 'Cold Brew', 'Cold immersion', 'Cold Brew, Hand Grinder', ''),
('kalita_wave', 'Kalita Wave', 'Kalita Wave pour over', 'Kalita Wave, Hand Grinder, Electric Kettle', 'Digital Scale'),
('clever_dripper', 'Clever Dripper', 'Clever immersion', 'Clever Dripper, Hand Grinder, Electric Kettle', ''),
('turkish', 'Turkish Coffee', 'Turkish coffee', 'Brik, Hand Grinder, Electric Kettle', '')
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    required_equipment = EXCLUDED.required_equipment,
    optional_equipment = EXCLUDED.optional_equipment;

INSERT INTO purchase_links (equipment_name, description, url, country_code, price) VALUES
('V60', 'Amazon Global', 'https://www.amazon.com/Hario-V60-Ceramic-Coffee-Dripper/dp/B000P4966U', 'WW', 25.0),
('V60', 'Hario Official', 'https://global.hario.com/', 'WW', 28.0),
('Hand Grinder', 'Amazon Global', 'https://www.amazon.com/Baratza-Encore-Conical-Coffee-Grinder/dp/B007F183LK', 'WW', 169.0),
('Chemex', 'Cafetera tipo Chemex en tu puerta', 'https://meli.la/1wpeMur', 'AR', 53000.0)
ON CONFLICT DO NOTHING;
