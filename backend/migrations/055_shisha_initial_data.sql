-- Seed Data for Shishapp
-- Replace coffee equipment with shisha equipment
DELETE FROM equipment;
INSERT INTO equipment (name, category, description, image_url) VALUES
('Classic Hookah', 'hookah', 'A traditional stainless steel or brass hookah, known for its durability and classic aesthetic.', '/static/images/grinder.jpg'),
('Modern Hookah', 'hookah', 'Sleek, anodized aluminum or stainless steel hookah with modern features like magnetic connectors and vertical purge.', '/static/images/grinder.jpg'),
('Phunnel Bowl', 'bowl', 'A bowl with a single central hole and a spire, designed to keep tobacco juices inside for longer-lasting flavor and clouds.', '/static/images/v60.jpg'),
('Vortex Bowl', 'bowl', 'Features a central spire with holes on the sides, providing good airflow while preventing juices from dripping into the stem.', '/static/images/v60.jpg'),
('Egyptian Bowl', 'bowl', 'A traditional clay bowl with holes at the bottom, offering a classic smoking experience and excellent heat retention.', '/static/images/v60.jpg'),
('HMD (Heat Management Device)', 'hmd', 'A device that sits on top of the bowl to hold coals, providing better heat control and eliminating the need for foil.', '/static/images/scale.png'),
('Coconut Charcoal', 'charcoal', 'Natural charcoal made from coconut shells, known for being odorless, tasteless, and long-burning.', '/static/images/scale.png'),
('Silicone Hose', 'accessory', 'A washable, medical-grade silicone hose that doesn''t ghost flavors and is easy to clean.', '/static/images/kettle.jpg'),
('Heat Resistant Tongs', 'accessory', 'Essential for handling hot coals safely and precisely.', '/static/images/kettle.jpg');

-- Replace brewing methods with shisha setups
DELETE FROM brewing_methods;
INSERT INTO brewing_methods (id, display_name, description, required_equipment, optional_equipment) VALUES
('phunnel_hmd', 'Phunnel + HMD', 'Modern setup using a Phunnel bowl and a Heat Management Device for maximum flavor and ease of use.', 'Phunnel Bowl, Modern Hookah, HMD (Heat Management Device), Coconut Charcoal', 'Silicone Hose'),
('traditional_foil', 'Traditional Foil', 'The classic way to smoke using an Egyptian bowl and aluminum foil with coconut or quick-light coals.', 'Egyptian Bowl, Classic Hookah, Coconut Charcoal', 'Heat Resistant Tongs'),
('vortex_setup', 'Vortex Setup', 'A balanced setup using a Vortex bowl, suitable for both blonde and dark leaf tobaccos.', 'Vortex Bowl, Modern Hookah, Coconut Charcoal', 'HMD (Heat Management Device)');

-- Update purchase links
DELETE FROM purchase_links;
INSERT INTO purchase_links (equipment_name, description, url, country_code, price) VALUES
('Classic Hookah', 'Khalil Mamoon Official', 'https://www.khalil-mamoon.com/', 'WW', 85.0),
('HMD (Heat Management Device)', 'Kaloud Lotus I+', 'https://kaloud.com/', 'WW', 45.0),
('Phunnel Bowl', 'Alpaca Bowl Co.', 'https://alpacabowls.com/', 'WW', 30.0);
