-- Migration 022: Add edit_token to events table for "My Events" feature
-- Purpose: Allow event creators to edit their events via shareable token URLs
-- Pattern: Follows grocery_events.share_token pattern
-- Date: 2025-01-15

BEGIN;

-- 1. Add edit_token column (8-char like grocery)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS edit_token VARCHAR(12) UNIQUE;

-- 2. Add creator_phone for phone-based lookup
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS creator_phone VARCHAR(20);

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_events_edit_token ON public.events(edit_token);
CREATE INDEX IF NOT EXISTS idx_events_creator_phone ON public.events(creator_phone)
  WHERE creator_phone IS NOT NULL;

-- 4. Token generation function (matches grocery pattern)
-- Uses URL-safe chars, excludes confusing ones (0, O, I, l, 1)
CREATE OR REPLACE FUNCTION generate_event_edit_token()
RETURNS VARCHAR(12) AS $$
DECLARE
  chars VARCHAR := 'abcdefghjkmnpqrstuvwxyz23456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Auto-generate trigger for new events
CREATE OR REPLACE FUNCTION auto_generate_event_edit_token()
RETURNS TRIGGER AS $$
DECLARE
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  IF NEW.edit_token IS NULL OR NEW.edit_token = '' THEN
    LOOP
      attempt := attempt + 1;
      NEW.edit_token := generate_event_edit_token();

      -- Check for uniqueness
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.events WHERE edit_token = NEW.edit_token AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid));

      IF attempt >= max_attempts THEN
        RAISE EXCEPTION 'Could not generate unique edit_token after % attempts', max_attempts;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_auto_generate_event_edit_token ON public.events;
CREATE TRIGGER trigger_auto_generate_event_edit_token
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_event_edit_token();

-- 6. Backfill existing events with edit_tokens
DO $$
DECLARE
  event_record RECORD;
  new_token VARCHAR(8);
  max_attempts INTEGER := 10;
  attempt INTEGER;
BEGIN
  FOR event_record IN SELECT id FROM public.events WHERE edit_token IS NULL
  LOOP
    attempt := 0;
    LOOP
      attempt := attempt + 1;
      new_token := generate_event_edit_token();

      -- Check uniqueness
      IF NOT EXISTS (SELECT 1 FROM public.events WHERE edit_token = new_token) THEN
        UPDATE public.events SET edit_token = new_token WHERE id = event_record.id;
        EXIT;
      END IF;

      IF attempt >= max_attempts THEN
        RAISE EXCEPTION 'Could not generate unique edit_token for event %', event_record.id;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 7. Add comments for documentation
COMMENT ON COLUMN public.events.edit_token IS 'Shareable 8-char token for event editing via URL (like grocery share_token)';
COMMENT ON COLUMN public.events.creator_phone IS 'Phone number of event creator for phone-based lookup';

COMMIT;
