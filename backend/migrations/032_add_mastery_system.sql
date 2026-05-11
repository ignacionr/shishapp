-- Mastery System: Data Foundation
CREATE TABLE IF NOT EXISTS user_mastery (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_score DOUBLE PRECISION DEFAULT 0,
    current_level INT DEFAULT 1,
    precision_multiplier DOUBLE PRECISION DEFAULT 1.0, -- Future-proofing for streaks
    journal_count INT DEFAULT 0,
    method_count INT DEFAULT 0,
    venue_count INT DEFAULT 0,
    precision_count INT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to calculate mastery score and level
CREATE OR REPLACE FUNCTION calculate_user_mastery_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_journal_count INT;
    v_method_count INT;
    v_venue_count INT;
    v_precision_count INT;
    v_total_score DOUBLE PRECISION;
    v_level INT;
BEGIN
    -- Determine user_id based on the table triggered
    IF TG_TABLE_NAME = 'journal_entries' THEN
        v_user_id := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'venues' THEN
        -- Venues table changes don't affect specific users directly, 
        -- but check-ins (once implemented as a join table) would.
        -- For now, we only trigger on journal entries which contain the venue name.
        RETURN NEW;
    END IF;

    -- Calculate stats
    SELECT count(*), count(DISTINCT brewing_method), count(DISTINCT venue) FILTER (WHERE venue IS NOT NULL AND venue != '')
    INTO v_journal_count, v_method_count, v_venue_count
    FROM journal_entries
    WHERE user_id = v_user_id;

    -- Precision count: entries with high detail (e.g., tags containing specific parameters or high rating)
    -- In the future, this will be based on explicit fields. For now, we'll use a heuristic.
    SELECT count(*)
    INTO v_precision_count
    FROM journal_entries
    WHERE user_id = v_user_id AND (length(tags) > 10 OR rating >= 4.0);

    -- Mastery Algorithm: 
    -- Volume (30%): journal_count * 2 points
    -- Breadth (20%): method_count * 10 points
    -- Precision (40%): precision_count * 5 points
    -- Exploration (10%): venue_count * 15 points
    v_total_score := (v_journal_count * 2) + (v_method_count * 10) + (v_precision_count * 5) + (v_venue_count * 15);

    -- Level Calculation (Simple log-style scaling)
    IF v_total_score < 50 THEN v_level := 1;
    ELSIF v_total_score < 200 THEN v_level := 2;
    ELSIF v_total_score < 1000 THEN v_level := 3;
    ELSIF v_total_score < 5000 THEN v_level := 4;
    ELSE v_level := 5;
    END IF;

    -- Update or Insert Mastery Record
    INSERT INTO user_mastery (user_id, total_score, current_level, journal_count, method_count, venue_count, precision_count, last_updated)
    VALUES (v_user_id, v_total_score, v_level, v_journal_count, v_method_count, v_venue_count, v_precision_count, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        current_level = EXCLUDED.current_level,
        journal_count = EXCLUDED.journal_count,
        method_count = EXCLUDED.method_count,
        venue_count = EXCLUDED.venue_count,
        precision_count = EXCLUDED.precision_count,
        last_updated = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for journal entries
CREATE TRIGGER trigger_update_mastery_on_journal
AFTER INSERT OR UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION calculate_user_mastery_stats();

-- Seed existing users
INSERT INTO user_mastery (user_id)
SELECT id FROM users
ON CONFLICT DO NOTHING;
