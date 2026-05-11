-- Add Capsules brewing method and its steps
INSERT INTO brewing_methods (id, display_name, description, required_equipment, optional_equipment) 
VALUES ('capsules', 'Capsules', 'Portable capsule-based espresso extraction.', 'Portable Espresso Machine (Capsule)', '')
ON CONFLICT (id) DO NOTHING;

-- Seed steps for Capsules method
DO $$
DECLARE
    method_id VARCHAR(50) := 'capsules';
    s1 UUID; s2 UUID; s3 UUID;
BEGIN
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (method_id, 1, 10, 0) RETURNING id INTO s1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (method_id, 2, 10, 80) RETURNING id INTO s2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (method_id, 3, 30, 80) RETURNING id INTO s3;

    -- English
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'en', 'Insert the capsule into the machine.'),
    (s2, 'en', 'Fill the water tank with hot water (up to 80ml).'),
    (s3, 'en', 'Pump or press the button to start the extraction.');

    -- Spanish
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'es-419', 'Inserta la cápsula en la máquina.'),
    (s2, 'es-419', 'Llena el tanque con agua caliente (hasta 80ml).'),
    (s3, 'es-419', 'Bombea o presiona el botón para iniciar la extracción.');
    
    -- Portuguese
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'pt-BR', 'Insira a cápsula na máquina.'),
    (s2, 'pt-BR', 'Encha o reservatório com água quente (até 80ml).'),
    (s3, 'pt-BR', 'Bombeie ou pressione o botão para iniciar a extração.');

    -- Russian
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'ru', 'Вставьте капсулу в кофеварку.'),
    (s2, 'ru', 'Налейте горячую воду в резервуар (до 80 мл).'),
    (s3, 'ru', 'Начните процесс экстракции (накачиванием или кнопкой).');

    -- Georgian
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'ka', 'მოათავსეთ კაფსულა აპარატში.'),
    (s2, 'ka', 'შეავსეთ ავზი ცხელი წყლით (80 მლ-მდე).'),
    (s3, 'ka', 'დაიწყეთ ექსტრაქცია (ღილაკით ან დატუმბვით).');
END $$;
