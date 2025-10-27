/**
 * Migration Script: Extract attendees from HTML comments and populate attendees field
 *
 * This script:
 * 1. Finds all protocols with attendees in HTML comments (<!-- ATTENDEES: name1, name2 -->)
 * 2. Extracts the names into an array
 * 3. Updates the attendees database field
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateAttendees() {
  console.log('🚀 Starting attendees migration...\n')

  // Fetch all protocols
  const { data: protocols, error } = await supabase
    .from('protocols')
    .select('id, title, extracted_text, attendees')

  if (error) {
    console.error('❌ Error fetching protocols:', error)
    return
  }

  console.log(`📊 Found ${protocols?.length || 0} protocols\n`)

  let migratedCount = 0
  let skippedCount = 0

  for (const protocol of protocols || []) {
    // Check if attendees already populated
    if (protocol.attendees && protocol.attendees.length > 0) {
      console.log(`⏭️  Skipping "${protocol.title}" - attendees already populated`)
      skippedCount++
      continue
    }

    // Extract attendees from HTML comment
    const attendeesMatch = protocol.extracted_text?.match(/<!--\s*ATTENDEES:\s*([^-]+)\s*-->/i)

    if (attendeesMatch) {
      const attendeesString = attendeesMatch[1].trim()
      const attendeesArray = attendeesString
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)

      console.log(`📝 Migrating "${protocol.title}"`)
      console.log(`   Found attendees: ${attendeesArray.join(', ')}`)

      // Update the protocol with attendees array
      const { error: updateError } = await supabase
        .from('protocols')
        .update({ attendees: attendeesArray })
        .eq('id', protocol.id)

      if (updateError) {
        console.error(`   ❌ Error updating: ${updateError.message}`)
      } else {
        console.log(`   ✅ Migrated successfully`)
        migratedCount++
      }
    } else {
      console.log(`⏭️  Skipping "${protocol.title}" - no attendees comment found`)
      skippedCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Migration complete!`)
  console.log(`   Migrated: ${migratedCount}`)
  console.log(`   Skipped: ${skippedCount}`)
  console.log('='.repeat(50))
}

migrateAttendees()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
