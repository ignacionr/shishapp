import psycopg2
import sys
import os

def check_translations():
    conn_str = os.environ.get("DATABASE_URL")
    if not conn_str:
        # Try to read from config.json if not in env
        import json
        try:
            with open("backend/config.json") as f:
                config = json.load(f)
                db_conf = config.get("database", {})
                conn_str = f"host={db_conf.get('host')} port={db_conf.get('port')} dbname={db_conf.get('dbname')} user={db_conf.get('user')} password={db_conf.get('password')}"
        except:
            print("Could not find database configuration")
            sys.exit(1)

    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        sys.exit(1)

    languages = ['en', 'es-419', 'pt-BR', 'ru', 'ka', 'it']
    missing = []

    # 1. Check Equipment
    for lang in languages:
        cur.execute("""
            SELECT name FROM equipment 
            WHERE id NOT IN (SELECT equipment_id FROM equipment_translations WHERE language_code = %s)
        """, (lang,))
        rows = cur.fetchall()
        for row in rows:
            missing.append(f"Equipment '{row[0]}' missing translation for '{lang}'")

    # 2. Check Brewing Methods
    for lang in languages:
        cur.execute("""
            SELECT id FROM brewing_methods 
            WHERE id NOT IN (SELECT method_id FROM brewing_method_translations WHERE language_code = %s)
        """, (lang,))
        rows = cur.fetchall()
        for row in rows:
            missing.append(f"Brewing Method '{row[0]}' missing translation for '{lang}'")

    # 3. Check Tag Categories
    for lang in languages:
        cur.execute("""
            SELECT name FROM tag_categories 
            WHERE id NOT IN (SELECT category_id FROM tag_category_translations WHERE language_code = %s)
        """, (lang,))
        rows = cur.fetchall()
        for row in rows:
            missing.append(f"Tag Category '{row[0]}' missing translation for '{lang}'")

    # 4. Check Tags
    for lang in languages:
        cur.execute("""
            SELECT name FROM tags 
            WHERE id NOT IN (SELECT tag_id FROM tag_translations WHERE language_code = %s)
        """, (lang,))
        rows = cur.fetchall()
        for row in rows:
            missing.append(f"Tag '{row[0]}' missing translation for '{lang}'")

    if missing:
        print("\n".join(missing))
        sys.exit(1)
    else:
        print("All translations are present.")
        sys.exit(0)

if __name__ == "__main__":
    check_translations()
