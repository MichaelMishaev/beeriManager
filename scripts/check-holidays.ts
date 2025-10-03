import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkHolidays() {
  console.log('Checking holidays...')
  console.log('Today:', new Date().toISOString().split('T')[0])

  const { data: holidays, error } = await supabase
    .from('holidays')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\nFound ${holidays?.length || 0} holidays:`)
  holidays?.forEach(h => {
    const isPast = new Date(h.end_date) < new Date()
    const status = isPast ? '❌ PAST' : '✅ UPCOMING'
    console.log(`${status} | ${h.start_date} to ${h.end_date} | ${h.hebrew_name} | School closed: ${h.is_school_closed}`)
  })

  // Check what the API returns for upcoming
  console.log('\n\nChecking upcoming holidays API:')
  const today = new Date().toISOString().split('T')[0]
  const { data: upcoming, error: upcomingError } = await supabase
    .from('holidays')
    .select('*')
    .gte('end_date', today)
    .order('start_date', { ascending: true })
    .limit(1)

  if (upcomingError) {
    console.error('Error:', upcomingError)
    return
  }

  console.log('Next upcoming holiday:', upcoming?.[0])
}

checkHolidays()
