-- Add Cloth Filter equipment and brewing method
INSERT INTO equipment (name, category, description, image_url) VALUES
('Cloth Filter', 'brewer', 'A traditional brewing tool using a textile filter (often flannel) that allows more oils to pass through than paper, resulting in a rich, velvety body.', '/static/images/v60.jpg')
ON CONFLICT (name) DO NOTHING;

INSERT INTO brewing_methods (id, display_name, description, required_equipment, optional_equipment) VALUES
('cloth_filter', 'Cloth Filter', 'Traditional textile filtration brewing', 'Cloth Filter, Hand Grinder, Electric Kettle', 'Digital Scale')
ON CONFLICT (id) DO NOTHING;
