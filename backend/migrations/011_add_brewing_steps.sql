-- Table for brewing steps
CREATE TABLE IF NOT EXISTS brewing_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_id VARCHAR(50) NOT NULL REFERENCES brewing_methods(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    duration INT NOT NULL DEFAULT 0, -- in seconds
    target_water DOUBLE PRECISION, -- in grams (total water at the end of this step)
    target_temp DOUBLE PRECISION, -- in Celsius
    UNIQUE(method_id, order_index)
);

-- Table for brewing step translations
CREATE TABLE IF NOT EXISTS brewing_step_translations (
    step_id UUID NOT NULL REFERENCES brewing_steps(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    instruction TEXT NOT NULL,
    PRIMARY KEY (step_id, language_code)
);

-- Seed steps for V60
DO $$
DECLARE
    v60_id VARCHAR(50) := 'v60';
    s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID;
BEGIN
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (v60_id, 1, 0, 0) RETURNING id INTO s1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (v60_id, 2, 0, 15) RETURNING id INTO s2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (v60_id, 3, 30, 30) RETURNING id INTO s3;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (v60_id, 4, 60, 150) RETURNING id INTO s4;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (v60_id, 5, 60, 250) RETURNING id INTO s5;

    -- English
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'en', 'Rinse filter and pre-heat brewer.'),
    (s2, 'en', 'Add 15g of medium-fine ground coffee.'),
    (s3, 'en', 'Start timer and bloom with 30g of water.'),
    (s4, 'en', 'At 30s, pour up to 150g in circular motions.'),
    (s5, 'en', 'At 1:30, pour up to 250g and let it drain.');

    -- Spanish
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'es-419', 'Enjuaga el filtro y precalienta la cafetera.'),
    (s2, 'es-419', 'Agrega 15g de café molido medio-fino.'),
    (s3, 'es-419', 'Inicia el temporizador y realiza el bloom con 30g de agua.'),
    (s4, 'es-419', 'A los 30s, vierte hasta 150g en movimientos circulares.'),
    (s5, 'es-419', 'Al 1:30, vierte hasta 250g y deja filtrar.');
    
    -- Portuguese
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'pt-BR', 'Enxágue o filtro e pré-aqueça a cafeteira.'),
    (s2, 'pt-BR', 'Adicione 15g de café moído médio-fino.'),
    (s3, 'pt-BR', 'Inicie o cronômetro e faça o bloom com 30g de água.'),
    (s4, 'pt-BR', 'Aos 30s, despeje até 150g em movimentos circulares.'),
    (s5, 'pt-BR', 'A 1:30, despeje até 250g e deixe filtrar.');

    -- Russian
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'ru', 'Промойте фильтр и прогрейте воронку.'),
    (s2, 'ru', 'Насыпьте 15 г кофе среднего помола.'),
    (s3, 'ru', 'Запустите таймер и смочите кофе 30 г воды (блум).'),
    (s4, 'ru', 'На 30-й секунде влейте воду до 150 г круговыми движениями.'),
    (s5, 'ru', 'В 1:30 влейте воду до 250 г и дайте ей просочиться.');

    -- Georgian
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'ka', 'გარეცხეთ ფილტრი და გააცხელეთ მადუღარა.'),
    (s2, 'ka', 'დაამატეთ 15გ საშუალოდ დაფქული ყავა.'),
    (s3, 'ka', 'ჩართეთ ტაიმერი და დაასხით 30გ წყალი (ბლუმი).'),
    (s4, 'ka', '30 წამზე, დაასხით 150გ-მდე წყალი წრიული მოძრაობით.'),
    (s5, 'ka', '1:30 წუთზე, დაასხით 250გ-მდე და აცადეთ გაფილტვრა.');
END $$;
