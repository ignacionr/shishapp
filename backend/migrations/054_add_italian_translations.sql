-- Italian Translations for Vidita Cafe

-- 1. Tag Categories
DO $$
DECLARE
    emo_id UUID;
    env_id UUID;
    tst_id UUID;
BEGIN
    SELECT id INTO emo_id FROM tag_categories WHERE name = 'emotional';
    SELECT id INTO env_id FROM tag_categories WHERE name = 'environment';
    SELECT id INTO tst_id FROM tag_categories WHERE name = 'taste';

    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (emo_id, 'it', 'Connessione Emotiva'),
    (env_id, 'it', 'Ambiente'),
    (tst_id, 'it', 'Profilo di Gusto')
    ON CONFLICT DO NOTHING;
END $$;

-- 2. Tag Translations
CREATE OR REPLACE FUNCTION add_it_tag_translation(t_name VARCHAR, it_val VARCHAR)
RETURNS VOID AS $$
DECLARE
    t_id UUID;
BEGIN
    SELECT id INTO t_id FROM tags WHERE name = t_name;
    IF t_id IS NOT NULL THEN
        INSERT INTO tag_translations (tag_id, language_code, display_name)
        VALUES (t_id, 'it', it_val)
        ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Emotional Tags
SELECT add_it_tag_translation('Cozy', 'Accogliente');
SELECT add_it_tag_translation('Focused', 'Concentrato');
SELECT add_it_tag_translation('Energetic', 'Energico');
SELECT add_it_tag_translation('Relaxed', 'Rilassato');

-- Environment Tags
SELECT add_it_tag_translation('Quiet', 'Tranquillo');
SELECT add_it_tag_translation('Noisy', 'Rumoroso');
SELECT add_it_tag_translation('Crowded', 'Affollato');
SELECT add_it_tag_translation('Sunlight', 'Luce Solare');
SELECT add_it_tag_translation('Music', 'Musica');

-- Taste Tags
SELECT add_it_tag_translation('Nutty', 'Note di Noce');
SELECT add_it_tag_translation('Acidic', 'Acidulo');
SELECT add_it_tag_translation('Chocolatey', 'Cioccolatoso');
SELECT add_it_tag_translation('Floral', 'Floreale');
SELECT add_it_tag_translation('Fruity', 'Fruttato');
SELECT add_it_tag_translation('Bitter', 'Amaro');
SELECT add_it_tag_translation('Sweet', 'Dolce');
SELECT add_it_tag_translation('Spicy', 'Speziato');
SELECT add_it_tag_translation('Caramel', 'Caramello');
SELECT add_it_tag_translation('Berry', 'Frutti di Bosco');
SELECT add_it_tag_translation('Citrus', 'Agrumato');
SELECT add_it_tag_translation('Earthy', 'Terroso');
SELECT add_it_tag_translation('Creamy', 'Cremoso');
SELECT add_it_tag_translation('Smoky', 'Affumicato');
SELECT add_it_tag_translation('Herbal', 'Erbaceo');
SELECT add_it_tag_translation('Honey', 'Miele');
SELECT add_it_tag_translation('Syrupy', 'Sciropposo');
SELECT add_it_tag_translation('Woody', 'Legnoso');
SELECT add_it_tag_translation('Vanilla', 'Vaniglia');
SELECT add_it_tag_translation('Toffee', 'Toffee');

DROP FUNCTION add_it_tag_translation(VARCHAR, VARCHAR);

-- 3. Equipment Translations
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'it', 
    CASE 
        WHEN name = 'French Press' THEN 'French Press'
        WHEN name = 'Moka Pot' THEN 'Moka'
        WHEN name = 'Syphon' THEN 'Sifone'
        WHEN name = 'Brik' THEN 'Brik'
        WHEN name = 'Hand Grinder' THEN 'Macinacaffè Manuale'
        WHEN name = 'Electric Grinder' THEN 'Macinacaffè Elettrico'
        WHEN name = 'Electric Kettle' THEN 'Bollitore Elettrico'
        WHEN name = 'Gooseneck Kettle' THEN 'Bollitore a Collo di Cigno'
        WHEN name = 'Digital Scale' THEN 'Bilancia Digitale'
        WHEN name = 'Cloth Filter' THEN 'Filtro in Stoffa'
        WHEN name = 'V60' THEN 'V60'
        WHEN name = 'Chemex' THEN 'Chemex'
        WHEN name = 'Aeropress' THEN 'Aeropress'
        WHEN name = 'Kalita Wave' THEN 'Kalita Wave'
        WHEN name = 'Clever Dripper' THEN 'Clever Dripper'
        ELSE name 
    END,
    description
FROM equipment
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name;

-- 4. Brewing Method Translations
INSERT INTO brewing_method_translations (method_id, language_code, display_name, description)
SELECT id, 'it',
    CASE
        WHEN id = 'french_press' THEN 'French Press'
        WHEN id = 'moka_pot' THEN 'Moka'
        WHEN id = 'syphon' THEN 'Sifone'
        WHEN id = 'turkish' THEN 'Caffè Turco'
        WHEN id = 'cloth_filter' THEN 'Filtro in Stoffa'
        WHEN id = 'espresso' THEN 'Espresso'
        WHEN id = 'cold_brew' THEN 'Cold Brew'
        WHEN id = 'v60' THEN 'V60'
        WHEN id = 'chemex' THEN 'Chemex'
        WHEN id = 'aeropress' THEN 'Aeropress'
        ELSE display_name
    END,
    description
FROM brewing_methods
ON CONFLICT (method_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;
