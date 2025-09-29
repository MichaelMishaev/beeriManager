import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import QRCode from 'qrcode'

// Registration validation schema
const RegistrationSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין'),
  email: z.string().email('כתובת אימייל לא תקינה').optional(),
  attendees_count: z.number().min(1).default(1),
  notes: z.string().optional(),
  dietary_requirements: z.string().optional()
})

// POST /api/events/[id]/register - Register for event
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const validation = RegistrationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if event exists and is open for registration
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'האירוע לא נמצא' },
        { status: 404 }
      )
    }

    if (!event.registration_enabled) {
      return NextResponse.json(
        { success: false, error: 'ההרשמה לאירוע זה סגורה' },
        { status: 400 }
      )
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'תאריך ההרשמה עבר' },
        { status: 400 }
      )
    }

    if (event.max_attendees && event.current_attendees + validation.data.attendees_count > event.max_attendees) {
      return NextResponse.json(
        { success: false, error: 'אין מספיק מקומות פנויים' },
        { status: 400 }
      )
    }

    // Check if already registered (by phone)
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', params.id)
      .eq('phone', validation.data.phone)
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'כבר נרשמת לאירוע זה' },
        { status: 400 }
      )
    }

    // Create registration
    const registrationData = {
      event_id: params.id,
      ...validation.data,
      status: 'confirmed',
      registration_date: new Date().toISOString()
    }

    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .insert([registrationData])
      .select()
      .single()

    if (registrationError) {
      console.error('Registration error:', registrationError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בהרשמה לאירוע' },
        { status: 500 }
      )
    }

    // Update event attendees count
    await supabase
      .from('events')
      .update({
        current_attendees: event.current_attendees + validation.data.attendees_count
      })
      .eq('id', params.id)

    // Generate QR code for registration
    const qrData = {
      registration_id: registration.id,
      event_id: params.id,
      name: validation.data.name,
      phone: validation.data.phone,
      attendees: validation.data.attendees_count
    }

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#0D98BA',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        registration,
        qr_code: qrCodeDataUrl
      },
      message: 'נרשמת בהצלחה לאירוע!'
    })

  } catch (error) {
    console.error('Registration POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהרשמה לאירוע' },
      { status: 500 }
    )
  }
}

// GET /api/events/[id]/register - Get event registrations (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', params.id)
      .order('registration_date', { ascending: false })

    if (error) {
      console.error('Registrations GET error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הנרשמים' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total_registrations: registrations.length,
      total_attendees: registrations.reduce((sum, reg) => sum + reg.attendees_count, 0),
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length,
      checked_in: registrations.filter(r => r.checked_in).length
    }

    return NextResponse.json({
      success: true,
      data: registrations,
      stats
    })

  } catch (error) {
    console.error('Registrations GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הנרשמים' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id]/register - Cancel registration
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'מספר טלפון חסר' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Find registration
    const { data: registration, error: findError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', params.id)
      .eq('phone', phone)
      .single()

    if (findError || !registration) {
      return NextResponse.json(
        { success: false, error: 'ההרשמה לא נמצאה' },
        { status: 404 }
      )
    }

    // Update registration status to cancelled
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', registration.id)

    if (updateError) {
      console.error('Registration cancel error:', updateError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בביטול ההרשמה' },
        { status: 500 }
      )
    }

    // Update event attendees count
    await supabase
      .from('events')
      .update({
        current_attendees: supabase.sql`current_attendees - ${registration.attendees_count}`
      })
      .eq('id', params.id)

    return NextResponse.json({
      success: true,
      message: 'ההרשמה בוטלה בהצלחה'
    })

  } catch (error) {
    console.error('Registration DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בביטול ההרשמה' },
      { status: 500 }
    )
  }
}

// Import verifyJWT that was missing
import { verifyJWT } from '@/lib/auth/jwt'