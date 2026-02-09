import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Vendor validation schema
const VendorSchema = z.object({
  name: z.string().min(2, 'שם הספק חייב להכיל לפחות 2 תווים'),
  description: z.string().optional().nullable(),
  category: z.enum(['catering', 'equipment', 'entertainment', 'transportation', 'venue', 'photography', 'printing', 'other']),
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
  status: z.enum(['active', 'inactive']).default('active')
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    let query = supabase
      .from('vendors')
      .select('*')

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,contact_person.ilike.%${search}%`)
    }

    // Order by name
    query = query
      .order('name', { ascending: true })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Vendors query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הספקים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Vendors GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הספקים' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

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

    const validation = VendorSchema.safeParse(cleanedBody)

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

    // Create vendor
    const { data, error } = await supabase
      .from('vendors')
      .insert([{
        ...validation.data,
        overall_rating: 0,
        total_reviews: 0,
        services_offered: [],
        tags: []
      }])
      .select()
      .single()

    if (error) {
      console.error('Vendor creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הספק' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הספק נוצר בהצלחה'
    })

  } catch (error) {
    console.error('Vendors POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הספק' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Only admins can delete vendors
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Delete all vendors
    const { data: allVendors, error: fetchError } = await supabase
      .from('vendors')
      .select('id')

    if (fetchError) {
      console.error('Vendors fetch error:', fetchError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הספקים' },
        { status: 500 }
      )
    }

    if (!allVendors || allVendors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'אין ספקים למחיקה'
      })
    }

    // Bulk delete all vendors at once (row-level triggers still fire per row)
    const vendorIds = allVendors.map(v => v.id)
    const { error: deleteError } = await supabase
      .from('vendors')
      .delete()
      .in('id', vendorIds)

    if (deleteError) {
      console.error('Bulk delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הספקים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${vendorIds.length} ספקים נמחקו בהצלחה`
    })

  } catch (error) {
    console.error('Vendors DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הספקים' },
      { status: 500 }
    )
  }
}
