import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Running migration: Add extracted_text column to protocols...')

    // Add extracted_text column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE protocols
        ADD COLUMN IF NOT EXISTS extracted_text TEXT;

        COMMENT ON COLUMN protocols.extracted_text IS 'Automatically extracted text content from uploaded protocol documents using pdf-parse, mammoth, or tesseract.js';
      `
    })

    if (alterError) {
      console.error('Error adding column:', alterError)
      // Try direct SQL approach
      console.log('Trying alternative approach...')

      const { error: directError } = await supabase
        .from('protocols')
        .select('extracted_text')
        .limit(1)

      if (directError?.code === '42703') {
        console.log('Column does not exist, migration needed')
        console.log('Please run this SQL in Supabase SQL Editor:')
        console.log(`
ALTER TABLE protocols
ADD COLUMN extracted_text TEXT;

COMMENT ON COLUMN protocols.extracted_text IS 'Automatically extracted text content from uploaded protocol documents';

CREATE INDEX idx_protocols_extracted_text
ON protocols USING gin(to_tsvector('hebrew', COALESCE(extracted_text, '')));
        `)
      } else {
        console.log('Column might already exist or other error:', directError)
      }
    } else {
      console.log('✅ Migration completed successfully')
    }
  } catch (error) {
    console.error('Migration error:', error)
  }
}

runMigration()
