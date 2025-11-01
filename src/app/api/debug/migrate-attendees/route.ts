import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Fetch all protocols
    const { data: protocols, error } = await supabase
      .from('protocols')
      .select('id, title, extracted_text, attendees')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = []
    let migratedCount = 0
    let skippedCount = 0

    for (const protocol of protocols || []) {
      const result: any = {
        id: protocol.id,
        title: protocol.title,
        action: 'skipped'
      }

      // Check if attendees already populated
      if (protocol.attendees && protocol.attendees.length > 0) {
        result.reason = 'Already has attendees'
        result.existingAttendees = protocol.attendees
        skippedCount++
        results.push(result)
        continue
      }

      // Extract attendees from HTML comment
      const attendeesMatch = protocol.extracted_text?.match(/<!--\s*ATTENDEES:\s*([^-]+)\s*-->/i)

      if (attendeesMatch) {
        const attendeesString = attendeesMatch[1].trim()
        const attendeesArray = attendeesString
          .split(',')
          .map((name: string) => name.trim())
          .filter((name: string) => name.length > 0)

        result.action = 'migrated'
        result.extractedAttendees = attendeesArray

        // Update the protocol with attendees array
        const { error: updateError } = await supabase
          .from('protocols')
          .update({ attendees: attendeesArray })
          .eq('id', protocol.id)

        if (updateError) {
          result.action = 'error'
          result.error = updateError.message
        } else {
          migratedCount++
        }

        results.push(result)
      } else {
        result.reason = 'No attendees comment found in extracted_text'
        skippedCount++
        results.push(result)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: protocols?.length || 0,
        migrated: migratedCount,
        skipped: skippedCount
      },
      results
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
