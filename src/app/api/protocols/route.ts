import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Protocol validation schema
const ProtocolSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  meeting_date: z.string().min(1, 'תאריך ישיבה נדרש'),
  protocol_type: z.enum(['regular', 'special', 'annual', 'emergency']),
  attendees: z.array(z.string()).min(1, 'חייב להיות לפחות משתתף אחד'),
  agenda: z.string().optional().default(''),
  decisions: z.string().optional().default(''),
  action_items: z.string().optional().default(''),
  document_url: z.string().optional().default(''),
  attachment_urls: z.array(z.string()).optional().default([]),
  is_public: z.boolean().default(true),
  approved: z.boolean().optional().default(false),
  extracted_text: z.string().optional().default('')
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
    console.log('Received protocol data:', JSON.stringify(body, null, 2))

    const validation = ProtocolSchema.safeParse(body)

    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors)
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

    // Use columns that exist in DB (verified by check-protocols-schema.ts)
    const attendeesList = validation.data.attendees.join(', ')
    const fullExtractedText = `<!-- ATTENDEES: ${attendeesList} -->\n${validation.data.extracted_text}`

    // Extract year from meeting_date
    const year = new Date(validation.data.meeting_date).getFullYear()

    const protocolData = {
      title: validation.data.title,
      protocol_date: validation.data.meeting_date,
      year: year, // Required NOT NULL field
      categories: [validation.data.protocol_type], // Map protocol_type to categories array
      is_public: validation.data.is_public,
      extracted_text: fullExtractedText,
      agenda: validation.data.agenda || '',
      decisions: validation.data.decisions || '',
      action_items: validation.data.action_items || '',
      document_url: validation.data.document_url || '',
      attachment_urls: validation.data.attachment_urls || [],
      approved: validation.data.approved || false,
      created_by: 'admin'
    }

    console.log('Inserting protocol data:', JSON.stringify(protocolData, null, 2))

    // Create protocol
    const { data, error } = await supabase
      .from('protocols')
      .insert([protocolData])
      .select()
      .single()

    if (error) {
      console.error('Protocol creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הפרוטוקול' },
        { status: 500 }
      )
    }

    // Revalidate the protocols page to show the new protocol immediately
    revalidatePath('/protocols')
    revalidatePath('/he/protocols')
    revalidatePath('/ru/protocols')

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