-- Add protocol summarization actions to ai_chat_logs
-- This allows logging of protocol summarization requests and refinements

-- Drop the existing constraint
ALTER TABLE ai_chat_logs DROP CONSTRAINT IF EXISTS ai_chat_logs_action_check;

-- Add the new constraint with protocol summarization actions
ALTER TABLE ai_chat_logs ADD CONSTRAINT ai_chat_logs_action_check
  CHECK (action IN (
    'initial',
    'select_type',
    'understand_message',
    'extract_data',
    'insert_data',
    'summarize_protocol',      -- Initial protocol summarization
    'refine_summary'           -- Summary refinement/adjustment
  ));

COMMENT ON CONSTRAINT ai_chat_logs_action_check ON ai_chat_logs IS 'Valid AI action types including protocol summarization';
