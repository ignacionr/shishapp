-- Create venues table and populate with specialty coffee shops in Santa Fe and Rosario
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    tags TEXT, -- Comma separated tags
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate Rosario venues
INSERT INTO venues (name, latitude, longitude, tags, address, city) VALUES
('Barista Coffee House', -32.96558, -60.64745, 'specialty,roastery,award-winning', 'Ocampo 1404', 'Rosario'),
('Oreja Negra', -32.94712, -60.65432, 'specialty,bakery,cozy', 'Blvd. Oroño 1189', 'Rosario'),
('Bold Specialty Coffee', -32.94245, -60.64123, 'specialty,modern,minimalist', 'Pres. Roca 533', 'Rosario'),
('Groovin Cafetería', -32.94789, -60.64856, 'specialty,music,vibe', 'Italia 886', 'Rosario'),
('ARTO Café', -32.94123, -60.64812, 'specialty,artisan,central', 'Tucumán 1932', 'Rosario'),
('Runge Café', -32.94312, -60.64156, 'specialty,quiet,quality', 'Italia 543', 'Rosario'),
('The Coffee Box', -32.93545, -60.65412, 'specialty,takeaway,modern', 'Salta 2772', 'Rosario'),
('Café Orlan', -32.94156, -60.64512, 'specialty,classic,roastery', 'Salta 1800', 'Rosario'),
('Alguito Café', -32.93812, -60.64234, 'specialty,river-view,modern', 'Av. Wheelwright 1547', 'Rosario'),
('Tiny Waves Café', -32.94612, -60.65123, 'specialty,aesthetic,v60', 'Rioja 1894', 'Rosario'),
('Tipa Café', -32.94123, -60.66545, 'specialty,neighborhood,local', 'Riccheri 1099', 'Rosario'),
('Camilo', -32.94812, -60.64912, 'specialty,bakery,brunch', 'Presidente Roca 1259', 'Rosario');

-- Populate Santa Fe venues
INSERT INTO venues (name, latitude, longitude, tags, address, city) VALUES
('LETO Brew Lab', -31.64212, -60.70545, 'specialty,brew-lab,education,v60', 'Rivadavia 2563', 'Santa Fe'),
('Greña Masa Madre', -31.63845, -60.70123, 'specialty,sourdough,bakery', 'Bv. Gálvez 1488', 'Santa Fe'),
('Tostadero Iris', -31.63912, -60.70312, 'specialty,roastery,historic', 'Bv. Gálvez y Belgrano', 'Santa Fe'),
('Edison Café', -31.63812, -60.70845, 'specialty,modern,minimalist', '9 de Julio 3298', 'Santa Fe'),
('El Recinto', -31.65845, -60.71412, 'specialty,central,espresso', 'Gral. López 3058', 'Santa Fe'),
('Garden Coffee House', -31.66512, -60.75123, 'specialty,roastery,outdoor', 'Paseo de las Acacias', 'Santa Fe'),
('Gayalí', -31.64234, -60.70912, 'specialty,historic,classic', 'San Martín 2898', 'Santa Fe'),
('Marce Cakes', -31.64512, -60.71123, 'specialty,gluten-free,bakery', '1era. Junta 2642', 'Santa Fe'),
('Maipú Academy', -31.63212, -60.69545, 'specialty,academy,professional', 'Calle Maipú', 'Santa Fe');
