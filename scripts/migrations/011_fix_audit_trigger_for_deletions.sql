-- Fix audit trigger to allow deletions without user context
-- This migration allows the audit_log to accept NULL user_name values for system deletions

-- First, modify the audit_log table to allow NULL user_name
ALTER TABLE audit_log ALTER COLUMN user_name DROP NOT NULL;

-- Update the audit trigger function to use 'system' as default user_name
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (
            table_name,
            record_id,
            action,
            user_name,
            user_role,
            old_values,
            new_values
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            COALESCE(current_setting('app.user_name', true), 'system'),
            COALESCE(current_setting('app.user_role', true), 'admin'),
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            table_name,
            record_id,
            action,
            user_name,
            user_role,
            old_values,
            new_values
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            COALESCE(current_setting('app.user_name', true), 'system'),
            COALESCE(current_setting('app.user_role', true), 'admin'),
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (
            table_name,
            record_id,
            action,
            user_name,
            user_role,
            old_values,
            new_values
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            COALESCE(current_setting('app.user_name', true), 'system'),
            COALESCE(current_setting('app.user_role', true), 'admin'),
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Comment for documentation
COMMENT ON FUNCTION audit_trigger_func() IS 'Audit trigger function that logs all INSERT, UPDATE, DELETE operations. Uses COALESCE to provide default values when user context is not set.';
