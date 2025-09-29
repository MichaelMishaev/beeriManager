# Database Strategy & Schema Design

## Overview
Complete database design for the Parent Committee Management System using Supabase (PostgreSQL).

## Core Design Principles

1. **Data Integrity First** - Strong foreign keys, constraints, and validations
2. **Hebrew-Optimized** - UTF-8 encoding, proper collation for Hebrew text
3. **Audit Everything** - Complete history tracking for accountability
4. **Performance by Design** - Strategic indexes, JSONB for flexibility
5. **Privacy Compliant** - GDPR-ready with consent tracking
6. **Real-time Ready** - Optimized for Supabase subscriptions
7. **Soft Deletes** - Never lose data, archive instead

---

## Complete Database Schema

### 1. EVENTS TABLE (BeeriCalendar Core)
```sql
CREATE TABLE events (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location VARCHAR(255),

  -- Recurring Events (RRULE Standard)
  recurrence_rule TEXT, -- RRULE format
  recurrence_parent_id UUID REFERENCES events(id) ON DELETE CASCADE,
  recurrence_exception_dates TIMESTAMPTZ[] DEFAULT ARRAY[]::TIMESTAMPTZ[],

  -- Registration & Attendance
  registration_form_config JSONB DEFAULT '{"fields": []}', -- Dynamic form builder
  registration_enabled BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMPTZ,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  qr_code_url TEXT,

  -- RSVP Tracking
  rsvp_yes_count INTEGER DEFAULT 0,
  rsvp_no_count INTEGER DEFAULT 0,
  rsvp_maybe_count INTEGER DEFAULT 0,

  -- Volunteer Management
  volunteer_slots JSONB DEFAULT '[]', -- [{id, role, description, max_volunteers, volunteers: []}]

  -- Event Metadata
  event_type VARCHAR(50) DEFAULT 'general', -- general, meeting, fundraiser, trip, workshop
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, ongoing, completed, cancelled
  visibility VARCHAR(20) DEFAULT 'public', -- public, committee_only, admin_only
  priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent

  -- Financial
  budget_allocated DECIMAL(10,2),
  budget_spent DECIMAL(10,2) DEFAULT 0,
  requires_payment BOOLEAN DEFAULT FALSE,
  payment_amount DECIMAL(10,2),
  payment_link TEXT,

  -- Relationships
  meeting_agenda_id UUID, -- Will reference meeting_agendas

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  version INTEGER DEFAULT 1,
  archived_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_datetime CHECK (end_datetime IS NULL OR end_datetime > start_datetime),
  CONSTRAINT valid_attendees CHECK (current_attendees <= max_attendees OR max_attendees IS NULL)
);

-- Indexes
CREATE INDEX idx_events_start ON events(start_datetime) WHERE archived_at IS NULL;
CREATE INDEX idx_events_status ON events(status) WHERE archived_at IS NULL;
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_recurring ON events(recurrence_parent_id);
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('simple', title || ' ' || COALESCE(description, '')));
```

### 2. EVENT_REGISTRATIONS TABLE
```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Registration Data
  registrant_name VARCHAR(100) NOT NULL,
  registrant_phone VARCHAR(20),
  registrant_email VARCHAR(255),
  form_data JSONB DEFAULT '{}', -- All form responses

  -- Check-in
  qr_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by VARCHAR(100),

  -- RSVP Status
  rsvp_status VARCHAR(10), -- yes, no, maybe

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(event_id, registrant_phone),
  UNIQUE(event_id, registrant_email)
);

CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_phone ON event_registrations(registrant_phone);
```

### 3. TASKS TABLE
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_name VARCHAR(100) NOT NULL,
  owner_phone VARCHAR(20),

  -- Dates
  due_date DATE NOT NULL,
  reminder_date DATE,
  completed_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled, overdue
  priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent

  -- Relationships
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

  -- Attachments
  attachment_urls TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Follow-up
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  auto_remind BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  completed_by VARCHAR(100),
  version INTEGER DEFAULT 1,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status != 'completed' AND archived_at IS NULL;
