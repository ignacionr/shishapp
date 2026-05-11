-- Migration: Update Digital Scale image to the newly downloaded asset
UPDATE equipment SET image_url = '/static/images/scale.png' WHERE name = 'Digital Scale';
