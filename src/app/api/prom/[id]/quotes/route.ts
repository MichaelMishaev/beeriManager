import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Vendor quote validation schema
const QuoteSchema = z.object({
  vendor_id: z.string().uuid().optional().nullable(),
  vendor_name: z.string().min(2, 'שם הספק חייב להכיל לפחות 2 תווים'),
  vendor_contact_name: z.string().optional().nullable(),
  vendor_phone: z.string().optional().nullable(),
  vendor_email: z.string().email('כתובת אימייל לא תקינה').optional().nullable().or(z.literal('')),
  category: z.enum(['venue', 'catering', 'dj', 'photography', 'decorations', 'transportation', 'entertainment', 'shirts', 'sound_lighting', 'yearbook', 'recording', 'scenery', 'flowers', 'security', 'electrician', 'moving', 'video_editing', 'drums', 'choreography', 'other']),
  price_total: z.number().min(0),
  price_per_student: z.number().min(0).optional().nullable(),
  price_notes: z.string().optional().nullable(),
  services_included: z.array(z.string()).default([]),
  availability_status: z.enum(['available', 'unavailable', 'pending', 'unknown']).default('unknown'),
  availability_date: z.string().optional().nullable(),
  availability_notes: z.string().optional().nullable(),
  pros: z.string().optional().nullable(),
  cons: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  admin_notes: z.string().optional().nullable(),
  attachment_urls: z.array(z.string()).default([]),
  is_selected: z.boolean().default(false),
  is_finalist: z.boolean().default(false),
  display_order: z.number().default(0),
  display_label: z.string().optional().nullable()
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Check if user is admin
    const token = req.cookies.get('auth-token')
    const isAdmin = token && verifyJWT(token.value)

    // Query parameters
    const category = searchParams.get('category')
    const finalistsOnly = searchParams.get('finalists') === 'true'

    let query = supabase
      .from('prom_vendor_quotes')
      .select('*')
      .eq('prom_id', promId)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Non-admin users can see all quotes (public sharing enabled)
    // But if finalistsOnly param is set, filter by finalists
    if (finalistsOnly) {
      query = query.eq('is_finalist', true)
    }

    // Order by display_order then created_at
    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Quotes query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הצעות המחיר' },
        { status: 500 }
      )
    }

    // For non-admin, hide only truly sensitive information
    // But keep vendor names and all other details visible for transparency
    const sanitizedData = isAdmin ? data : data?.map(quote => ({
      ...quote,
      vendor_phone: undefined,      // Hide phone for privacy
      vendor_email: undefined,      // Hide email for privacy
      admin_notes: undefined        // Hide internal admin notes
    }))

    return NextResponse.json({
      success: true,
      data: sanitizedData || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Quotes GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הצעות המחיר' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: promId } = await params
    const body = await req.json()

    // Clean up empty strings to null
    const cleanedBody = {
      ...body,
      vendor_id: body.vendor_id === '' ? null : body.vendor_id,
      vendor_contact_name: body.vendor_contact_name === '' ? null : body.vendor_contact_name,
      vendor_phone: body.vendor_phone === '' ? null : body.vendor_phone,
      vendor_email: body.vendor_email === '' ? null : body.vendor_email,
      price_total: body.price_total ? parseFloat(body.price_total) : 0,
      price_per_student: body.price_per_student ? parseFloat(body.price_per_student) : null,
      price_notes: body.price_notes === '' ? null : body.price_notes,
      services_included: body.services_included || [],
      availability_date: body.availability_date === '' ? null : body.availability_date,
      availability_notes: body.availability_notes === '' ? null : body.availability_notes,
      pros: body.pros === '' ? null : body.pros,
      cons: body.cons === '' ? null : body.cons,
      rating: body.rating ? parseInt(body.rating) : null,
      admin_notes: body.admin_notes === '' ? null : body.admin_notes,
      attachment_urls: body.attachment_urls || [],
      display_label: body.display_label === '' ? null : body.display_label
    }

    const validation = QuoteSchema.safeParse(cleanedBody)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create quote
    const { data, error } = await supabase
      .from('prom_vendor_quotes')
      .insert([{
        ...validation.data,
        prom_id: promId
      }])
      .select()
      .single()

    if (error) {
      console.error('Quote creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הצעת המחיר' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הצעת המחיר נוצרה בהצלחה'
    })

  } catch (error) {
    console.error('Quotes POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הצעת המחיר' },
      { status: 500 }
    )
  }
}

