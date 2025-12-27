import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import type { CreateEventArgs, CreateUrgentMessageArgs } from '@/lib/ai/tools'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface InsertRequest {
  type: 'event' | 'events' | 'urgent_message'
  data: CreateEventArgs | CreateEventArgs[] | CreateUrgentMessageArgs
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token.value)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { type, data }: InsertRequest = await req.json()
    const supabase = await createClient()

    if (type === 'event') {
      const eventData = data as CreateEventArgs

      // Insert event
      const { data: insertedEvent, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          title_ru: eventData.title_ru || eventData.title,
          description: eventData.description,
          description_ru: eventData.description_ru,
          start_datetime: eventData.start_datetime,
          end_datetime: eventData.end_datetime,
          location: eventData.location,
          location_ru: eventData.location_ru,
          event_type: 'general',
          status: 'published',
          visibility: 'public',
          priority: 'normal',
          registration_enabled: false,
          current_attendees: 0,
          rsvp_yes_count: 0,
          rsvp_no_count: 0,
          rsvp_maybe_count: 0,
          budget_spent: 0,
          requires_payment: false,
          version: 1,
        })
        .select()
        .single()

      if (error) {
        console.error('[AI Insert] Event insert error:', error)
        return NextResponse.json(
          { success: false, error: 'שגיאה ביצירת האירוע' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '✅ האירוע נוצר בהצלחה!',
        data: insertedEvent,
      })
    } else if (type === 'events') {
      // Handle multiple events
      const eventsData = data as CreateEventArgs[]

      const eventsToInsert = eventsData.map((eventData) => ({
        title: eventData.title,
        title_ru: eventData.title_ru || eventData.title,
        description: eventData.description,
        description_ru: eventData.description_ru,
        start_datetime: eventData.start_datetime,
        end_datetime: eventData.end_datetime,
        location: eventData.location,
        location_ru: eventData.location_ru,
        event_type: 'general' as const,
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
      }))

      // Insert all events at once
      const { data: insertedEvents, error } = await supabase
        .from('events')
        .insert(eventsToInsert)
        .select()

      if (error) {
        console.error('[AI Insert] Multiple events insert error:', error)
        return NextResponse.json(
          { success: false, error: 'שגיאה ביצירת האירועים' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `✅ ${eventsData.length} אירועים נוצרו בהצלחה!`,
        data: insertedEvents,
      })
    } else if (type === 'urgent_message') {
      const messageData = data as CreateUrgentMessageArgs

      // Set default start_date to today if not provided
      const today = new Date().toISOString().split('T')[0]

      // Insert urgent message
      const { data: insertedMessage, error } = await supabase
        .from('urgent_messages')
        .insert({
          type: messageData.type || 'info',
          title_he: messageData.title_he,
          title_ru: messageData.title_ru,
          description_he: messageData.description_he,
          description_ru: messageData.description_ru,
          start_date: messageData.start_date || today,
          end_date: messageData.end_date,
          icon: messageData.icon,
          color: messageData.color || 'bg-blue-50',
          is_active: true,
          created_by: 'admin_ai',
        })
        .select()
        .single()

      if (error) {
        console.error('[AI Insert] Urgent message insert error:', error)
        return NextResponse.json(
          { success: false, error: 'שגיאה ביצירת ההודעה הדחופה' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '✅ ההודעה הדחופה נוצרה בהצלחה!',
        data: insertedMessage,
      })
    }

    return NextResponse.json(
      { success: false, error: 'סוג לא תקין' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[AI Insert] Error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בשמירה למערכת' },
      { status: 500 }
    )
  }
}
