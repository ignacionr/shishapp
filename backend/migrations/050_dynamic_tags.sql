-- Dynamic, Categorized and Localized Tags for Vidita Cafe

CREATE TABLE IF NOT EXISTS tag_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- Internal identifier (e.g., 'taste')
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tag_category_translations (
    category_id UUID REFERENCES tag_categories(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (category_id, language_code)
);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES tag_categories(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Internal identifier (e.g., 'honey')
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(category_id, name)
);

CREATE TABLE IF NOT EXISTS tag_translations (
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (tag_id, language_code)
);

-- Seed Categories
INSERT INTO tag_categories (name, display_order) VALUES
('emotional', 1),
('environment', 2),
('taste', 3);

-- Category Translations
DO $$
DECLARE
    emo_id UUID;
    env_id UUID;
    tst_id UUID;
BEGIN
    SELECT id INTO emo_id FROM tag_categories WHERE name = 'emotional';
    SELECT id INTO env_id FROM tag_categories WHERE name = 'environment';
    SELECT id INTO tst_id FROM tag_categories WHERE name = 'taste';

    -- English
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (emo_id, 'en', 'Emotional Connection'),
    (env_id, 'en', 'Environment'),
    (tst_id, 'en', 'Taste Profile');

    -- Spanish
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (emo_id, 'es-419', 'Conexión Emocional'),
    (env_id, 'es-419', 'Ambiente'),
    (tst_id, 'es-419', 'Perfil de Sabor');

    -- Portuguese
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (emo_id, 'pt-BR', 'Conexão Emocional'),
    (env_id, 'pt-BR', 'Ambiente'),
    (tst_id, 'pt-BR', 'Perfil de Sabor');

    -- Russian
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (emo_id, 'ru', 'Эмоциональная связь'),
    (env_id, 'ru', 'Окружение'),
    (tst_id, 'ru', 'Вкусовой профиль');

    -- Georgian
    INSERT INTO tag_category_translations (category_id, language_code, display_name) VALUES
    (emo_id, 'ka', 'ემოციური კავშირი'),
    (env_id, 'ka', 'გარემო'),
    (tst_id, 'ka', 'გემოვნური პროფილი');
END $$;

-- Seed Tags helper function
CREATE OR REPLACE FUNCTION seed_tag(cat_name VARCHAR, t_name VARCHAR, t_order INT, 
    en_val VARCHAR, es_val VARCHAR, pt_val VARCHAR, ru_val VARCHAR, ka_val VARCHAR)
RETURNS VOID AS $$
DECLARE
    cat_id UUID;
    t_id UUID;
BEGIN
    SELECT id INTO cat_id FROM tag_categories WHERE name = cat_name;
    
    INSERT INTO tags (category_id, name, display_order) 
    VALUES (cat_id, t_name, t_order)
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO t_id;

    INSERT INTO tag_translations (tag_id, language_code, display_name) VALUES
    (t_id, 'en', en_val),
    (t_id, 'es-419', es_val),
    (t_id, 'pt-BR', pt_val),
    (t_id, 'ru', ru_val),
    (t_id, 'ka', ka_val)
    ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;
END;
$$ LANGUAGE plpgsql;

-- Emotional Tags
SELECT seed_tag('emotional', 'Cozy', 1, 'Cozy', 'Acogedor', 'Aconchegante', 'Уютно', 'მყუდრო');
SELECT seed_tag('emotional', 'Focused', 2, 'Focused', 'Concentrado', 'Focado', 'Сосредоточенно', 'ფოკუსირებული');
SELECT seed_tag('emotional', 'Energetic', 3, 'Energetic', 'Energético', 'Energético', 'Энергично', 'ენერგიული');
SELECT seed_tag('emotional', 'Relaxed', 4, 'Relaxed', 'Relajado', 'Relaxado', 'Расслабленно', 'რელაქსირებული');

-- Environment Tags
SELECT seed_tag('environment', 'Quiet', 1, 'Quiet', 'Tranquilo', 'Tranquilo', 'Тихо', 'წყნარი');
SELECT seed_tag('environment', 'Noisy', 2, 'Noisy', 'Ruidoso', 'Barulhento', 'Шумно', 'ხმაურიანი');
SELECT seed_tag('environment', 'Crowded', 3, 'Crowded', 'Concurrido', 'Lotado', 'Людно', 'ხალხმრავალი');
SELECT seed_tag('environment', 'Sunlight', 4, 'Sunlight', 'Luz Solar', 'Luz Solar', 'Солнечный свет', 'მზის შუქი');
SELECT seed_tag('environment', 'Music', 5, 'Music', 'Música', 'Música', 'Музыка', 'მუსიკა');

-- Taste Tags
SELECT seed_tag('taste', 'Nutty', 1, 'Nutty', 'Nuez', 'Nozes', 'Ореховый', 'თხილისებრი');
SELECT seed_tag('taste', 'Acidic', 2, 'Acidic', 'Ácido', 'Ácido', 'Кислый', 'მჟავე');
SELECT seed_tag('taste', 'Chocolatey', 3, 'Chocolatey', 'Achocolatado', 'Chocolatado', 'Шоколадный', 'შოკოლადისებრი');
SELECT seed_tag('taste', 'Floral', 4, 'Floral', 'Floral', 'Floral', 'Цветочный', 'ყვავილოვანი');
SELECT seed_tag('taste', 'Fruity', 5, 'Fruity', 'Frutal', 'Frutado', 'Фруктовый', 'ხილი');
SELECT seed_tag('taste', 'Bitter', 6, 'Bitter', 'Amargo', 'Amargo', 'Горький', 'მწარე');
SELECT seed_tag('taste', 'Sweet', 7, 'Sweet', 'Dulce', 'Doce', 'Сладкий', 'ტკბილი');
SELECT seed_tag('taste', 'Spicy', 8, 'Spicy', 'Especiado', 'Especiado', 'Пряный', 'ცხარე');
SELECT seed_tag('taste', 'Caramel', 9, 'Caramel', 'Caramelo', 'Caramelo', 'Карамельный', 'კარამელი');
SELECT seed_tag('taste', 'Berry', 10, 'Berry', 'Baya', 'Bagas', 'Ягодный', 'კენკრა');
SELECT seed_tag('taste', 'Citrus', 11, 'Citrus', 'Cítrico', 'Cítrico', 'Цитрусовый', 'ციტრუსი');
SELECT seed_tag('taste', 'Earthy', 12, 'Earthy', 'Terroso', 'Terroso', 'Землистый', 'მიწისებრი');
SELECT seed_tag('taste', 'Creamy', 13, 'Creamy', 'Cremoso', 'Cremoso', 'Сливочный', 'კრემისებრი');
SELECT seed_tag('taste', 'Smoky', 14, 'Smoky', 'Ahumado', 'Defumado', 'Дымный', 'შებოლილი');
SELECT seed_tag('taste', 'Herbal', 15, 'Herbal', 'Herbal', 'Herbal', 'Травяной', 'ბალახოვანი');
SELECT seed_tag('taste', 'Honey', 16, 'Honey', 'Miel', 'Mel', 'Мед', 'თაფლი');
SELECT seed_tag('taste', 'Syrupy', 17, 'Syrupy', 'Almibarrado', 'Xaroposo', 'Сиропный', 'სიროფისებრი');
SELECT seed_tag('taste', 'Woody', 18, 'Woody', 'Amaderado', 'Amadeirado', 'Древесный', 'მერქნოვანი');
SELECT seed_tag('taste', 'Vanilla', 19, 'Vanilla', 'Vainilla', 'Baunilha', 'Ванильный', 'ვანილი');
SELECT seed_tag('taste', 'Toffee', 20, 'Toffee', 'Toffee', 'Toffee', 'Ириска', 'კარამელი');

DROP FUNCTION seed_tag(VARCHAR, VARCHAR, INT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR);
