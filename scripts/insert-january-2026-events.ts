/**
 * Script to insert January 2026 events into Supabase
 * Run with: npx tsx scripts/insert-january-2026-events.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Load JSON data
const jsonPath = path.join(__dirname, '..', 'january-2026-events-final.json')
const rawData = fs.readFileSync(jsonPath, 'utf-8')
const januaryData: Array<{
  date: string
  day: string
  events: string[]
}> = JSON.parse(rawData)

// Transform JSON to database format
const eventsToInsert = januaryData.flatMap(dayData => {
  return dayData.events.map(eventText => {
    // Determine event type based on keywords
    let eventType: 'general' | 'meeting' | 'trip' | 'workshop' = 'general'
    if (eventText.includes('סיור') || eventText.includes('ביקור')) {
      eventType = 'trip'
    } else if (eventText.includes('מפגש') || eventText.includes('פרלמנט')) {
      eventType = 'meeting'
    } else if (eventText.includes('סדנה') || eventText.includes('הצגה') || eventText.includes('STEM')) {
      eventType = 'workshop'
    }

    return {
      title: eventText,
      title_ru: null,
      description: null,
      description_ru: null,
      start_datetime: `${dayData.date}T00:00:00`,
      end_datetime: null,
      location: null,
      location_ru: null,
      event_type: eventType,
      status: 'published' as const,
      visibility: 'public' as const,
      priority: 'normal' as const,
      registration_enabled: false,
      current_attendees: 0,
      rsvp_yes_count: 0,
      rsvp_no_count: 0,
      rsvp_maybe_count: 0,
      budget_spent: 0,
      requires_payment: false,
      version: 1,
      created_by: 'admin'
    }
  })
})

async function insertEvents() {
  console.log('🚀 Starting January 2026 events insertion...')
  console.log(`📊 Total events to insert: ${eventsToInsert.length}`)
  console.log(`📅 Date range: ${januaryData[0].date} to ${januaryData[januaryData.length - 1].date}`)

  try {
    // First, check for existing January 2026 events
    const { data: existingEvents, error: checkError } = await supabase
      .from('events')
      .select('id, title, start_datetime')
      .gte('start_datetime', '2026-01-01T00:00:00')
      .lte('start_datetime', '2026-01-31T23:59:59')

    if (checkError) {
      console.error('❌ Error checking existing events:', checkError)
      throw checkError
    }

    if (existingEvents && existingEvents.length > 0) {
      console.warn(`⚠️  Found ${existingEvents.length} existing January 2026 events`)
      console.log('📋 Existing events:')
      existingEvents.forEach(e => {
        console.log(`   - ${e.start_datetime}: ${e.title.substring(0, 50)}...`)
      })

      // Ask for confirmation (in production, you might want to handle this differently)
      console.log('\n❓ Do you want to continue? This will add MORE events (not replace).')
      console.log('   To replace, first delete existing events via API or admin panel.\n')
    }

    // Insert events
    const { data, error } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select()

    if (error) {
      console.error('❌ Error inserting events:', error)
      throw error
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} events!`)

    // Group by date for summary
    const eventsByDate = new Map<string, number>()
    data?.forEach(event => {
      const date = event.start_datetime.split('T')[0]
      eventsByDate.set(date, (eventsByDate.get(date) || 0) + 1)
    })

    console.log('\n📊 Summary by date:')
    Array.from(eventsByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        console.log(`   ${date}: ${count} event(s)`)
      })

    return data
  } catch (error) {
    console.error('❌ Failed to insert events:', error)
    throw error
  }
}

// Run the script
insertEvents()
  .then(() => {
    console.log('\n✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