CREATE INDEX idx_tasks_owner ON tasks(owner_name);
CREATE INDEX idx_tasks_status ON tasks(status) WHERE archived_at IS NULL;
CREATE INDEX idx_tasks_event ON tasks(event_id);
```

### 4. RESPONSIBILITIES TABLE
```sql
CREATE TABLE responsibilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assignment
  person_name VARCHAR(100) NOT NULL,
  person_phone VARCHAR(20),
  role_title VARCHAR(100) NOT NULL,
  description TEXT,

  -- Duration
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Type
  responsibility_type VARCHAR(50), -- permanent, event_specific, rotating
  rotation_schedule TEXT, -- For rotating responsibilities

  -- Backup
  backup_person_name VARCHAR(100),
  backup_person_phone VARCHAR(20),

  -- Relationships
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_responsibilities_person ON responsibilities(person_name);
CREATE INDEX idx_responsibilities_active ON responsibilities(is_active);
CREATE INDEX idx_responsibilities_event ON responsibilities(event_id);
```

### 5. ISSUES TABLE
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Issue Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reporter_name VARCHAR(100),
  assigned_to VARCHAR(100),

  -- Status & Priority
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, blocked, resolved, closed
  priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, critical
  category VARCHAR(50), -- safety, maintenance, academic, social, financial, other

  -- Resolution
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(100),

  -- Relationships
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Voting (for issue prioritization)
  upvotes INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_issues_status ON issues(status) WHERE archived_at IS NULL;
CREATE INDEX idx_issues_priority ON issues(priority) WHERE status != 'closed';
CREATE INDEX idx_issues_assigned ON issues(assigned_to) WHERE status NOT IN ('resolved', 'closed');
```

### 6. ISSUE_COMMENTS TABLE
```sql
CREATE TABLE issue_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,

  -- Comment
  author_name VARCHAR(100) NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Committee-only comments

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_comments_issue ON issue_comments(issue_id);
```

### 7. PROTOCOLS TABLE
```sql
CREATE TABLE protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document Info
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  full_text TEXT, -- Searchable content

  -- Categorization
  year INTEGER NOT NULL,
  academic_year VARCHAR(20), -- e.g., "2024-2025"
  categories TEXT[] DEFAULT ARRAY[]::TEXT[], -- Can have multiple categories
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- External Documents
  document_urls JSONB DEFAULT '[]', -- [{title, url, type, uploaded_at}]

  -- Metadata
  protocol_date DATE,
  protocol_number VARCHAR(50), -- Official numbering
  is_public BOOLEAN DEFAULT TRUE,

  -- Search
  search_vector tsvector,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  version INTEGER DEFAULT 1
);

-- Full-text search index
CREATE INDEX idx_protocols_search ON protocols USING gin(search_vector);
CREATE INDEX idx_protocols_year ON protocols(year);
CREATE INDEX idx_protocols_categories ON protocols USING gin(categories);

-- Trigger to update search vector
CREATE TRIGGER update_protocols_search
BEFORE INSERT OR UPDATE ON protocols
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, summary, full_text);
```

### 8. EXPENSES TABLE
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50), -- supplies, food, transportation, equipment, services, other

  -- Requester
  requester_name VARCHAR(100) NOT NULL,
  requester_phone VARCHAR(20),
  request_date DATE DEFAULT CURRENT_DATE,
  needed_by_date DATE,

  -- Approval Workflow
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, paid, reimbursed
  approver_name VARCHAR(100),
  approval_date TIMESTAMPTZ,
  approval_notes TEXT,
  rejection_reason TEXT,

  -- Payment
  payment_method VARCHAR(50), -- cash, transfer, credit_card, check
  payment_date DATE,
  payment_reference VARCHAR(100),

  -- Documents
  receipt_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  invoice_url TEXT,
  approval_document_url TEXT, -- Signed approval in Google Drive

  -- Budget Tracking
  budget_category VARCHAR(50),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_requester ON expenses(requester_name);
