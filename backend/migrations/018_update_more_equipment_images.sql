-- Migration: Update equipment images for better quality assets
UPDATE equipment SET image_url = '/static/images/manual_grinder.png' WHERE name = 'Hand Grinder';
UPDATE equipment SET image_url = '/static/images/cloth_filter.png' WHERE name = 'Cloth Filter';
UPDATE equipment SET image_url = '/static/images/clever_dripper.png' WHERE name = 'Clever Dripper';
UPDATE equipment SET image_url = '/static/images/kalita_wave.png' WHERE name = 'Kalita Wave';
UPDATE equipment SET image_url = '/static/images/gooseneck_kettle.png' WHERE name = 'Gooseneck Kettle';
