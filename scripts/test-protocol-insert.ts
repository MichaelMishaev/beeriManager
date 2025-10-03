import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInsert() {
  console.log('Testing protocol insert with actual data...')

  const protocolData = {
    title: 'Test Protocol',
    protocol_date: '2025-09-11',
    year: 2025, // Added required field
    categories: ['regular'],
    is_public: true,
    extracted_text: '<!-- ATTENDEES: Test User -->\n<h2>Test Protocol</h2>',
    agenda: 'Test agenda',
    decisions: 'Test decisions',
    action_items: 'Test actions',
    document_url: 'test.pdf',
    attachment_urls: [],
    approved: false,
    created_by: 'admin'
  }

  console.log('Inserting:', JSON.stringify(protocolData, null, 2))

  const { data, error } = await supabase
    .from('protocols')
    .insert([protocolData])
    .select()

  if (error) {
    console.error('❌ Insert failed:', error)
  } else {
    console.log('✅ Insert successful!')
    console.log('Created protocol:', data)

    // Clean up
    if (data && data[0]) {
      await supabase.from('protocols').delete().eq('id', data[0].id)
      console.log('Test data cleaned up')
    }
  }
}

testInsert()