CREATE INDEX idx_expenses_event ON expenses(event_id);
CREATE INDEX idx_expenses_date ON expenses(request_date);
```

### 9. VENDORS TABLE
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- catering, entertainment, transportation, supplies, services
  description TEXT,

  -- Contact
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  address TEXT,

  -- Business Details
  business_number VARCHAR(50), -- ﬁ·‰Ë ‚’·Á
  tax_invoice BOOLEAN DEFAULT FALSE, -- ◊È—’‡ŸÍ ﬁ·

  -- Pricing
  pricing_info TEXT,
  typical_cost_range VARCHAR(50), -- e.g., "1000-5000"
  payment_terms TEXT,

  -- Performance
  rating DECIMAL(2,1), -- 1.0 to 5.0
  total_events INTEGER DEFAULT 0,
  last_used_date DATE,

  -- Preferences
  is_preferred BOOLEAN DEFAULT FALSE,
  is_kosher BOOLEAN DEFAULT FALSE,
  notes TEXT,

  -- Contracts
  contract_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  insurance_expiry DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, blacklisted
  blacklist_reason TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_preferred ON vendors(is_preferred) WHERE status = 'active';
CREATE INDEX idx_vendors_rating ON vendors(rating DESC) WHERE status = 'active';
```

### 10. VENDOR_REVIEWS TABLE
```sql
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  reviewer_name VARCHAR(100) NOT NULL,

  -- Specific Ratings
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),

  -- Recommendation
  would_recommend BOOLEAN,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
```

### 11. MEETING_AGENDAS TABLE
```sql
CREATE TABLE meeting_agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Meeting Info
  title VARCHAR(255) NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  meeting_type VARCHAR(50), -- regular, special, emergency, annual

  -- Agenda
  topics JSONB DEFAULT '[]', -- [{order, title, description, presenter, time_allocated, notes}]

  -- Attendance
  expected_attendees TEXT[] DEFAULT ARRAY[]::TEXT[],
  actual_attendees TEXT[] DEFAULT ARRAY[]::TEXT[],
  absent_with_notice TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Minutes
  minutes TEXT,
  decisions JSONB DEFAULT '[]', -- [{topic, decision, votes_for, votes_against, abstained}]
  action_items JSONB DEFAULT '[]', -- [{task, assignee, due_date}]

  -- Documents
  attachment_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  recording_url TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'planned', -- planned, ongoing, completed, cancelled

  -- Next Meeting
  next_meeting_date DATE,
  recurring_schedule TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100),
  minutes_by VARCHAR(100),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_meetings_date ON meeting_agendas(meeting_date);
CREATE INDEX idx_meetings_status ON meeting_agendas(status);

-- Add foreign key to events table
ALTER TABLE events ADD CONSTRAINT fk_meeting_agenda
  FOREIGN KEY (meeting_agenda_id) REFERENCES meeting_agendas(id);
```

### 12. ANONYMOUS_FEEDBACK TABLE
```sql
CREATE TABLE anonymous_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Feedback Content
  message TEXT NOT NULL,
  category VARCHAR(50), -- general, safety, event, suggestion, complaint, appreciation
  language VARCHAR(10) DEFAULT 'he', -- he, ar, ru, en

  -- Response
  status VARCHAR(20) DEFAULT 'new', -- new, acknowledged, in_review, addressed, archived
  admin_notes TEXT,
  response_text TEXT, -- Public response if any

  -- Metadata (careful with anonymity!)
  submission_date DATE DEFAULT CURRENT_DATE, -- Date only, not timestamp
  ip_hash VARCHAR(64), -- Hashed IP for rate limiting only

  -- Priority
  is_urgent BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(100)
);

CREATE INDEX idx_feedback_status ON anonymous_feedback(status);
CREATE INDEX idx_feedback_category ON anonymous_feedback(category);
CREATE INDEX idx_feedback_date ON anonymous_feedback(submission_date);
```

