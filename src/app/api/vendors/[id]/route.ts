import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Vendor validation schema (same as main route but for updates)
const VendorUpdateSchema = z.object({
  name: z.string().min(2, 'שם הספק חייב להכיל לפחות 2 תווים').optional(),
  description: z.string().optional().nullable(),
  category: z.enum(['catering', 'equipment', 'entertainment', 'transportation', 'venue', 'photography', 'printing', 'other']).optional(),
  contact_person: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('כתובת אימייל לא תקינה').optional().nullable().or(z.literal('')),
  website: z.string().url('כתובת אתר לא תקינה').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  business_number: z.string().optional().nullable(),
  license_number: z.string().optional().nullable(),
  price_range: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional()
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Vendor fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'ספק לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Vendor GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הספק' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { id } = params
    const body = await req.json()

    // Clean up empty strings to null
    const cleanedBody = {
      ...body,
      email: body.email === '' ? null : body.email,
      website: body.website === '' ? null : body.website,
      contact_person: body.contact_person === '' ? null : body.contact_person,
      phone: body.phone === '' ? null : body.phone,
      address: body.address === '' ? null : body.address,
      business_number: body.business_number === '' ? null : body.business_number,
      license_number: body.license_number === '' ? null : body.license_number,
      price_range: body.price_range === '' ? null : body.price_range,
      payment_terms: body.payment_terms === '' ? null : body.payment_terms,
      notes: body.notes === '' ? null : body.notes
    }

    const validation = VendorUpdateSchema.safeParse(cleanedBody)

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

    const supabase = createClient()

    // Update vendor
    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Vendor update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הספק' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הספק עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Vendor PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הספק' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can delete vendors
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id } = params
    const supabase = createClient()

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Vendor deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הספק' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הספק נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Vendor DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הספק' },
      { status: 500 }
    )
  }
}
