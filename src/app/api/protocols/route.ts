import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Protocol validation schema
const ProtocolSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  protocol_date: z.string(),
  protocol_type: z.enum(['regular', 'special', 'annual', 'emergency']),
  attendees: z.array(z.string()).min(1, 'חייב להיות לפחות משתתף אחד'),
  agenda: z.string().optional(),
  decisions: z.string().optional(),
  action_items: z.string().optional(),
  document_url: z.string().url().nullable().or(z.literal('')).optional(),
  attachment_urls: z.array(z.string().url()).optional().default([]),
  is_public: z.boolean().default(true),
  approved: z.boolean().default(false)
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const type = searchParams.get('type')
    const approved = searchParams.get('approved')
    const year = searchParams.get('year')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('protocols')
      .select('*')

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('protocol_type', type)
    }

    if (approved === 'true') {
      query = query.eq('approved', true)
    } else if (approved === 'false') {
      query = query.eq('approved', false)
    }

    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query
        .gte('protocol_date', startDate)
        .lte('protocol_date', endDate)
    }

    // Only show public protocols for non-admins
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      query = query.eq('is_public', true)
    }

    // Order by protocol date
    query = query
      .order('protocol_date', { ascending: false })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Protocols query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הפרוטוקולים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Protocols GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הפרוטוקולים' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = ProtocolSchema.safeParse(body)

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

    // Create protocol
    const { data, error } = await supabase
      .from('protocols')
      .insert([{
        ...validation.data,
        created_by: 'admin', // In a full system, this would come from JWT
        attachment_urls: validation.data.attachment_urls || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Protocol creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הפרוטוקול' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הפרוטוקול נוצר בהצלחה'
    })

  } catch (error) {
    console.error('Protocols POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הפרוטוקול' },
      { status: 500 }
    )
  }
}