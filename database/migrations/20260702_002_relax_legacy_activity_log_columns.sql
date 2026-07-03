-- Make legacy activity_log columns compatible with the current insert contract.
-- This keeps existing data and only relaxes constraints on a live table that still
-- carries the old schema alongside the new columns.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'activity_log'
          AND column_name = 'action_type'
    ) THEN
        ALTER TABLE activity_log ALTER COLUMN action_type DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'activity_log'
          AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE activity_log ALTER COLUMN entity_type DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'activity_log'
          AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE activity_log ALTER COLUMN entity_id DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'activity_log'
          AND column_name = 'details'
    ) THEN
        ALTER TABLE activity_log ALTER COLUMN details DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'activity_log'
          AND column_name = 'created_at'
    ) THEN
        ALTER TABLE activity_log
            ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
    END IF;
END
$$;
