-- Add specialty coffee shops in Buenos Aires and Montevideo
INSERT INTO venues (name, latitude, longitude, tags, address, city) VALUES
-- Buenos Aires
('Cuervo Café (Palermo Soho)', -34.5905, -58.4271, 'specialty,roastery,palermo', 'El Salvador 4580', 'Buenos Aires'),
('Cuervo Café (Palermo Hollywood)', -34.5815, -58.4345, 'specialty,roastery,palermo', 'Costa Rica 5801', 'Buenos Aires'),
('Cuervo Café (Belgrano)', -34.5555, -58.4465, 'specialty,roastery,belgrano', 'Juramento 1284', 'Buenos Aires'),
('All Saints Cafe (Belgrano)', -34.5615, -58.4565, 'specialty,pioneer,methods', 'Ciudad de la Paz 2300', 'Buenos Aires'),
('All Saints Cafe (Microcentro)', -34.6025, -58.3785, 'specialty,pioneer,central', 'Av. Corrientes 802', 'Buenos Aires'),
('LAB Tostadores (Palermo)', -34.5860, -58.4369, 'specialty,laboratory,roastery', 'Humboldt 1542', 'Buenos Aires'),
('LAB Tostadores (Belgrano)', -34.5565, -58.4485, 'specialty,laboratory,belgrano', 'Echeverría 1550', 'Buenos Aires'),
('Lattente', -34.5885, -58.4295, 'specialty,barista-focus,palermo', 'Thames 1891', 'Buenos Aires'),
('NEGRO Cueva de Café (Suipacha)', -34.6015, -58.3795, 'specialty,modern,central', 'Suipacha 637', 'Buenos Aires'),
('NEGRO Cueva de Café (Tucumán)', -34.6015, -58.3865, 'specialty,modern,tribunales', 'Tucumán 1327', 'Buenos Aires'),
('The Shelter Coffee (Arroyo)', -34.5915, -58.3795, 'specialty,cozy,recoleta', 'Arroyo 940', 'Buenos Aires'),
('The Shelter Coffee (Uriburu)', -34.6035, -58.3985, 'specialty,cozy,balvanera', 'Uriburu 353', 'Buenos Aires'),
('Öss Kaffe', -34.5545, -58.4535, 'specialty,architectural,intimate', 'Franklin D. Roosevelt 1894', 'Buenos Aires'),
('Coffee Town', -34.6215, -58.3725, 'specialty,historic,san-telmo', 'Bolivar 976', 'Buenos Aires'),
('Full City Coffee Roasters', -34.5898, -58.4321, 'specialty,colombian,roastery', 'Thames 1535', 'Buenos Aires'),

-- Montevideo
('Café La Farmacia', -34.9048, -56.2051, 'specialty,historic,pharmacy', 'Cerrito 550', 'Montevideo'),
('Culto Café', -34.9072, -56.1685, 'specialty,modern,roastery', 'Canelones 2154', 'Montevideo'),
('Seis Montes', -34.9001, -56.1652, 'specialty,purist,roastery', 'Av. Gral. Rivera 2208', 'Montevideo'),
('Escaramuza Libros y Café', -34.9085, -56.1721, 'specialty,bookstore,garden', 'Dr. Pablo de María 1185', 'Montevideo');
