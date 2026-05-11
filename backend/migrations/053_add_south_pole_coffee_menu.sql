-- Migration 053: Add South Pole Coffee as a test venue and seed its menu

-- 1. Insert South Pole Coffee venue (Antarctica)
INSERT INTO venues (id, name, latitude, longitude, address, city, country_code)
VALUES ('947d1853-c407-4b03-a855-c167979dc00d', 'South Pole Coffee', -90.0, 0.0, 'Amundsen-Scott South Pole Station', 'South Pole', 'AQ')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed 'Menu' tags for South Pole Coffee
DO $$
DECLARE
    cat_id UUID;
    t1_id UUID;
    t2_id UUID;
    t3_id UUID;
    v_id UUID := '947d1853-c407-4b03-a855-c167979dc00d';
BEGIN
    SELECT id INTO cat_id FROM tag_categories WHERE name = 'menu';
    
    -- Tag 1: Antarctic Blend
    INSERT INTO tags (category_id, name, display_order) 
    VALUES (cat_id, 'Antarctic Blend', 1)
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO t1_id;

    INSERT INTO tag_translations (tag_id, language_code, display_name) VALUES
    (t1_id, 'en', 'Antarctic Blend'),
    (t1_id, 'es-419', 'Mezcla Antártica'),
    (t1_id, 'pt-BR', 'Mistura Antártica'),
    (t1_id, 'ru', 'Антарктическая смесь'),
    (t1_id, 'ka', 'ანტარქტიკული ნაზავი')
    ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;

    -- Tag 2: Sub-Zero V60
    INSERT INTO tags (category_id, name, display_order) 
    VALUES (cat_id, 'Sub-Zero V60', 2)
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO t2_id;

    INSERT INTO tag_translations (tag_id, language_code, display_name) VALUES
    (t2_id, 'en', 'Sub-Zero V60'),
    (t2_id, 'es-419', 'V60 Bajo Cero'),
    (t2_id, 'pt-BR', 'V60 Sub-Zero'),
    (t2_id, 'ru', 'V60 Ниже Нуля'),
    (t2_id, 'ka', 'ყინულოვანი V60')
    ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;

    -- Tag 3: Aurora Espresso
    INSERT INTO tags (category_id, name, display_order) 
    VALUES (cat_id, 'Aurora Espresso', 3)
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO t3_id;

    INSERT INTO tag_translations (tag_id, language_code, display_name) VALUES
    (t3_id, 'en', 'Aurora Espresso'),
    (t3_id, 'es-419', 'Espresso Aurora'),
    (t3_id, 'pt-BR', 'Espresso Aurora'),
    (t3_id, 'ru', 'Эспрессо Аврора'),
    (t3_id, 'ka', 'ავრორა ესპრესო')
    ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;

    -- Link to venue
    INSERT INTO venue_tags (venue_id, tag_id, display_order) VALUES
    (v_id, t1_id, 1),
    (v_id, t2_id, 2),
    (v_id, t3_id, 3)
    ON CONFLICT DO NOTHING;
END $$;