### 13. FAMILY_INFO TABLE
```sql
CREATE TABLE family_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Family Details
  family_name VARCHAR(100) NOT NULL,
  primary_parent_name VARCHAR(100) NOT NULL,
  primary_phone VARCHAR(20) NOT NULL UNIQUE,
  primary_email VARCHAR(255) UNIQUE,

  -- Secondary Contact
  secondary_parent_name VARCHAR(100),
  secondary_phone VARCHAR(20),
  secondary_email VARCHAR(255),

  -- Children (without personal details)
  grade_levels INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- [1, 3, 5] for grades

  -- Emergency Contacts
  emergency_contacts JSONB DEFAULT '[]', -- [{name, phone, relationship}]

  -- Preferences
  language_preference VARCHAR(10) DEFAULT 'he', -- he, ar, ru, en
  communication_preference VARCHAR(20) DEFAULT 'whatsapp', -- whatsapp, sms, email

  -- Consent
  photo_permission BOOLEAN DEFAULT FALSE,
  data_usage_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  consent_date DATE,
  consent_version VARCHAR(10), -- Track which version of privacy policy

  -- Participation
  is_committee_member BOOLEAN DEFAULT FALSE,
  volunteer_interests TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, opted_out

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_family_phone ON family_info(primary_phone);
CREATE INDEX idx_family_email ON family_info(primary_email);
CREATE INDEX idx_family_grades ON family_info USING gin(grade_levels);
CREATE INDEX idx_family_committee ON family_info(is_committee_member) WHERE status = 'active';
```

### 14. EVENT_REMINDERS TABLE
```sql
CREATE TABLE event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Timing
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type VARCHAR(30) NOT NULL, -- day_before, hour_before, week_before, custom

  -- Delivery
  reminder_method VARCHAR(20)[] DEFAULT ARRAY['push']::VARCHAR[], -- push, email, sms

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Recipients
  recipient_count INTEGER,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_pending ON event_reminders(remind_at)
WHERE status = 'pending' AND remind_at > NOW();
```

### 15. FINANCIAL_SUMMARY TABLE (Materialized View)
```sql
CREATE MATERIALIZED VIEW financial_summary AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_expenses,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_expenses,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_expenses,
  COUNT(DISTINCT event_id) as events_with_expenses,
  COUNT(*) as total_transactions
FROM expenses
WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', created_at);

CREATE UNIQUE INDEX ON financial_summary (month);
```

### 16. AUDIT_LOG TABLE
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What changed
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- insert, update, delete, archive

  -- Who changed it
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(20), -- admin, editor, system

  -- Change details
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],

  -- When
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id UUID -- For tracking related changes
);

-- Partitioned by month for performance
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_user ON audit_log(user_name);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

### 17. APP_SETTINGS TABLE
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core Settings
  school_name VARCHAR(255) NOT NULL,
  school_logo_url TEXT,
  committee_name VARCHAR(255) DEFAULT '’‚” ‘’ËŸ›',
  academic_year VARCHAR(20) NOT NULL,

  -- Contact Info
  committee_email VARCHAR(255),
  committee_phone VARCHAR(20),
  school_address TEXT,

  -- Features
  registration_enabled BOOLEAN DEFAULT TRUE,
  feedback_enabled BOOLEAN DEFAULT TRUE,
  vendors_require_password BOOLEAN DEFAULT TRUE,

  -- Passwords (hashed)
  admin_password_hash TEXT NOT NULL,
  vendor_password_hash TEXT,

  -- Integrations
  google_drive_folder_id TEXT,
  whatsapp_group_link TEXT,

  -- Customization
  primary_color VARCHAR(7) DEFAULT '#0D98BA',
  secondary_color VARCHAR(7) DEFAULT '#FF8200',

  -- Limits
  max_file_size_mb INTEGER DEFAULT 10,
  session_timeout_minutes INTEGER DEFAULT 1440, -- 24 hours

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR(100)
);
```

---

## Relationships Diagram

```
EVENTS êí EVENT_REGISTRATIONS (1:N)
EVENTS êí TASKS (1:N)
EVENTS êí RESPONSIBILITIES (1:N)
EVENTS êí EXPENSES (1:N)
EVENTS êí EVENT_REMINDERS (1:N)
EVENTS êí VENDOR_REVIEWS (1:N)
EVENTS êí MEETING_AGENDAS (1:1)

ISSUES êí ISSUE_COMMENTS (1:N)
ISSUES í EVENTS (N:1)
ISSUES í TASKS (N:1)

VENDORS êí VENDOR_REVIEWS (1:N)

TASKS êí TASKS (self-referencing for subtasks)

