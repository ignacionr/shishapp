-- Refine equipment requirements for brewing methods
-- Moving Grinders and Scales to 'optional' where it makes sense (you can use pre-ground coffee or volumetric measures)

UPDATE brewing_methods SET 
    required_equipment = 'V60, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'v60';

UPDATE brewing_methods SET 
    required_equipment = 'Chemex, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'chemex';

UPDATE brewing_methods SET 
    required_equipment = 'Aeropress, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'aeropress';

UPDATE brewing_methods SET 
    required_equipment = 'French Press, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'french_press';

UPDATE brewing_methods SET 
    required_equipment = 'Espresso', 
    optional_equipment = 'Electric Grinder, Digital Scale'
WHERE id = 'espresso';

UPDATE brewing_methods SET 
    required_equipment = 'Moka Pot, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'moka_pot';

UPDATE brewing_methods SET 
    required_equipment = 'Syphon, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'syphon';

UPDATE brewing_methods SET 
    required_equipment = 'Cold Brew', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'cold_brew';

UPDATE brewing_methods SET 
    required_equipment = 'Kalita Wave, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'kalita_wave';

UPDATE brewing_methods SET 
    required_equipment = 'Clever Dripper, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'clever_dripper';

UPDATE brewing_methods SET 
    required_equipment = 'Brik, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'turkish';

UPDATE brewing_methods SET 
    required_equipment = 'Cloth Filter, Electric Kettle', 
    optional_equipment = 'Hand Grinder, Digital Scale'
WHERE id = 'cloth_filter';
