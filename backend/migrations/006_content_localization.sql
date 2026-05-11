-- Create translation tables for localized content
CREATE TABLE IF NOT EXISTS equipment_translations (
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (equipment_id, language_code)
);

CREATE TABLE IF NOT EXISTS brewing_method_translations (
    method_id VARCHAR(50) REFERENCES brewing_methods(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (method_id, language_code)
);

-- Seed Equipment Translations (English - Base)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'en', name, description FROM equipment
ON CONFLICT DO NOTHING;

-- Seed Brewing Method Translations (English - Base)
INSERT INTO brewing_method_translations (method_id, language_code, display_name, description)
SELECT id, 'en', display_name, description FROM brewing_methods
ON CONFLICT DO NOTHING;

-- Seed Spanish Translations
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'es-419', 
    CASE 
        WHEN name = 'French Press' THEN 'Prensa Francesa'
        WHEN name = 'Moka Pot' THEN 'Cafetera Moka'
        WHEN name = 'Syphon' THEN 'Sifón'
        WHEN name = 'Brik' THEN 'Brik (Turca)'
        WHEN name = 'Hand Grinder' THEN 'Molino Manual'
        WHEN name = 'Electric Grinder' THEN 'Molino Eléctrico'
        WHEN name = 'Electric Kettle' THEN 'Pava Eléctrica'
        WHEN name = 'Gooseneck Kettle' THEN 'Pava Cuello de Cisne'
        WHEN name = 'Digital Scale' THEN 'Balanza Digital'
        WHEN name = 'Cloth Filter' THEN 'Filtro de Tela'
        ELSE name 
    END,
    description
FROM equipment
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO brewing_method_translations (method_id, language_code, display_name, description)
SELECT id, 'es-419',
    CASE
        WHEN id = 'french_press' THEN 'Prensa Francesa'
        WHEN id = 'moka_pot' THEN 'Cafetera Moka'
        WHEN id = 'syphon' THEN 'Sifón'
        WHEN id = 'turkish' THEN 'Café Turco'
        WHEN id = 'cloth_filter' THEN 'Filtro de Tela'
        ELSE display_name
    END,
    description
FROM brewing_methods
ON CONFLICT (method_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Seed Portuguese Translations
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'pt-BR', 
    CASE 
        WHEN name = 'French Press' THEN 'Prensa Francesa'
        WHEN name = 'Moka Pot' THEN 'Cafeteira Moka'
        WHEN name = 'Syphon' THEN 'Sifão'
        WHEN name = 'Brik' THEN 'Brik (Turca)'
        WHEN name = 'Hand Grinder' THEN 'Moedor Manual'
        WHEN name = 'Electric Grinder' THEN 'Moedor Elétrico'
        WHEN name = 'Electric Kettle' THEN 'Chaleira Elétrica'
        WHEN name = 'Gooseneck Kettle' THEN 'Chaleira Pescoço de Ganso'
        WHEN name = 'Digital Scale' THEN 'Balanza Digital'
        WHEN name = 'Cloth Filter' THEN 'Coador de Pano'
        ELSE name 
    END,
    description
FROM equipment
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO brewing_method_translations (method_id, language_code, display_name, description)
SELECT id, 'pt-BR',
    CASE
        WHEN id = 'french_press' THEN 'Prensa Francesa'
        WHEN id = 'moka_pot' THEN 'Cafeteira Moka'
        WHEN id = 'syphon' THEN 'Sifão'
        WHEN id = 'turkish' THEN 'Café Turco'
        WHEN id = 'cloth_filter' THEN 'Coador de Pano'
        ELSE display_name
    END,
    description
FROM brewing_methods
ON CONFLICT (method_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Seed Russian Translations
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'ru', 
    CASE 
        WHEN name = 'French Press' THEN 'Френч-пресс'
        WHEN name = 'Moka Pot' THEN 'Гейзерная кофеварка'
        WHEN name = 'Syphon' THEN 'Сифон'
        WHEN name = 'Brik' THEN 'Турка'
        WHEN name = 'Hand Grinder' THEN 'Ручная кофемолка'
        WHEN name = 'Electric Grinder' THEN 'Электрическая кофемолка'
        WHEN name = 'Electric Kettle' THEN 'Электрический чайник'
        WHEN name = 'Gooseneck Kettle' THEN 'Чайник с узким носиком'
        WHEN name = 'Digital Scale' THEN 'Цифровые весы'
        WHEN name = 'Cloth Filter' THEN 'Тканевый фильтр'
        ELSE name 
    END,
    description
FROM equipment
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO brewing_method_translations (method_id, language_code, display_name, description)
SELECT id, 'ru',
    CASE
        WHEN id = 'french_press' THEN 'Френч-пресс'
        WHEN id = 'moka_pot' THEN 'Гейзерная кофеварка'
        WHEN id = 'syphon' THEN 'Сифон'
        WHEN id = 'turkish' THEN 'Кофе по-турецки'
        WHEN id = 'cloth_filter' THEN 'Тканевый фильтр'
        WHEN id = 'cold_brew' THEN 'Колд брю'
        ELSE display_name
    END,
    description
FROM brewing_methods
ON CONFLICT (method_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Seed Georgian Translations
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'ka', 
    CASE 
        WHEN name = 'French Press' THEN 'ფრენჩ პრესი'
        WHEN name = 'Moka Pot' THEN 'მოკა პოტი'
        WHEN name = 'Syphon' THEN 'სიფონი'
        WHEN name = 'Brik' THEN 'ბრიკი (თურქული)'
        WHEN name = 'Hand Grinder' THEN 'ხელის საფქვავი'
        WHEN name = 'Electric Grinder' THEN 'ელექტრო საფქვავი'
        WHEN name = 'Electric Kettle' THEN 'ელექტრო ჩაიდანი'
        WHEN name = 'Gooseneck Kettle' THEN 'გრძელცხვირიანი ჩაიდანი'
        WHEN name = 'Digital Scale' THEN 'ციფრული სასწორი'
        WHEN name = 'Cloth Filter' THEN 'ნაჭრის ფილტრი'
        ELSE name 
    END,
    description
FROM equipment
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO brewing_method_translations (method_id, language_code, display_name, description)
SELECT id, 'ka',
    CASE
        WHEN id = 'french_press' THEN 'ფრენჩ პრესი'
        WHEN id = 'moka_pot' THEN 'მოკა პოტი'
        WHEN id = 'syphon' THEN 'სიფონი'
        WHEN id = 'turkish' THEN 'თურქული ყავა'
        WHEN id = 'cloth_filter' THEN 'ნაჭრის ფილტრი'
        WHEN id = 'cold_brew' THEN 'ქოლდ ბრიუ'
        WHEN id = 'espresso' THEN 'ესპრესო'
        ELSE display_name
    END,
    description
FROM brewing_methods
ON CONFLICT (method_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;
