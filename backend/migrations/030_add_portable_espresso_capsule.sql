-- Add Portable Espresso Machine (Capsule) to Catalog and Links
INSERT INTO equipment (name, slug, category, description, image_url) 
VALUES ('Portable Espresso Machine (Capsule)', 'portable-capsule-espresso', 'brewer', 'A compact, portable espresso maker designed for travel and outdoor use, compatible with capsules.', 'https://www.wacaco.com/cdn/shop/files/Minipresso_NS2_1.jpg?v=1663833600&width=800');

-- Get the ID for translations and links
DO $$
DECLARE
    eq_id UUID;
BEGIN
    SELECT id INTO eq_id FROM equipment WHERE name = 'Portable Espresso Machine (Capsule)';

    -- 1. Translations
    INSERT INTO equipment_translations (equipment_id, language_code, name, description) VALUES
    (eq_id, 'en', 'Portable Capsule Espresso Machine', 'Compact and powerful espresso maker designed for convenience. Perfect for travel, camping, or the office. Compatible with standard capsules.'),
    (eq_id, 'es-419', 'Cafetera Espresso Portátil (Cápsulas)', 'Cafetera compacta y potente diseñada para tu comodidad. Ideal para viajes, camping o la oficina. Compatible con cápsulas estándar.'),
    (eq_id, 'pt-BR', 'Cafeteira Expresso Portátil (Cápsulas)', 'Cafeteira compacta e potente projetada para sua conveniência. Perfeita para viagens, acampamentos ou escritório. Compatível com cápsulas padrão.'),
    (eq_id, 'ru', 'Портативная кофеварка (капсульная)', 'Компактная и мощная кофеварка для эспрессо. Идеально подходит для путешествий, походов или офиса. Совместима со стандартными капсулами.'),
    (eq_id, 'ka', 'პორტატული ესპრესოს აპარატი (კაფსულის)', 'კომპაქტური და მძლავრი ესპრესოს აპარატი თქვენი კომფორტისთვის. იდეალურია მოგზაურობისას, კემპინგისას ან ოფისში. თავსებადია სტანდარტულ კაფსულებთან.');

    -- 2. Affiliate Link (Argentina)
    INSERT INTO purchase_links (equipment_name, description, url, country_code, price) VALUES
    ('Portable Espresso Machine (Capsule)', '10% OFF at Mercado Libre', 'https://meli.la/19W7tPQ', 'AR', 91470);
END $$;
