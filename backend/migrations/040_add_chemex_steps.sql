-- Seed steps for Chemex
DO $$
DECLARE
    chemex_id VARCHAR(50) := 'chemex';
    s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID;
BEGIN
    -- We use standard 30g/500ml proportions for the seed, 
    -- but our dynamic engine will scale these based on user input.
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (chemex_id, 1, 0, 0) RETURNING id INTO s1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (chemex_id, 2, 0, 30) RETURNING id INTO s2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (chemex_id, 3, 45, 90) RETURNING id INTO s3;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (chemex_id, 4, 60, 300) RETURNING id INTO s4;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (chemex_id, 5, 60, 500) RETURNING id INTO s5;

    -- English
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'en', 'Rinse the thick Chemex filter with hot water to remove paper taste.'),
    (s2, 'en', 'Add 30g of coarse ground coffee (sea salt consistency).'),
    (s3, 'en', 'Start timer and bloom with 90g of water. Swirl gently.'),
    (s4, 'en', 'At 45s, pour up to 300g. Maintain a steady stream in the center.'),
    (s5, 'en', 'At 1:45, pour remaining water up to 500g and let it draw down.');

    -- Spanish
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'es-419', 'Enjuaga el filtro grueso de Chemex con agua caliente.'),
    (s2, 'es-419', 'Agrega 30g de café molido grueso (consistencia de sal de mar).'),
    (s3, 'es-419', 'Inicia el cronómetro y haz el bloom con 90g de agua. Agita suavemente.'),
    (s4, 'es-419', 'A los 45s, vierte hasta 300g con un flujo constante en el centro.'),
    (s5, 'es-419', 'Al 1:45, vierte el resto del agua hasta 500g y deja filtrar.');
    
    -- Portuguese
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'pt-BR', 'Enxágue o filtro grosso da Chemex com água quente.'),
    (s2, 'pt-BR', 'Adicione 30g de café moído grosso (consistência de sal marinho).'),
    (s3, 'pt-BR', 'Inicie o cronômetro e faça o bloom com 90g de água. Mexa suavemente.'),
    (s4, 'pt-BR', 'Aos 45s, despeje até 300g com um fluxo constante no centro.'),
    (s5, 'pt-BR', 'A 1:45, despeje o restante da água até 500g e deixe filtrar.');

    -- Russian
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'ru', 'Промойте толстый фильтр Chemex горячей водой.'),
    (s2, 'ru', 'Насыпьте 30 г кофе крупного помола (как морская соль).'),
    (s3, 'ru', 'Запустите таймер и смочите кофе 90 г воды. Слегка взболтайте.'),
    (s4, 'ru', 'На 45-й секунде влейте воду до 300 г ровной струей в центр.'),
    (s5, 'ru', 'В 1:45 влейте оставшуюся воду до 500 г и дайте ей просочиться.');

    -- Georgian
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s1, 'ka', 'გარეცხეთ Chemex-ის სქელი ფილტრი ცხელი წყლით.'),
    (s2, 'ka', 'დაამატეთ 30გ მსხვილად დაფქული ყავა.'),
    (s3, 'ka', 'ჩართეთ ტაიმერი და დაასხით 90გ წყალი. მსუბუქად მოურიეთ.'),
    (s4, 'ka', '45 წამზე, დაასხით 300გ-მდე წყალი ცენტრში თანაბარი ნაკადით.'),
    (s5, 'ka', '1:45 წუთზე, დაასხით დარჩენილი წყალი 500გ-მდე და აცადეთ გაფილტვრა.');
END $$;
