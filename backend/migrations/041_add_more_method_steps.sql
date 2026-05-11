-- Seed steps for Aeropress, French Press, Moka Pot, and Kalita Wave
DO $$
DECLARE
    -- Aeropress
    a_id VARCHAR(50) := 'aeropress';
    as1 UUID; as2 UUID; as3 UUID; as4 UUID;
    -- French Press
    f_id VARCHAR(50) := 'french_press';
    fs1 UUID; fs2 UUID; fs3 UUID; fs4 UUID; fs5 UUID;
    -- Moka Pot
    m_id VARCHAR(50) := 'moka_pot';
    ms1 UUID; ms2 UUID; ms3 UUID; ms4 UUID;
    -- Kalita Wave
    k_id VARCHAR(50) := 'kalita_wave';
    ks1 UUID; ks2 UUID; ks3 UUID; ks4 UUID; ks5 UUID;
BEGIN
    ---------------------------------------------------------------------------
    -- AEROPRESS (Standard Method)
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (a_id, 1, 0, 0) RETURNING id INTO as1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (a_id, 2, 0, 15) RETURNING id INTO as2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (a_id, 3, 120, 250) RETURNING id INTO as3;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (a_id, 4, 30, 250) RETURNING id INTO as4;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (as1, 'en', 'Insert filter and rinse. Place AeroPress on mug.'), (as1, 'es-419', 'Inserta el filtro y enjuaga. Coloca la AeroPress sobre la taza.'),
    (as2, 'en', 'Add 15g of fine ground coffee.'), (as2, 'es-419', 'Agrega 15g de café molido fino.'),
    (as3, 'en', 'Add 250g of water. Stir gently and wait 2 minutes.'), (as3, 'es-419', 'Agrega 250g de agua. Agita suavemente y espera 2 minutos.'),
    (as4, 'en', 'Press down slowly (approx. 30 seconds). Stop at the hiss.'), (as4, 'es-419', 'Presiona lentamente (aprox. 30 segundos). Para al escuchar el silbido.');

    ---------------------------------------------------------------------------
    -- FRENCH PRESS (James Hoffmann Method)
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (f_id, 1, 0, 30) RETURNING id INTO fs1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (f_id, 2, 240, 500) RETURNING id INTO fs2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (f_id, 3, 0, 500) RETURNING id INTO fs3;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (f_id, 4, 300, 500) RETURNING id INTO fs4;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (f_id, 5, 0, 500) RETURNING id INTO fs5;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (fs1, 'en', 'Add 30g of medium-coarse coffee.'), (fs1, 'es-419', 'Agrega 30g de café molido medio-grueso.'),
    (fs2, 'en', 'Add 500g of water and wait 4 minutes.'), (fs2, 'es-419', 'Agrega 500g de agua y espera 4 minutos.'),
    (fs3, 'en', 'Stir the crust and remove foam/floating bits.'), (fs3, 'es-419', 'Rompe la costra agitando y quita la espuma.'),
    (fs4, 'en', 'Wait another 5-7 minutes for grounds to settle.'), (fs4, 'es-419', 'Espera otros 5-7 minutos para que el café decante.'),
    (fs5, 'en', 'Insert plunger and pour gently without pressing to the bottom.'), (fs5, 'es-419', 'Inserta el émbolo y vierte suavemente sin presionar hasta el fondo.');

    ---------------------------------------------------------------------------
    -- MOKA POT
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (m_id, 1, 0, 200) RETURNING id INTO ms1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (m_id, 2, 0, 200) RETURNING id INTO ms2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (m_id, 3, 300, 200) RETURNING id INTO ms3;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (m_id, 4, 0, 200) RETURNING id INTO ms4;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (ms1, 'en', 'Fill base with boiling water up to the valve.'), (ms1, 'es-419', 'Llena la base con agua hirviendo hasta la válvula.'),
    (ms2, 'en', 'Fill basket with coffee, level it, but do not tamp.'), (ms2, 'es-419', 'Llena la canasta con café, nivela sin presionar.'),
    (ms3, 'en', 'Heat on medium. Watch for the steady flow of coffee.'), (ms3, 'es-419', 'Calienta a fuego medio. Observa el flujo constante de café.'),
    (ms4, 'en', 'When it gurgles or turns pale, remove from heat and cool base.'), (ms4, 'es-419', 'Cuando gorgotee o aclare, retira del fuego y enfría la base.');

    ---------------------------------------------------------------------------
    -- KALITA WAVE
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (k_id, 1, 0, 0) RETURNING id INTO ks1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (k_id, 2, 30, 45) RETURNING id INTO ks2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (k_id, 3, 60, 150) RETURNING id INTO ks3;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (k_id, 4, 60, 250) RETURNING id INTO ks4;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES 
    (ks1, 'en', 'Rinse filter and add 15g of medium coffee.'), (ks1, 'es-419', 'Enjuaga el filtro y agrega 15g de café medio.'),
    (ks2, 'en', 'Bloom with 45g of water for 30s.'), (ks2, 'es-419', 'Haz el bloom con 45g de agua por 30s.'),
    (ks3, 'en', 'Pour up to 150g in small circular motions.'), (ks3, 'es-419', 'Vierte hasta 150g en pequeños círculos.'),
    (ks4, 'en', 'Pour remaining water up to 250g and let drain.'), (ks4, 'es-419', 'Vierte el resto hasta 250g y deja filtrar.');

END $$;
