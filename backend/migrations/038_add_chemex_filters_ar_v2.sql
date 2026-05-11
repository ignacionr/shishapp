-- Migration: Add Chemex Paper Filters for Argentina
-- Category: 'filters'

INSERT INTO equipment (name, slug, category, description, image_url) 
VALUES ('Chemex Paper Filters AR', 'chemex-paper-filters-ar', 'filters', 'High-quality bonded paper filters for Chemex brewers. Ensures clarity and bright acidity.', '/static/images/chemex_paper_filters.webp')
ON CONFLICT (slug) DO UPDATE SET 
    image_url = EXCLUDED.image_url;

-- Add Purchase Link for AR
INSERT INTO purchase_links (equipment_name, url, country_code, price, description)
VALUES ('Chemex Paper Filters AR', 'https://meli.la/1tHMaCR', 'AR', 18500, 'Filtros Chemex Square (100u) - Mercado Libre')
ON CONFLICT DO NOTHING;

-- Link with Chemex brewing method
UPDATE brewing_methods 
SET consumables = CASE 
    WHEN consumables IS NULL OR consumables = '' THEN 'Chemex Paper Filters AR'
    WHEN consumables NOT LIKE '%Chemex Paper Filters AR%' THEN consumables || ', Chemex Paper Filters AR'
    ELSE consumables
END
WHERE id = 'chemex';

-- Localized Names and Descriptions
-- English (en)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'en', 'Chemex Paper Filters', 'High-quality bonded paper filters for Chemex brewers. Ensures clarity and bright acidity.'
FROM equipment WHERE slug = 'chemex-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Spanish (es-419)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'es-419', 'Filtros de Papel Chemex', 'Filtros de papel de alta calidad para cafeteras Chemex. Garantiza claridad y acidez brillante.'
FROM equipment WHERE slug = 'chemex-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Portuguese (pt-BR)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'pt-BR', 'Filtros de Papel Chemex', 'Filtros de papel de alta qualidade para cafeteiras Chemex. Garante clareza e acidez brilhante.'
FROM equipment WHERE slug = 'chemex-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Russian (ru)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'ru', 'Бумажные фильтры Chemex', 'Высококачественные бумажные фильтры для кофеварок Chemex. Обеспечивают чистоту вкуса и яркую кислотность.'
FROM equipment WHERE slug = 'chemex-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Georgian (ka)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'ka', 'Chemex-ის ქაღალდის ფილტრები', 'მაღალი ხარისხის ქაღალდის ფილტრები Chemex-ის მადუღარებისთვის. უზრუნველყოფს გემოს სისუფთავეს და მკაფიო მჟავიანობას.'
FROM equipment WHERE slug = 'chemex-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
