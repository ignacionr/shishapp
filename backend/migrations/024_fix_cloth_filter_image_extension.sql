-- Fix Cloth Filter image URL (previous migration 023 used .webp but was updated to .png after being applied)
UPDATE equipment SET image_url = '/static/images/cloth_filter.png' WHERE name = 'Cloth Filter';