FAMILY_INFO í EVENT_REGISTRATIONS (1:N)
```

---

## Performance Optimization Strategy

### 1. Strategic Indexes
- **Composite indexes** for common query patterns
- **Partial indexes** for filtered queries (archived_at IS NULL)
- **GIN indexes** for JSONB and full-text search
- **BRIN indexes** for time-series data

### 2. Query Optimization
```sql
-- Example: Dashboard query with multiple aggregations
CREATE OR REPLACE VIEW dashboard_stats AS
WITH upcoming_events AS (
  SELECT * FROM events
  WHERE start_datetime > NOW()
    AND status = 'published'
    AND archived_at IS NULL
  ORDER BY start_datetime
  LIMIT 10
),
pending_tasks AS (
  SELECT COUNT(*) as count FROM tasks
  WHERE status IN ('pending', 'in_progress')
    AND due_date >= CURRENT_DATE
    AND archived_at IS NULL
),
pending_expenses AS (
  SELECT COUNT(*) as count, SUM(amount) as total
  FROM expenses
  WHERE status = 'pending'
)
SELECT
  (SELECT json_agg(e.*) FROM upcoming_events e) as upcoming_events,
  (SELECT count FROM pending_tasks) as pending_tasks_count,
  (SELECT count FROM pending_expenses) as pending_expenses_count,
  (SELECT total FROM pending_expenses) as pending_expenses_total;
```

### 3. Materialized Views for Reports
- Financial summaries (refresh daily)
- Event statistics (refresh hourly)
- Volunteer participation (refresh daily)

---

## Data Integrity Rules

### 1. Foreign Key Constraints
- **CASCADE** deletes for dependent records (comments, registrations)
- **SET NULL** for optional relationships (eventítask)
- **RESTRICT** for critical relationships

### 2. Check Constraints
```sql
-- Examples
ALTER TABLE events ADD CONSTRAINT valid_rsvp_counts
  CHECK (rsvp_yes_count >= 0 AND rsvp_no_count >= 0 AND rsvp_maybe_count >= 0);

ALTER TABLE expenses ADD CONSTRAINT valid_amount
  CHECK (amount > 0);

ALTER TABLE vendor_reviews ADD CONSTRAINT valid_ratings
  CHECK (rating >= 1 AND rating <= 5);
```

### 3. Unique Constraints
- Prevent duplicate registrations (event + phone/email)
- Ensure unique phone/email per family
- Prevent duplicate vendor names

---

## Security Implementation

### 1. Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- etc...

-- Public read policy
CREATE POLICY "Public can view published events" ON events
  FOR SELECT
  USING (status = 'published' AND visibility = 'public' AND archived_at IS NULL);

-- Admin write policy
CREATE POLICY "Admins can manage all events" ON events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Committee member read policy
CREATE POLICY "Committee can view committee events" ON events
  FOR SELECT
  USING (visibility IN ('public', 'committee_only') AND archived_at IS NULL);
```

### 2. Data Encryption
- Sensitive fields encrypted at rest
- PII hashed where possible
- Passwords bcrypt hashed (rounds: 10)

### 3. Audit Trail
- Trigger-based audit logging
- Immutable audit records
- Regular audit reviews

---

## Migration Strategy

### Phase 1: Core Tables (Day 1-2)
```sql
-- Migration 001: Core tables
BEGIN;
CREATE TABLE meeting_agendas (...); -- Create first due to FK reference
CREATE TABLE events (...);
CREATE TABLE tasks (...);
CREATE TABLE responsibilities (...);
CREATE TABLE issues (...);
CREATE TABLE issue_comments (...);
COMMIT;
```

### Phase 2: Extended Features (Day 3-4)
```sql
-- Migration 002: Extended features
BEGIN;
CREATE TABLE protocols (...);
CREATE TABLE expenses (...);
CREATE TABLE vendors (...);
CREATE TABLE vendor_reviews (...);
CREATE TABLE event_registrations (...);
CREATE TABLE event_reminders (...);
COMMIT;
```

