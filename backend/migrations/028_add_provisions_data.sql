-- Migration: Add Provisions (beans, subscriptions, capsules, filters)
-- Categories: 'beans', 'subscription', 'capsule', 'filters'

INSERT INTO equipment (name, slug, category, description, image_url) VALUES
('Specialty Coffee Beans', 'specialty-coffee-beans', 'beans', 'High-quality, freshly roasted specialty beans from local roasters.', '/static/images/coffee_beans.png'),
('Monthly Coffee Subscription', 'monthly-coffee-subscription', 'subscription', 'A curated selection of the best roasters delivered to your door every month.', '/static/images/subscription.png'),
('Nespresso Compatible Capsules', 'nespresso-compatible-capsules', 'capsule', 'Premium specialty coffee in a convenient capsule format.', '/static/images/capsules.png'),
('V60 Paper Filters (100 pack)', 'v60-paper-filters-100-pack', 'filters', 'Standard Hario V60-02 paper filters for a clean cup.', '/static/images/v60.jpg'),
('Chemex Bonded Filters', 'chemex-bonded-filters', 'filters', 'Thick bonded Chemex filters for superior clarity.', '/static/images/chemex.jpg'),
('Aeropress Micro-Filters', 'aeropress-micro-filters', 'filters', 'Original paper micro-filters for the Aeropress.', '/static/images/aeropress.jpg')
ON CONFLICT (name) DO UPDATE SET 
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;
