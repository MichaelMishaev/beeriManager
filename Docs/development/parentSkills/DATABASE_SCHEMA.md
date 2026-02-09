# Parent Skills Survey - Database Schema

## Overview

The Parent Skills Survey uses **Supabase (PostgreSQL)** with Row Level Security (RLS). The schema evolved through 5 migrations, adding multi-tenancy support, grade tracking, soft delete, and enum fixes.

---

## Tables

### `parent_skill_responses` (Primary Table)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | Primary key |
| `school_id` | `UUID` | NOT NULL | `'c6268dee-...'` | FK to `schools.id`. Multi-tenancy key |
| `parent_name` | `TEXT` | YES | NULL | Parent's name (optional for anonymous) |
| `phone_number` | `TEXT` | NOT NULL | - | Israeli phone number (required contact method) |
| `email` | `TEXT` | YES | NULL | Optional email address |
| `skills` | `skill_category[]` | NOT NULL | `'{}'` | Array of selected skill categories (1-10) |
| `student_grade` | `TEXT` | YES | NULL | Grade of parent's child (e.g., "aleph", "bet") |
| `preferred_contact` | `contact_preference` | NOT NULL | `'any'` | Preferred contact method |
| `additional_notes` | `TEXT` | YES | NULL | Free-text notes or availability info |
| `other_specialty` | `TEXT` | YES | NULL | Details when "other" skill is selected |
| `submitted_locale` | `VARCHAR(5)` | YES | `'he'` | Language locale at submission time |
| `ip_address` | `INET` | YES | NULL | For duplicate detection |
| `user_agent` | `TEXT` | YES | NULL | Browser user agent for analytics |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | Submission timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | Auto-updated on changes |
| `deleted_at` | `TIMESTAMPTZ` | YES | NULL | Soft delete timestamp (NULL = active) |

**Constraints:**
- `valid_phone`: `phone_number IS NOT NULL AND length(trim(phone_number)) > 0`
- `valid_skills`: `array_length(skills, 1) >= 1 AND array_length(skills, 1) <= 10`
- FK: `school_id REFERENCES schools(id) ON DELETE CASCADE`

### `schools` (Multi-Tenancy Support)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `UUID` | NOT NULL | `gen_random_uuid()` | Primary key |
| `name` | `TEXT` | NOT NULL | - | School display name |
| `slug` | `TEXT` | NOT NULL | - | URL-friendly identifier (UNIQUE) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | Last update timestamp |

**Default school seed data:**
```sql
INSERT INTO schools (id, name, slug)
VALUES ('c6268dee-1fcd-42bd-8da2-1d4ac34a03db', 'school name', 'beeri');
```

---

## PostgreSQL Enums

### `skill_category` (28 values)

```sql
CREATE TYPE skill_category AS ENUM (
  -- Original 21 values (migration 1):
  'photography', 'legal', 'medical', 'handyman', 'graphic_design',
  'it_technology', 'arts', 'cooking_catering', 'sewing_fashion',
  'translation', 'accounting', 'teaching_tutoring', 'driving_transport',
  'event_planning', 'music', 'video_editing', 'social_media',
  'writing_editing', 'gardening', 'cleaning', 'other',

  -- Added in migration 5 (enum fix):
  'language_tutoring', 'science_stem', 'library_support',
  'sports_coaching', 'childcare', 'fundraising', 'office_admin'
);
```

> **Note:** `cleaning` exists in the DB enum but is NOT in the TypeScript `SKILL_CATEGORIES` constant. It was kept for backwards compatibility with any existing responses that used it.

### `contact_preference` (4 values)

```sql
CREATE TYPE contact_preference AS ENUM (
  'phone',    -- Regular phone call
  'email',    -- Email
  'whatsapp', -- WhatsApp message
  'any'       -- No preference
);
```

---

## Indexes (8 Total)

| Index Name | Type | Column(s) | Condition | Purpose |
|-----------|------|-----------|-----------|---------|
| `idx_parent_skills_skills` | GIN | `skills` | - | Fast skill array containment queries |
| `idx_parent_skills_created_at` | B-tree | `created_at DESC` | - | Sort by submission date |
| `idx_parent_skills_phone` | B-tree | `phone_number` | `WHERE phone_number IS NOT NULL` | Phone lookup |
| `idx_parent_skills_email` | B-tree | `email` | `WHERE email IS NOT NULL` | Email lookup |
| `idx_parent_skills_search` | GIN | `to_tsvector('simple', ...)` | - | Full-text search on name + notes |
| `idx_parent_skills_school_id` | B-tree | `school_id` | - | Multi-tenant filtering |
| `idx_parent_skill_responses_grade` | B-tree | `student_grade` | - | Grade filtering |
| `idx_parent_skills_deleted_at` | B-tree | `deleted_at` | `WHERE deleted_at IS NULL` | Partial index for non-deleted rows |

---

## Row Level Security (RLS) Policies

RLS is enabled on `parent_skill_responses`.

| Policy Name | Operation | Role | Rule | Description |
|-------------|-----------|------|------|-------------|
| `"Anyone can submit skill survey"` | INSERT | `public` | `WITH CHECK (true)` | Anyone can submit without auth |
| `"Admins can view skill responses for their school"` | SELECT | `authenticated` | `USING (true)` | Authenticated users see all (future: filter by school) |
| `"Only admins can view non-deleted skill responses"` | SELECT | `authenticated` | `USING (deleted_at IS NULL)` | Hides soft-deleted rows |
| `"Only admins can soft delete skill responses"` | UPDATE | `authenticated` | `USING (true) WITH CHECK (true)` | Allows setting `deleted_at` |

> **Note:** The SELECT policies from migrations 2 and 4 may overlap. In production, the most restrictive policy applies (soft-delete filtering takes effect).

