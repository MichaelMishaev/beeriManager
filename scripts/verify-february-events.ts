/**
 * Verify February 2026 events in database
 * Run with: npx tsx scripts/verify-february-events.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, start_datetime, event_type, status')
    .gte('start_datetime', '2026-02-01T00:00:00')
    .lte('start_datetime', '2026-02-28T23:59:59')
    .order('start_datetime', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('📅 February 2026 Events in Database:\n')
  console.log(`Total: ${data.length} events\n`)

  const typeEmojis: Record<string, string> = {
    trip: '🚌',
    meeting: '🤝',
    workshop: '🎓',
    general: '📌'
  }

  data.forEach((e, i) => {
    const date = e.start_datetime.split('T')[0]
    const time = e.start_datetime.split('T')[1].substring(0, 5)
    const emoji = typeEmojis[e.event_type] || '📌'
    console.log(`${i + 1}. [${date} ${time}] ${emoji} ${e.title}`)
  })

  // Summary by type
  console.log('\n📊 Summary by Event Type:')
  const byType = data.reduce((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  Object.entries(byType).forEach(([type, count]) => {
    const emoji = typeEmojis[type] || '📌'
    console.log(`   ${emoji} ${type}: ${count}`)
  })
}

verify().then(() => process.exit(0)).catch(() => process.exit(1))
