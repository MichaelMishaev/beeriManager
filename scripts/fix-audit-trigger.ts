import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixAuditTrigger() {
  try {
    console.log('Fixing audit trigger to allow system deletions...')

    // Step 1: Alter audit_log table to allow NULL user_name
    console.log('Step 1: Altering audit_log table...')
    const { error: alterError } = await supabase.rpc('query', {
      query: 'ALTER TABLE audit_log ALTER COLUMN user_name DROP NOT NULL;'
    })

    if (alterError) {
      console.log('Could not alter via RPC, trying direct approach...')
      console.log('Please run this SQL in Supabase SQL Editor:')
      console.log(`
-- Fix audit trigger to allow deletions without user context
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
      `)
    } else {
      console.log('✅ Audit trigger fixed successfully')
    }
  } catch (error) {
    console.error('Error fixing audit trigger:', error)
  }
}

fixAuditTrigger()