---

## Auto-Updated Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_parent_skill_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_skill_responses_updated_at
  BEFORE UPDATE ON parent_skill_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_skill_responses_updated_at();
```

---

## Migration History

| # | File | Date | Description |
|---|------|------|-------------|
| 1 | `20251230104848_create_parent_skills_survey.sql` | 2025-12-30 | Initial schema: table, enums (21 skills), 5 indexes, RLS, trigger |
| 2 | `20251230130000_add_school_id_to_skills.sql` | 2025-12-30 | Multi-tenancy: `schools` table, `school_id` column, FK, school-aware RLS |
| 3 | `20251230150000_add_grade_to_parent_skills.sql` | 2025-12-30 | Added `student_grade` column and index |
| 4 | `20251230160000_add_soft_delete_to_parent_skills.sql` | 2025-12-30 | Added `deleted_at` column, partial index, soft-delete RLS policy |
| 5 | `20251231000000_fix_skill_category_enum.sql` | 2025-12-31 | Added 7 missing enum values + `other_specialty` column |

---

## Consolidated Schema (Single Migration for Standalone)

If building from scratch, this single SQL file creates the complete schema:

```sql
-- ============================================================
-- Parent Skills Survey - Consolidated Schema
-- Combines all 5 migrations into one idempotent script
-- ============================================================

-- 1. Enums
CREATE TYPE skill_category AS ENUM (
  'photography', 'legal', 'medical', 'handyman', 'graphic_design',
  'it_technology', 'arts', 'cooking_catering', 'sewing_fashion',
  'translation', 'accounting', 'teaching_tutoring', 'driving_transport',
  'event_planning', 'music', 'video_editing', 'social_media',
  'writing_editing', 'gardening', 'cleaning', 'other',
  'language_tutoring', 'science_stem', 'library_support',
  'sports_coaching', 'childcare', 'fundraising', 'office_admin'
);

CREATE TYPE contact_preference AS ENUM (
  'phone', 'email', 'whatsapp', 'any'
);

-- 2. Schools table (multi-tenancy)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Seed default school
INSERT INTO schools (id, name, slug)
VALUES ('c6268dee-1fcd-42bd-8da2-1d4ac34a03db', 'Default School', 'default')
ON CONFLICT (id) DO NOTHING;

-- 4. Main responses table
CREATE TABLE parent_skill_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL DEFAULT 'c6268dee-1fcd-42bd-8da2-1d4ac34a03db'
    REFERENCES schools(id) ON DELETE CASCADE,
  parent_name TEXT,
  phone_number TEXT NOT NULL,
  email TEXT,
  skills skill_category[] NOT NULL DEFAULT '{}',
  student_grade TEXT,
  preferred_contact contact_preference NOT NULL DEFAULT 'any',
  additional_notes TEXT,
  other_specialty TEXT,
  submitted_locale VARCHAR(5) DEFAULT 'he',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT valid_phone CHECK (
    phone_number IS NOT NULL AND length(trim(phone_number)) > 0
  ),
  CONSTRAINT valid_skills CHECK (
    array_length(skills, 1) >= 1 AND array_length(skills, 1) <= 10
  )
);

-- 5. Indexes
CREATE INDEX idx_parent_skills_skills ON parent_skill_responses USING GIN (skills);
CREATE INDEX idx_parent_skills_created_at ON parent_skill_responses (created_at DESC);
CREATE INDEX idx_parent_skills_phone ON parent_skill_responses (phone_number)
  WHERE phone_number IS NOT NULL;
CREATE INDEX idx_parent_skills_email ON parent_skill_responses (email)
  WHERE email IS NOT NULL;
CREATE INDEX idx_parent_skills_search ON parent_skill_responses USING GIN (
  to_tsvector('simple', COALESCE(parent_name, '') || ' ' || COALESCE(additional_notes, ''))
);
CREATE INDEX idx_parent_skills_school_id ON parent_skill_responses (school_id);
CREATE INDEX idx_parent_skill_responses_grade ON parent_skill_responses (student_grade);
CREATE INDEX idx_parent_skills_deleted_at ON parent_skill_responses (deleted_at)
  WHERE deleted_at IS NULL;

-- 6. Auto-update trigger
CREATE OR REPLACE FUNCTION update_parent_skill_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_skill_responses_updated_at
  BEFORE UPDATE ON parent_skill_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_skill_responses_updated_at();

-- 7. RLS Policies
ALTER TABLE parent_skill_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit skill survey"
  ON parent_skill_responses FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view non-deleted responses"
  ON parent_skill_responses FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Admins can soft delete responses"
  ON parent_skill_responses FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- 8. Comments
COMMENT ON TABLE parent_skill_responses IS 'Parent volunteer skill survey responses';
COMMENT ON TABLE schools IS 'Schools/organizations for multi-tenancy';
COMMENT ON COLUMN parent_skill_responses.school_id IS 'Tenant ID for multi-school support';
COMMENT ON COLUMN parent_skill_responses.deleted_at IS 'Soft delete - NULL means active';
COMMENT ON COLUMN parent_skill_responses.other_specialty IS 'Details when "other" skill is selected';
COMMENT ON COLUMN parent_skill_responses.student_grade IS 'Grade of parent child at submission time';
```

---

## Source Files

- `supabase/migrations/20251230104848_create_parent_skills_survey.sql`
- `supabase/migrations/20251230130000_add_school_id_to_skills.sql`
- `supabase/migrations/20251230150000_add_grade_to_parent_skills.sql`
- `supabase/migrations/20251230160000_add_soft_delete_to_parent_skills.sql`
- `supabase/migrations/20251231000000_fix_skill_category_enum.sql`