### Phase 3: Advanced Features (Day 5-6)
```sql
-- Migration 003: Advanced features
BEGIN;
CREATE TABLE anonymous_feedback (...);
CREATE TABLE family_info (...);
CREATE TABLE audit_log (...);
CREATE TABLE app_settings (...);

-- Insert default settings
INSERT INTO app_settings (
  school_name,
  academic_year,
  admin_password_hash
) VALUES (
  '—ŸÍ ·‰Ë Ÿ·’”Ÿ',
  '2024-2025',
  '$2b$10$...' -- Hashed password
);
COMMIT;
```

### Phase 4: Optimization (Day 7)
```sql
-- Migration 004: Indexes and views
BEGIN;
-- Create all indexes
-- Create materialized views
-- Set up triggers
-- Enable RLS
COMMIT;
```

---

## Data Retention Policy

### 1. Active Data
- Current academic year: Full access
- Previous year: Read-only
- 2+ years: Archived

### 2. Archival Strategy
```sql
-- Archive old data (run annually)
BEGIN;
-- Archive events
UPDATE events SET archived_at = NOW()
WHERE start_datetime < NOW() - INTERVAL '2 years'
  AND archived_at IS NULL;

-- Archive tasks
UPDATE tasks SET archived_at = NOW()
WHERE created_at < NOW() - INTERVAL '2 years'
  AND archived_at IS NULL;

-- Archive issues
UPDATE issues SET archived_at = NOW()
WHERE created_at < NOW() - INTERVAL '2 years'
  AND status = 'closed'
  AND archived_at IS NULL;
COMMIT;
```

### 3. GDPR Compliance
- Right to erasure implementation
- Data export functionality
- Consent tracking
- Anonymization procedures

---

## Real-time Subscriptions

### 1. Channel Strategy
```typescript
// Core channels
const channels = {
  events: 'realtime:public:events',
  tasks: 'realtime:public:tasks',
  urgent: 'realtime:public:urgent',
  admin: 'realtime:admin:*'
}

// Subscribe to events
supabase
  .channel(channels.events)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'events',
    filter: 'status=eq.published'
  }, handleEventChange)
  .subscribe()
```

### 2. Optimization
- Limit subscriptions to active data only
- Use filters to reduce unnecessary updates
- Batch updates when possible

---

## Backup & Recovery

### 1. Backup Schedule
- **Daily**: Full backup at 2 AM Israel time
- **Hourly**: Incremental backup
- **Real-time**: Point-in-time recovery enabled

### 2. Recovery Procedures
```sql
-- Test recovery procedure
-- 1. Create test database
CREATE DATABASE beerimanager_test;

-- 2. Restore from backup
pg_restore -d beerimanager_test backup_file.sql

-- 3. Verify data integrity
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM tasks;
-- etc...

-- 4. Switch if needed
ALTER DATABASE beerimanager RENAME TO beerimanager_old;
ALTER DATABASE beerimanager_test RENAME TO beerimanager;
```

---

## Database Maintenance

### 1. Regular Tasks
```sql
-- Weekly vacuum (Saturday night)
VACUUM (ANALYZE, VERBOSE) events;
VACUUM (ANALYZE, VERBOSE) tasks;

-- Monthly reindex
REINDEX DATABASE beerimanager;

-- Daily materialized view refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY financial_summary;
```

### 2. Monitoring Queries
```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Testing Strategy

### 1. Test Data Generation
```sql
-- Generate test events
INSERT INTO events (title, start_datetime, event_type, status)
SELECT
  '–ŸË’‚ ﬁ—◊ﬂ ' || generate_series,
  NOW() + (generate_series || ' days')::INTERVAL,
  CASE (generate_series % 4)
    WHEN 0 THEN 'meeting'
    WHEN 1 THEN 'fundraiser'
    WHEN 2 THEN 'trip'
    ELSE 'general'
  END,
  'published'
FROM generate_series(1, 100);

-- Generate test families
INSERT INTO family_info (family_name, primary_parent_name, primary_phone, grade_levels)
SELECT
  'ﬁÈ‰◊Í ' || generate_series,
  '‘’Ë‘ ' || generate_series,
  '050' || LPAD(generate_series::TEXT, 7, '0'),
  ARRAY[1 + (generate_series % 6)]
