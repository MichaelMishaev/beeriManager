import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Quote update validation schema
const QuoteUpdateSchema = z.object({
  vendor_id: z.string().uuid().optional().nullable(),
  vendor_name: z.string().min(2, 'שם הספק חייב להכיל לפחות 2 תווים').optional(),
  vendor_contact_name: z.string().optional().nullable(),
  vendor_phone: z.string().optional().nullable(),
  vendor_email: z.string().email('כתובת אימייל לא תקינה').optional().nullable().or(z.literal('')),
  category: z.enum(['venue', 'catering', 'dj', 'photography', 'decorations', 'transportation', 'entertainment', 'shirts', 'sound_lighting', 'yearbook', 'recording', 'scenery', 'flowers', 'security', 'electrician', 'moving', 'video_editing', 'drums', 'choreography', 'other']).optional(),
  price_total: z.number().min(0).optional(),
  price_per_student: z.number().min(0).optional().nullable(),
  price_notes: z.string().optional().nullable(),
  services_included: z.array(z.string()).optional(),
  availability_status: z.enum(['available', 'unavailable', 'pending', 'unknown']).optional(),
  availability_date: z.string().optional().nullable(),
  availability_notes: z.string().optional().nullable(),
  pros: z.string().optional().nullable(),
  cons: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  admin_notes: z.string().optional().nullable(),
  attachment_urls: z.array(z.string()).optional(),
  is_selected: z.boolean().optional(),
  is_finalist: z.boolean().optional(),
  display_order: z.number().optional(),
  display_label: z.string().optional().nullable()
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const { quoteId } = await params
    const supabase = await createClient()

    // Check if user is admin
    const token = req.cookies.get('auth-token')
    const isAdmin = token && await verifyJWT(token.value)

    const { data, error } = await supabase
      .from('prom_vendor_quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (error) {
      console.error('Quote fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'הצעת מחיר לא נמצאה' },
        { status: 404 }
      )
    }

    // Non-admin can only see finalists
    if (!isAdmin && !data.is_finalist) {
      return NextResponse.json(
        { success: false, error: 'הצעת מחיר לא נמצאה' },
        { status: 404 }
      )
    }

    // For non-admin, hide sensitive info
    const sanitizedData = isAdmin ? data : {
      ...data,
      vendor_phone: undefined,
      vendor_email: undefined,
      admin_notes: undefined,
      vendor_name: data.display_label || `אפשרות ${data.display_order + 1}`
    }

    return NextResponse.json({
      success: true,
      data: sanitizedData
    })

  } catch (error) {
    console.error('Quote GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הצעת המחיר' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { quoteId } = await params
    const body = await req.json()

    // Clean up empty strings to null
    const cleanedBody = {
      ...body,
      vendor_id: body.vendor_id === '' ? null : body.vendor_id,
      vendor_contact_name: body.vendor_contact_name === '' ? null : body.vendor_contact_name,
      vendor_phone: body.vendor_phone === '' ? null : body.vendor_phone,
      vendor_email: body.vendor_email === '' ? null : body.vendor_email,
      price_total: body.price_total !== undefined ? parseFloat(body.price_total) : undefined,
      price_per_student: body.price_per_student !== undefined ? parseFloat(body.price_per_student) : undefined,
      price_notes: body.price_notes === '' ? null : body.price_notes,
      availability_date: body.availability_date === '' ? null : body.availability_date,
      availability_notes: body.availability_notes === '' ? null : body.availability_notes,
      pros: body.pros === '' ? null : body.pros,
      cons: body.cons === '' ? null : body.cons,
      rating: body.rating !== undefined && body.rating !== '' && body.rating !== null ? parseInt(body.rating) : null,
      admin_notes: body.admin_notes === '' ? null : body.admin_notes,
      display_label: body.display_label === '' ? null : body.display_label
    }

    const validation = QuoteUpdateSchema.safeParse(cleanedBody)

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

    // Update quote
    const { data, error } = await supabase
      .from('prom_vendor_quotes')
      .update(validation.data)
      .eq('id', quoteId)
      .select()
      .single()

    if (error) {
      console.error('Quote update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הצעת המחיר' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הצעת המחיר עודכנה בהצלחה'
    })

  } catch (error) {
    console.error('Quote PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הצעת המחיר' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    // Only admins can delete
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { quoteId } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('prom_vendor_quotes')
      .delete()
      .eq('id', quoteId)

    if (error) {
      console.error('Quote deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הצעת המחיר' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הצעת המחיר נמחקה בהצלחה'
    })

  } catch (error) {
    console.error('Quote DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הצעת המחיר' },
      { status: 500 }
    )
  }
}

