-- Migration: Add extracted_text column to protocols table
-- Description: Stores automatically extracted text from uploaded protocol documents (PDF, DOCX, images)
-- Date: 2025-10-03

-- Add extracted_text column to protocols table
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN protocols.extracted_text IS 'Automatically extracted text content from uploaded protocol documents using pdf-parse, mammoth, or tesseract.js';

-- Create index for full-text search on extracted_text (using default 'simple' config since 'hebrew' doesn't exist)
CREATE INDEX IF NOT EXISTS idx_protocols_extracted_text
ON protocols USING gin(to_tsvector('simple', COALESCE(extracted_text, '')));

-- Update RLS policies (if needed - protocols should already have public read access)
-- No changes needed as existing RLS policies cover all columns
