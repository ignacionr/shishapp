-- Migration: Add Hario V60 Paper Filters (Size 02) for Argentina
-- Category: 'filters'

INSERT INTO equipment (name, slug, category, description, image_url) 
VALUES ('V60 Paper Filters AR', 'v60-paper-filters-ar', 'filters', 'Standard Hario V60-02 paper filters for a clean cup. Bleached white.', '/static/images/v60_paper_filters.webp')
ON CONFLICT (slug) DO UPDATE SET 
    image_url = EXCLUDED.image_url;

-- Add Purchase Link for AR
INSERT INTO purchase_links (equipment_name, url, country_code, price, description)
VALUES ('V60 Paper Filters AR', 'https://meli.la/2xXXSG2', 'AR', 12500, 'Filtros Hario V60-02 (100u) - Mercado Libre')
ON CONFLICT DO NOTHING;

-- Localized Names and Descriptions
-- English (en)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'en', 'V60 Paper Filters (100 pack)', 'Standard Hario V60-02 paper filters for a clean cup. Bleached white.'
FROM equipment WHERE slug = 'v60-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Spanish (es-419)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'es-419', 'Filtros de Papel V60 (100u)', 'Filtros de papel Hario V60-02 estándar para una taza limpia. Color blanco.'
FROM equipment WHERE slug = 'v60-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Portuguese (pt-BR)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'pt-BR', 'Filtros de Papel V60 (100u)', 'Filtros de papel Hario V60-02 padrão para uma xícara limpa. Brancos.'
FROM equipment WHERE slug = 'v60-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Russian (ru)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'ru', 'Бумажные фильтры V60 (100 шт)', 'Стандартные бумажные фильтры Hario V60-02 для чистой чашки. Отбеленные.'
FROM equipment WHERE slug = 'v60-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Georgian (ka)
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT id, 'ka', 'V60-ის ქაღალდის ფილტრები (100 ცალი)', 'სტანდარტული Hario V60-02 ქაღალდის ფილტრები სუფთა ყავისთვის. გათეთრებული.'
FROM equipment WHERE slug = 'v60-paper-filters-ar'
ON CONFLICT (equipment_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
