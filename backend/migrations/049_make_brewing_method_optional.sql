-- Make brewing_method optional in journal_entries
ALTER TABLE journal_entries ALTER COLUMN brewing_method DROP NOT NULL;
