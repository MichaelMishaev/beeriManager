-- Update response_type constraint to include 'request'
-- This makes logs clearer by distinguishing request logs from response logs

-- Drop old constraint
ALTER TABLE ai_chat_logs 
DROP CONSTRAINT IF EXISTS ai_chat_logs_response_type_check;

-- Add new constraint with 'request' option
ALTER TABLE ai_chat_logs 
ADD CONSTRAINT ai_chat_logs_response_type_check 
CHECK (response_type IN ('request', 'text', 'function_call', 'error'));

COMMENT ON COLUMN ai_chat_logs.response_type IS 
'Type of log entry: request (GPT API request), text (text response), function_call (tool use), error (failed response)';
