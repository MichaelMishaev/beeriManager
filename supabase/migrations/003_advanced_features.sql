-- Advanced Features Migration (Phase 3)
-- This migration adds remaining advanced features

BEGIN;

-- Anonymous Feedback table
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

-- Family Info table
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

-- Audit Log table
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

-- App Settings table (single row configuration)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core Settings
  school_name VARCHAR(255) NOT NULL,
  school_logo_url TEXT,
  committee_name VARCHAR(255) DEFAULT 'ועד הורים',
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

-- Financial Summary materialized view
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

-- Dashboard Statistics function
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'upcoming_events', (
      SELECT COUNT(*) FROM events
      WHERE start_datetime > NOW()
      AND status = 'published'
      AND archived_at IS NULL
    ),
    'pending_tasks', (
      SELECT COUNT(*) FROM tasks
      WHERE status IN ('pending', 'in_progress')
      AND archived_at IS NULL
    ),
    'pending_expenses', (
      SELECT COUNT(*) FROM expenses
      WHERE status = 'pending'
    ),
    'active_issues', (
      SELECT COUNT(*) FROM issues
      WHERE status NOT IN ('resolved', 'closed')
      AND archived_at IS NULL
    ),
    'this_month_events', (
      SELECT COUNT(*) FROM events
      WHERE DATE_TRUNC('month', start_datetime) = DATE_TRUNC('month', NOW())
      AND archived_at IS NULL
    ),
    'recent_feedback', (
      SELECT COUNT(*) FROM anonymous_feedback
      WHERE created_at > NOW() - INTERVAL '7 days'
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get upcoming events with registration count
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

-- Create indexes for new tables
CREATE INDEX idx_feedback_status ON anonymous_feedback(status);
CREATE INDEX idx_feedback_category ON anonymous_feedback(category);
CREATE INDEX idx_feedback_date ON anonymous_feedback(submission_date);

CREATE INDEX idx_family_phone ON family_info(primary_phone);
CREATE INDEX idx_family_email ON family_info(primary_email);
CREATE INDEX idx_family_grades ON family_info USING gin(grade_levels);
CREATE INDEX idx_family_committee ON family_info(is_committee_member) WHERE status = 'active';

-- Partitioned index for audit log by month for performance
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_user ON audit_log(user_name);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Enable RLS for new tables
ALTER TABLE anonymous_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin can view feedback" ON anonymous_feedback
  FOR SELECT
  USING (true); -- Admins only in real implementation

CREATE POLICY "Families can view their own info" ON family_info
  FOR SELECT
  USING (true); -- Will be restricted to own family in real implementation

CREATE POLICY "Admin can view audit log" ON audit_log
  FOR SELECT
  USING (true); -- Admins only

CREATE POLICY "Admin can view app settings" ON app_settings
  FOR SELECT
  USING (true); -- Admins only

-- Temporary development policies
CREATE POLICY "Allow all for development" ON anonymous_feedback FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON family_info FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON audit_log FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON app_settings FOR ALL USING (true);

-- Insert default app settings
INSERT INTO app_settings (
  school_name,
  academic_year,
  admin_password_hash
) VALUES (
  'בית ספר יסודי',
  '2024-2025',
  '$2b$10$defaulthashedpassword' -- This should be replaced with actual hashed password
);

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger AS $$
BEGIN
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
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    current_setting('app.current_user', true),
    current_setting('app.current_role', true),
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_events_trigger
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_expenses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

COMMIT;