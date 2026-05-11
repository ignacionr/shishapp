-- Update Cloth Filter image to the new version (webp content but .png extension for compatibility)
UPDATE equipment SET image_url = '/static/images/cloth_filter.png' WHERE name = 'Cloth Filter';
