-- Arabic Translations for MyShisha.vip

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
    (emo_id, 'ar', 'الحالة النفسية'),
    (env_id, 'ar', 'البيئة'),
    (tst_id, 'ar', 'النكهة')
    ON CONFLICT (category_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;
END $$;

-- 2. Tag Translations
CREATE OR REPLACE FUNCTION add_ar_tag_translation(t_name VARCHAR, ar_val VARCHAR)
RETURNS VOID AS $$
DECLARE
    t_id UUID;
BEGIN
    SELECT id INTO t_id FROM tags WHERE name = t_name;
    IF t_id IS NOT NULL THEN
        INSERT INTO tag_translations (tag_id, language_code, display_name)
        VALUES (t_id, 'ar', ar_val)
        ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Emotional Tags
SELECT add_ar_tag_translation('Cozy', 'دافئ');
SELECT add_ar_tag_translation('Focused', 'مركز');
SELECT add_ar_tag_translation('Energetic', 'نشيط');
SELECT add_ar_tag_translation('Relaxed', 'مسترخٍ');

-- Environment Tags
SELECT add_ar_tag_translation('Quiet', 'هادئ');
SELECT add_ar_tag_translation('Noisy', 'صاخب');
SELECT add_ar_tag_translation('Crowded', 'مزدحم');
SELECT add_ar_tag_translation('Sunlight', 'ضوء الشمس');
SELECT add_ar_tag_translation('Music', 'موسيقى');

-- Taste Tags
SELECT add_ar_tag_translation('Nutty', 'مكسرات');
SELECT add_ar_tag_translation('Acidic', 'حمضي');
SELECT add_ar_tag_translation('Chocolatey', 'شوكولاتة');
SELECT add_ar_tag_translation('Floral', 'زهري');
SELECT add_ar_tag_translation('Fruity', 'فاكهي');
SELECT add_ar_tag_translation('Bitter', 'مر');
SELECT add_ar_tag_translation('Sweet', 'حلو');
SELECT add_ar_tag_translation('Spicy', 'حار');
SELECT add_ar_tag_translation('Caramel', 'كراميل');
SELECT add_ar_tag_translation('Berry', 'توت');
SELECT add_ar_tag_translation('Citrus', 'حمضيات');
SELECT add_ar_tag_translation('Earthy', 'ترابي');
SELECT add_ar_tag_translation('Creamy', 'كريمي');
SELECT add_ar_tag_translation('Smoky', 'مدخن');
SELECT add_ar_tag_translation('Herbal', 'عشبي');
SELECT add_ar_tag_translation('Honey', 'عسل');
SELECT add_ar_tag_translation('Syrupy', 'شراب');
SELECT add_ar_tag_translation('Woody', 'خشبي');
SELECT add_ar_tag_translation('Vanilla', 'فانيليا');
SELECT add_ar_tag_translation('Toffee', 'توفي');

DROP FUNCTION add_ar_tag_translation(VARCHAR, VARCHAR);

-- 3. Equipment Translations
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'ar', 
    CASE 
        WHEN name = 'Classic Hookah' THEN 'شيشة كلاسيكية'
        WHEN name = 'Modern Hookah' THEN 'شيشة حديثة'
        WHEN name = 'Phunnel Bowl' THEN 'رأس فونيل'
        WHEN name = 'Vortex Bowl' THEN 'رأس فورتيكس'
        WHEN name = 'Egyptian Bowl' THEN 'رأس مصري'
        WHEN name = 'HMD (Heat Management Device)' THEN 'جهاز إدارة الحرارة'
        WHEN name = 'Coconut Charcoal' THEN 'فحم جوز الهند'
        WHEN name = 'Silicone Hose' THEN 'بربيش سيليكون'
        WHEN name = 'Heat Resistant Tongs' THEN 'ملقط فحم مقاوم للحرارة'
        ELSE name 
    END,
    description
FROM equipment
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name;

-- 4. Brewing Method Translations
INSERT INTO brewing_method_translations (method_id, language_code, display_name, description)
SELECT id, 'ar',
    CASE
        WHEN id = 'phunnel_hmd' THEN 'فونيل + جهاز حرارة'
        WHEN id = 'traditional_foil' THEN 'قصدير تقليدي'
        WHEN id = 'vortex_setup' THEN 'إعداد فورتيكس'
        ELSE display_name
    END,
    description
FROM brewing_methods
ON CONFLICT (method_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name;
