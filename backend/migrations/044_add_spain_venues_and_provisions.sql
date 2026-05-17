-- Add specialty coffee venues in Spain (Madrid and Barcelona)
-- and local purchase links for consumables.

-- 1. Add Venues
INSERT INTO venues (name, latitude, longitude, tags, address, city) VALUES
('Nomad Coffee Lab & Shop', 41.3892, 2.1772, 'specialty,roastery,award-winning,education', 'Passatge de Sert, 12', 'Barcelona'),
('Syra Coffee - Poble Sec', 41.3735, 2.1623, 'specialty,minimalist,takeaway', 'Carrer de Margarit, 17', 'Barcelona'),
('Hola Coffee', 40.4081, -3.7015, 'specialty,roastery,vibe', 'Calle del Dr. Fourquet, 33', 'Madrid'),
('Toma Café', 40.4276, -3.7042, 'specialty,cozy,quality', 'Calle de la Palma, 49', 'Madrid'),
('Hansson Coffee', 40.4356, -3.6923, 'specialty,modern,minimalist', 'Calle de Miguel Ángel, 19', 'Madrid'),
('Acid Bakehouse', 40.4095, -3.6978, 'specialty,bakery,modern', 'Calle de la Magdalena, 27', 'Madrid');

-- 2. Add local purchase links for Spain (ES)
-- We'll use Amazon.es or local roaster links as placeholders/standard for now.

-- V60 Filters for Spain
INSERT INTO purchase_links (equipment_name, url, country_code, price, description)
SELECT name, 'https://www.amazon.es/Hario-V60-Filtros-papel-tama%C3%B1o/dp/B001U7IHSW', 'ES', 7.50, 'Filtros Hario V60-02 (100u) - Amazon.es'
FROM equipment WHERE slug = 'v60';

-- Chemex Filters for Spain
INSERT INTO purchase_links (equipment_name, url, country_code, price, description)
SELECT name, 'https://www.amazon.es/Chemex-FSU-100-Filtros-de-papel/dp/B0000CF2WR', 'ES', 14.90, 'Filtros Chemex Square (100u) - Amazon.es'
FROM equipment WHERE slug = 'chemex';

-- Digital Scale for Spain
INSERT INTO purchase_links (equipment_name, url, country_code, price, description)
SELECT name, 'https://www.amazon.es/Hario-VST-2000B-Balanza-goteo-V60/dp/B009GPJMOU', 'ES', 45.00, 'Balanza Hario V60 - Amazon.es'
FROM equipment WHERE slug = 'digital-scale';
