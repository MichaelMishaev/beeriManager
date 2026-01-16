import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Phone validation schema (Israeli format)
const PhoneSchema = z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין')

/**
 * GET /api/events/my-events?phone=05XXXXXXXX
 * Find events by creator phone number (public access)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    // Validate phone parameter
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'נדרש מספר טלפון' },
        { status: 400 }
      )
    }

    // Normalize phone number (remove dashes, spaces)
    const normalizedPhone = phone.replace(/[-\s]/g, '')

    const phoneValidation = PhoneSchema.safeParse(normalizedPhone)
    if (!phoneValidation.success) {
      return NextResponse.json(
        { success: false, error: 'מספר טלפון לא תקין. יש להזין מספר ישראלי (05XXXXXXXX)' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find events by creator_phone
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, title_ru, start_datetime, end_datetime, location, event_type, status, priority, edit_token, creator_phone, created_at, updated_at')
      .eq('creator_phone', normalizedPhone)
      .is('archived_at', null)
      .order('start_datetime', { ascending: false })
      .limit(50)

    if (error) {
      console.error('My events query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בחיפוש האירועים' },
        { status: 500 }
      )
    }

    // Map events to include edit_url
    const eventsWithUrls = (events || []).map(event => ({
      ...event,
      edit_url: event.edit_token ? `/events/edit/${event.edit_token}` : null
    }))

    return NextResponse.json({
      success: true,
      data: eventsWithUrls,
      count: eventsWithUrls.length,
      phone: normalizedPhone
    })
  } catch (error) {
    console.error('My events GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בחיפוש האירועים' },
      { status: 500 }
    )
  }
}
