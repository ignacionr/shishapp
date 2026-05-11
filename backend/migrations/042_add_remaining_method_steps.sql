-- Seed steps for Clever, Turkish, Syphon, Cold Brew, Cloth, Espresso, and Capsules
-- Using ON CONFLICT to prevent duplicates
DO $$
DECLARE
    -- Clever Dripper
    cd_id VARCHAR(50) := 'clever_dripper';
    cds1 UUID; cds2 UUID; cds3 UUID;
    -- Turkish
    t_id VARCHAR(50) := 'turkish';
    ts1 UUID; ts2 UUID; ts3 UUID;
    -- Syphon
    s_id VARCHAR(50) := 'syphon';
    ss1 UUID; ss2 UUID; ss3 UUID;
    -- Cold Brew
    cb_id VARCHAR(50) := 'cold_brew';
    cbs1 UUID; cbs2 UUID; cbs3 UUID;
    -- Cloth Filter
    cf_id VARCHAR(50) := 'cloth_filter';
    cfs1 UUID; cfs2 UUID; cfs3 UUID;
    -- Espresso
    e_id VARCHAR(50) := 'espresso';
    es1 UUID; es2 UUID; es3 UUID;
    -- Capsules
    cap_id VARCHAR(50) := 'capsules';
    caps1 UUID; caps2 UUID;
BEGIN
    ---------------------------------------------------------------------------
    -- CLEVER DRIPPER
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cd_id, 1, 0, 0) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cds1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cd_id, 2, 120, 250) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cds2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cd_id, 3, 60, 250) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cds3;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cds1, 'en', 'Rinse filter and add 15g of coffee.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cds1, 'es-419', 'Enjuaga el filtro y agrega 15g de café.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cds2, 'en', 'Add 250g of water and let steep for 2 minutes.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cds2, 'es-419', 'Agrega 250g de agua y deja reposar 2 minutos.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cds3, 'en', 'Place on mug to drain.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cds3, 'es-419', 'Coloca sobre la taza para filtrar.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;

    ---------------------------------------------------------------------------
    -- TURKISH
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (t_id, 1, 0, 10) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO ts1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (t_id, 2, 0, 100) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO ts2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (t_id, 3, 180, 100) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO ts3;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ts1, 'en', 'Add 10g of extra-fine powder coffee to cezve.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ts1, 'es-419', 'Agrega 10g de café molido extra-fino al cezve.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ts2, 'en', 'Add 100g of room temp water.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ts2, 'es-419', 'Agrega 100g de agua a temperatura ambiente.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ts3, 'en', 'Heat until foam rises. Do not boil. Pour slowly.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ts3, 'es-419', 'Calienta hasta que suba la espuma. No hiervas. Vierte lento.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;

    ---------------------------------------------------------------------------
    -- SYPHON
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (s_id, 1, 0, 300) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO ss1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (s_id, 2, 60, 300) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO ss2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (s_id, 3, 30, 300) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO ss3;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ss1, 'en', 'Boil 300g water in lower chamber. Attach upper.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ss1, 'es-419', 'Hierve 300g de agua en la base. Acopla la parte superior.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ss2, 'en', 'Add 20g coffee as water rises. Stir and wait 60s.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ss2, 'es-419', 'Agrega 20g de café al subir el agua. Agita y espera 60s.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ss3, 'en', 'Remove heat. Let coffee filter back down.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (ss3, 'es-419', 'Retira el fuego. Deja que el café baje filtrado.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;

    ---------------------------------------------------------------------------
    -- COLD BREW
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cb_id, 1, 0, 100) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cbs1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cb_id, 2, 0, 1000) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cbs2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cb_id, 3, 43200, 1000) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cbs3;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cbs1, 'en', 'Add 100g of coarse coffee to jar.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cbs1, 'es-419', 'Agrega 100g de café grueso al frasco.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cbs2, 'en', 'Add 1000g of cold water.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cbs2, 'es-419', 'Agrega 1000g de agua fría.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cbs3, 'en', 'Steep for 12-24 hours in fridge. Filter before serving.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cbs3, 'es-419', 'Reposa 12-24 horas en frío. Filtra antes de servir.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;

    ---------------------------------------------------------------------------
    -- CLOTH FILTER
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cf_id, 1, 0, 20) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cfs1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cf_id, 2, 30, 40) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cfs2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cf_id, 3, 120, 250) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO cfs3;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cfs1, 'en', 'Rinse cloth with hot water. Add 20g coffee.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cfs1, 'es-419', 'Enjuaga la tela con agua caliente. Agrega 20g de café.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cfs2, 'en', 'Bloom with 40g water for 30s.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cfs2, 'es-419', 'Bloom con 40g de agua por 30s.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cfs3, 'en', 'Slow center pour up to 250g.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (cfs3, 'es-419', 'Vierte lento en el centro hasta 250g.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;

    ---------------------------------------------------------------------------
    -- ESPRESSO
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (e_id, 1, 0, 18) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO es1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (e_id, 2, 0, 18) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO es2;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (e_id, 3, 28, 36) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO es3;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (es1, 'en', 'Dose 18g of coffee into portafilter.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (es1, 'es-419', 'Carga 18g de café en el portafiltro.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (es2, 'en', 'Level and tamp firmly.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (es2, 'es-419', 'Nivela y apisona firmemente.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (es3, 'en', 'Pull shot for 25-30s until reaching 36g yield.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (es3, 'es-419', 'Extrae por 25-30s hasta obtener 36g de café.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;

    ---------------------------------------------------------------------------
    -- CAPSULES
    ---------------------------------------------------------------------------
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cap_id, 1, 0, 0) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO caps1;
    INSERT INTO brewing_steps (method_id, order_index, duration, target_water) VALUES (cap_id, 2, 25, 40) ON CONFLICT (method_id, order_index) DO UPDATE SET duration=EXCLUDED.duration, target_water=EXCLUDED.target_water RETURNING id INTO caps2;

    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (caps1, 'en', 'Insert capsule and ensure water tank is full.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (caps1, 'es-419', 'Inserta la cápsula y verifica el agua.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (caps2, 'en', 'Press brew button and enjoy.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;
    INSERT INTO brewing_step_translations (step_id, language_code, instruction) VALUES (caps2, 'es-419', 'Presiona el botón y disfruta.') ON CONFLICT (step_id, language_code) DO UPDATE SET instruction=EXCLUDED.instruction;

END $$;
