/**
 * Script to insert February 2026 events into Supabase
 * Run with: npx tsx scripts/insert-february-2026-events.ts
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

// Define the JSON structure
interface EventItem {
  type: string
  description: string
}

interface DayData {
  date: string
  day: string
  items: EventItem[]
}

interface FebruaryData {
  school: string
  month: string
  events: DayData[]
}

// Map JSON event types to database event_type
function mapEventType(type: string): 'general' | 'meeting' | 'trip' | 'workshop' {
  const typeMap: Record<string, 'general' | 'meeting' | 'trip' | 'workshop'> = {
    'song_of_the_day': 'general',
    'holiday_activity': 'general',
    'program': 'workshop',
    'health_guidance': 'workshop',
    'field_trip': 'trip',
    'awareness_week': 'general',
    'health_check': 'workshop',
    'sports_event': 'general',
    'school_committee': 'meeting',
    'values_day': 'general',
    'semester_event': 'general',
    'school_event': 'general',
    'municipal_program': 'meeting',
    'education_program': 'workshop',
    'quiz_event': 'workshop'
  }
  return typeMap[type] || 'general'
}

// Load JSON data
const jsonPath = path.join(__dirname, '..', 'Docs', 'devops', 'februaryEvents.md')
const rawData = fs.readFileSync(jsonPath, 'utf-8')
const februaryData: FebruaryData = JSON.parse(rawData)

// Transform JSON to database format
const eventsToInsert = februaryData.events.flatMap(dayData => {
  return dayData.items.map(item => {
    return {
      title: item.description,
      title_ru: null,
      description: null,
      description_ru: null,
      start_datetime: `${dayData.date}T08:00:00`, // 08:00 school start time
      end_datetime: null,
      location: null,
      location_ru: null,
      event_type: mapEventType(item.type),
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
  console.log('🚀 Starting February 2026 events insertion...')
  console.log(`🏫 School: ${februaryData.school}`)
  console.log(`📊 Total events to insert: ${eventsToInsert.length}`)
  console.log(`📅 Date range: ${februaryData.events[0].date} to ${februaryData.events[februaryData.events.length - 1].date}`)

  try {
    // First, check for existing February 2026 events
    const { data: existingEvents, error: checkError } = await supabase
      .from('events')
      .select('id, title, start_datetime')
      .gte('start_datetime', '2026-02-01T00:00:00')
      .lte('start_datetime', '2026-02-28T23:59:59')

    if (checkError) {
      console.error('❌ Error checking existing events:', checkError)
      throw checkError
    }

    if (existingEvents && existingEvents.length > 0) {
      console.warn(`⚠️  Found ${existingEvents.length} existing February 2026 events`)
      console.log('📋 Existing events:')
      existingEvents.forEach(e => {
        console.log(`   - ${e.start_datetime}: ${e.title.substring(0, 50)}...`)
      })
      console.log('\n❓ Continuing to add MORE events (not replacing existing ones).\n')
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
    const eventsByDate = new Map<string, string[]>()
    data?.forEach(event => {
      const date = event.start_datetime.split('T')[0]
      const existing = eventsByDate.get(date) || []
      existing.push(event.title.substring(0, 40))
      eventsByDate.set(date, existing)
    })

    console.log('\n📊 Summary by date:')
    Array.from(eventsByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, titles]) => {
        console.log(`   ${date}: ${titles.length} event(s)`)
        titles.forEach(title => console.log(`      • ${title}...`))
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
