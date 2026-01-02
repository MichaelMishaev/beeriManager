-- AI Chat Logs Table
-- Stores all AI assistant interactions for debugging and analysis

CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Session tracking
  session_id TEXT NOT NULL,

  -- Log metadata
  level TEXT NOT NULL CHECK (level IN ('info', 'success', 'warning', 'error')),
  action TEXT NOT NULL CHECK (action IN ('initial', 'select_type', 'understand_message', 'extract_data', 'insert_data')),

  -- Request data
  user_message TEXT,
  message_length INTEGER,

  -- GPT interaction
  gpt_model TEXT,
  gpt_round_number INTEGER,
  gpt_prompt_tokens INTEGER,
  gpt_completion_tokens INTEGER,
  gpt_total_tokens INTEGER,
  gpt_cost DECIMAL(10, 6), -- Store cost in dollars (e.g., 0.000150)

  -- Response data
  response_type TEXT CHECK (response_type IN ('text', 'function_call', 'error')),
  function_name TEXT,
  extracted_data_type TEXT CHECK (extracted_data_type IN ('event', 'events', 'urgent_message', 'highlight')),

  -- Validation
  validation_success BOOLEAN,
  validation_errors JSONB,

  -- Rate limiting
  usage_count INTEGER,
  daily_limit INTEGER,
  rate_limit_reached BOOLEAN,

  -- Error tracking
  error_message TEXT,
  error_stack TEXT,

  -- Performance
  duration_ms INTEGER,

  -- Additional context (flexible JSON field)
  metadata JSONB
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_created_at ON ai_chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_session_id ON ai_chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_level ON ai_chat_logs(level);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_action ON ai_chat_logs(action);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_error ON ai_chat_logs(level) WHERE level = 'error';
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_extracted_type ON ai_chat_logs(extracted_data_type);

-- RLS: Public read for admins, service role write
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) to insert logs
CREATE POLICY "Service role can insert logs"
  ON ai_chat_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow admins to read logs for analysis
CREATE POLICY "Admins can read all logs"
  ON ai_chat_logs
  FOR SELECT
  TO public
  USING (true); -- In production, restrict to admin role

COMMENT ON TABLE ai_chat_logs IS 'Logs all AI assistant interactions for debugging, analysis, and cost tracking';
COMMENT ON COLUMN ai_chat_logs.session_id IS 'Unique session identifier to track conversation flows';
COMMENT ON COLUMN ai_chat_logs.gpt_cost IS 'Cost in USD for this GPT API call';
COMMENT ON COLUMN ai_chat_logs.validation_errors IS 'Array of validation error messages (JSON)';
COMMENT ON COLUMN ai_chat_logs.metadata IS 'Additional context data (JSON)';
