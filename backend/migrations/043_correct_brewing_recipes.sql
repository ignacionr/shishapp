-- Correct brewing recipes based on industry standards (Hoffmann, Rao, Kasuya)
DO $$
DECLARE
    v60_id VARCHAR(50) := 'v60';
    aeropress_id VARCHAR(50) := 'aeropress';
    clever_id VARCHAR(50) := 'clever_dripper';
    turkish_id VARCHAR(50) := 'turkish';
    kalita_id VARCHAR(50) := 'kalita_wave';
    
    s_id UUID;
BEGIN
    ---------------------------------------------------------------------------
    -- V60: Update bloom time to 45s and add swirling instructions
    ---------------------------------------------------------------------------
    -- Update Step 3 (Bloom)
    UPDATE brewing_steps SET duration = 45 WHERE method_id = v60_id AND order_index = 3 RETURNING id INTO s_id;
    UPDATE brewing_step_translations SET instruction = 'Start timer and bloom with 30g of water. Swirl gently to saturate all grounds.' WHERE step_id = s_id AND language_code = 'en';
    UPDATE brewing_step_translations SET instruction = 'Inicia el cronómetro y haz el bloom con 30g de agua. Agita suavemente para saturar toda la molienda.' WHERE step_id = s_id AND language_code = 'es-419';
    UPDATE brewing_step_translations SET instruction = 'Inicie o cronômetro e faça o bloom com 30g de água. Agite suavemente para saturar todo o pó.' WHERE step_id = s_id AND language_code = 'pt-BR';
    UPDATE brewing_step_translations SET instruction = 'Запустите таймер и сделайте блум (предсмачивание), используя 30 г воды. Аккуратно взболтайте, чтобы смочить весь кофе.' WHERE step_id = s_id AND language_code = 'ru';
    UPDATE brewing_step_translations SET instruction = 'ჩართეთ ტაიმერი და დაასხით 30გ წყალი (ბლუმი). ნაზად შეანჯღრიეთ, რომ ყავა თანაბრად დასველდეს.' WHERE step_id = s_id AND language_code = 'ka';

    -- Update Step 4 (1st Pour)
    UPDATE brewing_steps SET duration = 30 WHERE method_id = v60_id AND order_index = 4 RETURNING id INTO s_id;
    UPDATE brewing_step_translations SET instruction = 'At 45s, pour up to 150g in circular motions.' WHERE step_id = s_id AND language_code = 'en';
    UPDATE brewing_step_translations SET instruction = 'A los 45s, vierte hasta 150g en movimientos circulares.' WHERE step_id = s_id AND language_code = 'es-419';
    UPDATE brewing_step_translations SET instruction = 'Aos 45s, despeje até 150g em movimentos circulares.' WHERE step_id = s_id AND language_code = 'pt-BR';
    UPDATE brewing_step_translations SET instruction = 'На 45-й секунде влейте воду до 150 г круговыми движениями.' WHERE step_id = s_id AND language_code = 'ru';
    UPDATE brewing_step_translations SET instruction = '45 წამზე, დაასხით 150გ-მდე წყალი წრიული მოძრაობით.' WHERE step_id = s_id AND language_code = 'ka';

    -- Update Step 5 (2nd Pour)
    UPDATE brewing_steps SET duration = 60 WHERE method_id = v60_id AND order_index = 5 RETURNING id INTO s_id;
    UPDATE brewing_step_translations SET instruction = 'At 1:15, pour remaining water up to 250g. Give it a final gentle swirl.' WHERE step_id = s_id AND language_code = 'en';
    UPDATE brewing_step_translations SET instruction = 'Al 1:15, vierte el resto del agua hasta 250g. Dale una última agitación suave.' WHERE step_id = s_id AND language_code = 'es-419';
    UPDATE brewing_step_translations SET instruction = 'A 1:15, despeje o restante da água até 250g. Dê uma última agitação suave.' WHERE step_id = s_id AND language_code = 'pt-BR';
    UPDATE brewing_step_translations SET instruction = 'В 1:15 влейте оставшуюся воду до 250 г. В конце еще раз аккуратно взболтайте.' WHERE step_id = s_id AND language_code = 'ru';
    UPDATE brewing_step_translations SET instruction = '1:15 წუთზე, დაასხით დარჩენილი წყალი 250გ-მდე. ბოლოს კიდევ ერთხელ ნაზად შეანჯღრიეთ.' WHERE step_id = s_id AND language_code = 'ka';

    ---------------------------------------------------------------------------
    -- AEROPRESS: Re-insert with Hoffmann Ultimate technique
    ---------------------------------------------------------------------------
    DELETE FROM brewing_steps WHERE method_id = aeropress_id;
    
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (aeropress_id, 1, 0, 0) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Insert filter and rinse. Place AeroPress on mug.'), (s_id, 'es-419', 'Inserta el filtro y enjuaga. Coloca la AeroPress sobre la taza.'),
    (s_id, 'pt-BR', 'Insira o filtro e enxágue. Coloque a AeroPress sobre a xícara.'), (s_id, 'ru', 'Вставьте фильтр и промойте его. Поставьте AeroPress на кружку.'),
    (s_id, 'ka', 'ჩადეთ ფილტრი და გარეცხეთ. დადგით AeroPress ჭიქაზე.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (aeropress_id, 2, 0, 15) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Add 15g of fine ground coffee.'), (s_id, 'es-419', 'Agrega 15g de café molido fino.'),
    (s_id, 'pt-BR', 'Adicione 15g de café moído fino.'), (s_id, 'ru', 'Насыпьте 15 г кофе мелкого помола.'),
    (s_id, 'ka', 'დაამატეთ 15გ წვრილად დაფქული ყავა.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (aeropress_id, 3, 120, 250) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Add 250g of water. Insert plunger immediately to create a vacuum seal and wait 2 minutes.'),
    (s_id, 'es-419', 'Agrega 250g de agua. Inserta el émbolo inmediatamente para crear un sellado al vacío y espera 2 minutos.'),
    (s_id, 'pt-BR', 'Adicione 250g de água. Insira o êmbolo imediatamente para criar uma vedação a vácuo e aguarde 2 minutos.'),
    (s_id, 'ru', 'Добавьте 250 г воды. Сразу вставьте поршень, чтобы создать герметичность, и подождите 2 минуты.'),
    (s_id, 'ka', 'დაამატეთ 250გ წყალი. მაშინვე ჩადგით პრესი (პლანჟერი) ვაკუუმის შესაქმნელად და დაიცადეთ 2 წუთი.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (aeropress_id, 4, 30, 250) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Gently swirl the AeroPress and wait 30 seconds for grounds to settle.'),
    (s_id, 'es-419', 'Agita suavemente la AeroPress y espera 30 segundos para que el café decante.'),
    (s_id, 'pt-BR', 'Agite suavemente a AeroPress e aguarde 30 segundos para o pó assentar.'),
    (s_id, 'ru', 'Аккуратно взболтайте AeroPress и подождите 30 секунд, чтобы кофе осел.'),
    (s_id, 'ka', 'ნაზად შეანჯღრიეთ AeroPress და დაიცადეთ 30 წამი, სანამ ყავა დაილექება.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (aeropress_id, 5, 30, 250) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Press down slowly (approx. 30 seconds). Stop at the hiss.'),
    (s_id, 'es-419', 'Presiona lentamente (aprox. 30 segundos). Para al escuchar el silbido.'),
    (s_id, 'pt-BR', 'Pressione lentamente (aprox. 30 segundos). Pare ao ouvir o chiado.'),
    (s_id, 'ru', 'Медленно опускайте поршень (около 30 секунд). Остановитесь при появлении шипения.'),
    (s_id, 'ka', 'ნელა დააწექით პრესს (დაახლოებით 30 წამი). გაჩერდით სისინის ხმაზე.');

    ---------------------------------------------------------------------------
    -- CLEVER DRIPPER: Re-insert with Hoffmann Water-First technique
    ---------------------------------------------------------------------------
    DELETE FROM brewing_steps WHERE method_id = clever_id;

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (clever_id, 1, 0, 0) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Rinse filter with hot water and discard rinse water.'),
    (s_id, 'es-419', 'Enjuaga el filtro con agua caliente y desecha el agua.'),
    (s_id, 'pt-BR', 'Enxágue o filtro com água quente e descarte a água.'),
    (s_id, 'ru', 'Промойте фильтр горячей водой и вылейте воду.'),
    (s_id, 'ka', 'გარეცხეთ ფილტრი ცხელი წყლით და გადაასხით წყალი.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (clever_id, 2, 0, 250) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Add 250g of freshly boiled water to the dripper first.'),
    (s_id, 'es-419', 'Primero agrega 250g de agua recién hervida al portafiltro.'),
    (s_id, 'pt-BR', 'Adicione 250g de água recém-fervida ao coador primeiro.'),
    (s_id, 'ru', 'Сначала налейте в дриппер 250 г свежекипяченой воды.'),
    (s_id, 'ka', 'ჯერ ჩაასხით მადუღარაში 250გ ახლად ადუღებული წყალი.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (clever_id, 3, 120, 250) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Add 15g of coffee on top. Stir gently to saturate and wait 2 minutes.'),
    (s_id, 'es-419', 'Agrega 15g de café encima. Revuelve suavemente para saturar y espera 2 minutos.'),
    (s_id, 'pt-BR', 'Adicione 15g de café por cima. Mexe suavemente para saturar e aguarde 2 minutos.'),
    (s_id, 'ru', 'Насыпьте сверху 15 г кофе. Аккуратно перемешайте для смачивания и подождите 2 минуты.'),
    (s_id, 'ka', 'ზემოდან დაამატეთ 15გ ყავა. ნაზად მოურიეთ დასასველებლად და დაიცადეთ 2 წუთი.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (clever_id, 4, 30, 250) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Give it a gentle swirl and wait 30 seconds for the coffee bed to settle.'),
    (s_id, 'es-419', 'Dale una agitación suave y espera 30 segundos para que la cama de café se asiente.'),
    (s_id, 'pt-BR', 'Dê uma agitação suave e aguarde 30 segundos para a cama de café assentar.'),
    (s_id, 'ru', 'Аккуратно взболтайте и подождите 30 секунд, чтобы кофейный слой осел.'),
    (s_id, 'ka', 'ნაზად შეანჯღრიეთ და დაიცადეთ 30 წამი, სანამ ყავის ფენა დაილექება.');

    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (clever_id, 5, 60, 250) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Place on mug to drain.'),
    (s_id, 'es-419', 'Coloca sobre la taza para filtrar.'),
    (s_id, 'pt-BR', 'Coloque sobre a xícara para filtrar.'),
    (s_id, 'ru', 'Поставьте на чашку, чтобы кофе стекал.'),
    (s_id, 'ka', 'დადგით ჭიქაზე გასაფილტრად.');

    ---------------------------------------------------------------------------
    -- TURKISH: Update heat step and add settle step
    ---------------------------------------------------------------------------
    -- Update Step 3 (Heat)
    UPDATE brewing_steps SET duration = 150 WHERE method_id = turkish_id AND order_index = 3 RETURNING id INTO s_id;
    UPDATE brewing_step_translations SET instruction = 'Heat on medium-low. Do not stir again. Watch for the foam to rise.' WHERE step_id = s_id AND language_code = 'en';
    UPDATE brewing_step_translations SET instruction = 'Calienta a fuego medio-bajo. No vuelvas a revolver. Observa cómo sube la espuma.' WHERE step_id = s_id AND language_code = 'es-419';
    UPDATE brewing_step_translations SET instruction = 'Aqueça em fogo médio-baixo. Não mexa novamente. Observe a espuma subir.' WHERE step_id = s_id AND language_code = 'pt-BR';
    UPDATE brewing_step_translations SET instruction = 'Нагревайте на среднем или медленном огне. Больше не перемешивайте. Следите, как поднимается пенка.' WHERE step_id = s_id AND language_code = 'ru';
    UPDATE brewing_step_translations SET instruction = 'გააცხელეთ საშუალო-დაბალ ცეცხლზე. მეტჯერ აღარ მოურიოთ. დაელოდეთ ქაფის ამოსვლას.' WHERE step_id = s_id AND language_code = 'ka';

    -- Add Step 4 (Settle)
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (turkish_id, 4, 150, 100) RETURNING id INTO s_id;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (s_id, 'en', 'Stop and pour BEFORE it boils. Wait 2-3 minutes for grounds to settle before drinking.'),
    (s_id, 'es-419', 'Detén y vierte ANTES de que hierva. Espera 2-3 minutos para que el café decante antes de beber.'),
    (s_id, 'pt-BR', 'Pare e despeje ANTES de ferver. Aguarde 2-3 minutos para o pó assentar antes de beber.'),
    (s_id, 'ru', 'Снимите с огня и перелейте кофе ДО того, как он закипит. Подождите 2-3 минуты, пока гуща осядет, прежде чем пить.'),
    (s_id, 'ka', 'გადმოდგით და დაასხით ადუღებამდე. დალევამდე დაიცადეთ 2-3 წუთი ყავის დასალექად.');

    ---------------------------------------------------------------------------
    -- KALITA WAVE: Update bloom time
    ---------------------------------------------------------------------------
    -- Update Step 2 (Bloom)
    UPDATE brewing_steps SET duration = 45 WHERE method_id = kalita_id AND order_index = 2 RETURNING id INTO s_id;
    UPDATE brewing_step_translations SET instruction = 'Bloom with 45g of water for 45s.' WHERE step_id = s_id AND language_code = 'en';
    UPDATE brewing_step_translations SET instruction = 'Haz el bloom con 45g de agua por 45s.' WHERE step_id = s_id AND language_code = 'es-419';
    UPDATE brewing_step_translations SET instruction = 'Faça o bloom com 45g de água por 45s.' WHERE step_id = s_id AND language_code = 'pt-BR';
    UPDATE brewing_step_translations SET instruction = 'Сделайте блум 45 г воды в течение 45 секунд.' WHERE step_id = s_id AND language_code = 'ru';
    UPDATE brewing_step_translations SET instruction = 'დაასხით 45გ წყალი (ბლუმი) 45 წამის განმავლობაში.' WHERE step_id = s_id AND language_code = 'ka';

    -- Update Step 3 (1st Pour)
    UPDATE brewing_steps SET duration = 45 WHERE method_id = kalita_id AND order_index = 3 RETURNING id INTO s_id;
    UPDATE brewing_step_translations SET instruction = 'At 45s, pour up to 150g in small circular motions.' WHERE step_id = s_id AND language_code = 'en';
    UPDATE brewing_step_translations SET instruction = 'A los 45s, vierte hasta 150g en pequeños movimientos circulares.' WHERE step_id = s_id AND language_code = 'es-419';
    UPDATE brewing_step_translations SET instruction = 'Aos 45s, despeje até 150g em pequenos movimentos circulares.' WHERE step_id = s_id AND language_code = 'pt-BR';
    UPDATE brewing_step_translations SET instruction = 'На 45-й секунде влейте воду до 150 г небольшими круговыми движениями.' WHERE step_id = s_id AND language_code = 'ru';
    UPDATE brewing_step_translations SET instruction = '45 წამზე, დაასხით 150გ-მდე წყალი მცირე წრიული მოძრაობებით.' WHERE step_id = s_id AND language_code = 'ka';

    -- Update Step 4 (2nd Pour)
    UPDATE brewing_steps SET duration = 60 WHERE method_id = kalita_id AND order_index = 4 RETURNING id INTO s_id;
    UPDATE brewing_step_translations SET instruction = 'At 1:30, pour remaining water up to 250g and let drain.' WHERE step_id = s_id AND language_code = 'en';
    UPDATE brewing_step_translations SET instruction = 'Al 1:30, vierte el resto del agua hasta 250g y deja filtrar.' WHERE step_id = s_id AND language_code = 'es-419';
    UPDATE brewing_step_translations SET instruction = 'A 1:30, despeje o restante da água até 250g e deixe filtrar.' WHERE step_id = s_id AND language_code = 'pt-BR';
    UPDATE brewing_step_translations SET instruction = 'В 1:30 влейте оставшуюся воду до 250 г и дайте ей стечь.' WHERE step_id = s_id AND language_code = 'ru';
    UPDATE brewing_step_translations SET instruction = '1:30 წუთზე, დაასხით დარჩენილი წყალი 250გ-მდე და აცადეთ გაფილტვრა.' WHERE step_id = s_id AND language_code = 'ka';

END $$;
