import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('Checking protocols table schema...')

  // Query information_schema to get actual columns
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'protocols'
      ORDER BY ordinal_position;
    `
  })

  if (error) {
    console.error('Error querying schema:', error)

    // Alternative: Try to select from table to see structure
    console.log('\nTrying alternative method...')
    const { data: testData, error: testError } = await supabase
      .from('protocols')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('Table query error:', testError)
    } else {
      console.log('Sample data columns:', testData && testData[0] ? Object.keys(testData[0]) : 'No data')
    }
  } else {
    console.log('Columns found:')
    console.table(data)
  }

  // Try a minimal insert to see what works
  console.log('\nTesting minimal insert...')
  const { data: insertData, error: insertError } = await supabase
    .from('protocols')
    .insert([{
      title: 'TEST',
      protocol_type: 'regular',
      protocol_date: '2025-01-01',
      is_public: true
    }])
    .select()

  if (insertError) {
    console.error('Insert error:', insertError)
  } else {
    console.log('Insert successful! Columns that worked:', Object.keys(insertData[0]))

    // Clean up test data
    await supabase.from('protocols').delete().eq('title', 'TEST')
  }
}

checkSchema()