FROM generate_series(1, 50);
```

### 2. Performance Testing
```sql
-- Test query performance
EXPLAIN ANALYZE
SELECT e.*, COUNT(r.id) as registration_count
FROM events e
LEFT JOIN event_registrations r ON e.id = r.event_id
WHERE e.start_datetime > NOW()
  AND e.status = 'published'
GROUP BY e.id
ORDER BY e.start_datetime
LIMIT 10;
```

---

## Future Considerations

### 1. Scalability Plans
```sql
-- Partitioning for large tables (when > 1M rows)
CREATE TABLE audit_log_2025 PARTITION OF audit_log
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Read replicas for reporting
-- Implement caching layer (Redis)
-- Consider GraphQL for complex queries
```

### 2. Advanced Features
- AI-powered meeting summaries
- Predictive attendance analytics
- Automated expense categorization
- Smart volunteer matching

### 3. Integration Possibilities
- School management systems (Mashov)
- Municipal systems
- Payment gateways (Tranzila, PayPal)
- SMS gateways (Inforu, SMS4Free)

---

## Implementation Checklist

### Initial Setup
- [x] Create Supabase project
- [ ] Configure database settings (timezone: Asia/Jerusalem)
- [ ] Set up database roles and permissions

### Schema Creation
- [ ] Run Phase 1 migrations (core tables)
- [ ] Run Phase 2 migrations (extended features)
- [ ] Run Phase 3 migrations (advanced features)
- [ ] Run Phase 4 migrations (optimization)

### Security
- [ ] Enable RLS on all tables
- [ ] Create security policies
- [ ] Set up audit triggers
- [ ] Configure backup schedule

### Testing
- [ ] Generate test data
- [ ] Test all constraints
- [ ] Verify indexes are used
- [ ] Load testing

### Documentation
- [ ] Generate TypeScript types
- [ ] Document all stored procedures
- [ ] Create ER diagram
- [ ] Write migration guide

### Monitoring
- [ ] Set up monitoring dashboard
- [ ] Configure alerts
- [ ] Schedule maintenance tasks
- [ ] Create performance baselines

---

## Critical Success Factors

1. **Hebrew Text Handling**
   - Proper collation for sorting
   - Full-text search configuration
   - RTL considerations in JSONB

2. **Mobile Performance**
   - Optimize for slow connections
   - Minimize payload sizes
   - Efficient pagination

3. **Data Privacy**
   - Minimal PII collection
   - Proper anonymization
   - Clear consent tracking

4. **Committee Continuity**
   - Easy data handover
   - Historical preservation
   - Knowledge transfer

---

## SQL Helper Functions

```sql
-- Get upcoming events with registration count
CREATE OR REPLACE FUNCTION get_upcoming_events(limit_count INT DEFAULT 10)
RETURNS TABLE (
  event_id UUID,
  title VARCHAR,
  start_datetime TIMESTAMPTZ,
  registration_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.start_datetime,
    COUNT(r.id) as registration_count
  FROM events e
  LEFT JOIN event_registrations r ON e.id = r.event_id
  WHERE e.start_datetime > NOW()
    AND e.status = 'published'
    AND e.archived_at IS NULL
  GROUP BY e.id
  ORDER BY e.start_datetime
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get volunteer summary
CREATE OR REPLACE FUNCTION get_volunteer_summary()
RETURNS TABLE (
  person_name VARCHAR,
  total_slots BIGINT,
  upcoming_events BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    volunteer_name,
    COUNT(*) as total_slots,
    SUM(CASE WHEN e.start_datetime > NOW() THEN 1 ELSE 0 END) as upcoming_events
  FROM (
    SELECT
      jsonb_array_elements(volunteer_slots) -> 'volunteers' ->> 'name' as volunteer_name,
      e.start_datetime
    FROM events e
    WHERE e.volunteer_slots IS NOT NULL
  ) volunteers
  GROUP BY volunteer_name
  ORDER BY total_slots DESC;
END;
$$ LANGUAGE plpgsql;
```

---

*Database Design Version: 1.0.0*
*Last Updated: December 2024*
*Designed for: Parent Committee Management System (BeeriManager)*
*Database: PostgreSQL 14+ via Supabase*