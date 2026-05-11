-- Migration 052: Add 'Menu' category for venue-specific coffee and methods as tags

-- Seed 'menu' category
INSERT INTO tag_categories (name, display_order) VALUES ('menu', 0)
ON CONFLICT (name) DO NOTHING;

-- Category Translations
DO $$
DECLARE
    menu_id UUID;
BEGIN
    SELECT id INTO menu_id FROM tag_categories WHERE name = 'menu';

    -- English
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (menu_id, 'en', 'On the Menu')
    ON CONFLICT DO NOTHING;

    -- Spanish
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (menu_id, 'es-419', 'En el Menú')
    ON CONFLICT DO NOTHING;

    -- Portuguese
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (menu_id, 'pt-BR', 'No Menu')
    ON CONFLICT DO NOTHING;

    -- Russian
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (menu_id, 'ru', 'В меню')
    ON CONFLICT DO NOTHING;

    -- Georgian
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (menu_id, 'ka', 'მენიუში')
    ON CONFLICT DO NOTHING;
END $$;

-- Helper to seed menu tags for venues
CREATE OR REPLACE FUNCTION seed_menu_tag(v_name VARCHAR, t_name VARCHAR, 
    en_val VARCHAR, es_val VARCHAR, pt_val VARCHAR, ru_val VARCHAR, ka_val VARCHAR)
RETURNS VOID AS $$
DECLARE
    cat_id UUID;
    t_id UUID;
    v_id UUID;
BEGIN
    SELECT id INTO cat_id FROM tag_categories WHERE name = 'menu';
    SELECT id INTO v_id FROM venues WHERE name = v_name LIMIT 1;
    
    IF v_id IS NOT NULL THEN
        INSERT INTO tags (category_id, name, display_order) 
        VALUES (cat_id, t_name, 0)
        ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
        RETURNING id INTO t_id;

        INSERT INTO tag_translations (tag_id, language_code, display_name) VALUES
        (t_id, 'en', en_val),
        (t_id, 'es-419', es_val),
        (t_id, 'pt-BR', pt_val),
        (t_id, 'ru', ru_val),
        (t_id, 'ka', ka_val)
        ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;

        INSERT INTO venue_tags (venue_id, tag_id, display_order)
        VALUES (v_id, t_id, 0)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed some examples for LETO Brew Lab
SELECT seed_menu_tag('LETO Brew Lab', 'V60 Ethiopia', 'V60 Ethiopia', 'V60 Etiopía', 'V60 Etiópia', 'V60 Эфиопия', 'V60 ეთიოპია');
SELECT seed_menu_tag('LETO Brew Lab', 'Flat White', 'Flat White', 'Flat White', 'Flat White', 'Флэт Уайт', 'ფლეთ უაითი');
SELECT seed_menu_tag('LETO Brew Lab', 'Cold Brew', 'Cold Brew', 'Cold Brew', 'Cold Brew', 'Колд Брю', 'ქოლდ ბრიუ');

DROP FUNCTION seed_menu_tag(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR);
