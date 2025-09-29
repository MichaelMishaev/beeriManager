-- Core Tables Migration (Phase 1)
-- This migration creates the essential tables for BeeriManager

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Meeting Agendas (create first due to FK reference from events)
CREATE TABLE meeting_agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Meeting Info
  title VARCHAR(255) NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  meeting_type VARCHAR(50) DEFAULT 'regular', -- regular, special, emergency, annual

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

-- Events table (BeeriCalendar Core)
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
  meeting_agenda_id UUID REFERENCES meeting_agendas(id) ON DELETE SET NULL,

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

-- Tasks table
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

-- Responsibilities table
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

-- Issues table
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

-- Issue Comments table
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

-- Create indexes for performance
CREATE INDEX idx_events_start ON events(start_datetime) WHERE archived_at IS NULL;
CREATE INDEX idx_events_status ON events(status) WHERE archived_at IS NULL;
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_recurring ON events(recurrence_parent_id);
CREATE INDEX idx_events_search ON events USING gin(to_tsvector('simple', title || ' ' || COALESCE(description, '')));

CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status != 'completed' AND archived_at IS NULL;
CREATE INDEX idx_tasks_owner ON tasks(owner_name);
CREATE INDEX idx_tasks_status ON tasks(status) WHERE archived_at IS NULL;
CREATE INDEX idx_tasks_event ON tasks(event_id);

CREATE INDEX idx_responsibilities_person ON responsibilities(person_name);
CREATE INDEX idx_responsibilities_active ON responsibilities(is_active);
CREATE INDEX idx_responsibilities_event ON responsibilities(event_id);

CREATE INDEX idx_issues_status ON issues(status) WHERE archived_at IS NULL;
CREATE INDEX idx_issues_priority ON issues(priority) WHERE status != 'closed';
CREATE INDEX idx_issues_assigned ON issues(assigned_to) WHERE status NOT IN ('resolved', 'closed');

CREATE INDEX idx_comments_issue ON issue_comments(issue_id);
CREATE INDEX idx_meetings_date ON meeting_agendas(meeting_date);
CREATE INDEX idx_meetings_status ON meeting_agendas(status);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_agendas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Public read, admin write)
CREATE POLICY "Public can view published events" ON events
  FOR SELECT
  USING (status = 'published' AND visibility = 'public' AND archived_at IS NULL);

CREATE POLICY "Public can view tasks" ON tasks
  FOR SELECT
  USING (archived_at IS NULL);

CREATE POLICY "Public can view responsibilities" ON responsibilities
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view issues" ON issues
  FOR SELECT
  USING (archived_at IS NULL);

CREATE POLICY "Public can view issue comments" ON issue_comments
  FOR SELECT
  USING (is_internal = FALSE);

CREATE POLICY "Public can view meeting agendas" ON meeting_agendas
  FOR SELECT
  USING (true);

-- Admin policies (will be updated when auth is implemented)
-- For now, allow all operations (will be restricted later)
CREATE POLICY "Allow all for development" ON events FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON responsibilities FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON issues FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON issue_comments FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON meeting_agendas FOR ALL USING (true);

COMMIT;