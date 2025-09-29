import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Feedback validation schema
const FeedbackSchema = z.object({
  category: z.enum(['general', 'event', 'task', 'suggestion', 'complaint', 'other']),
  subject: z.string().min(2, 'נושא חייב להכיל לפחות 2 תווים').max(100),
  message: z.string().min(10, 'הודעה חייבת להכיל לפחות 10 תווים').max(1000),
  rating: z.number().min(1).max(5).optional(),
  parent_name: z.string().optional(), // Optional for anonymous feedback
  contact_email: z.string().email('כתובת אימייל לא תקינה').optional(),
  is_anonymous: z.boolean().default(true)
})

export async function GET(req: NextRequest) {
  try {
    // Only admins can view feedback
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const rating = searchParams.get('rating')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('feedback')
      .select('*')

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (rating) {
      query = query.eq('rating', parseInt(rating))
    }

    // Order by created date
    query = query
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Feedback query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת המשובים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Feedback GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת המשובים' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Anyone can submit feedback (no auth required for anonymous feedback)
    const body = await req.json()
    const validation = FeedbackSchema.safeParse(body)

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

    // If not anonymous, remove identifying info
    const feedbackData = {
      ...validation.data,
      parent_name: validation.data.is_anonymous ? null : validation.data.parent_name,
      contact_email: validation.data.is_anonymous ? null : validation.data.contact_email,
      status: 'new' as const,
      response: null,
      responded_at: null
    }

    // Create feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single()

    if (error) {
      console.error('Feedback creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בשליחת המשוב' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        created_at: data.created_at
      },
      message: 'המשוב נשלח בהצלחה. תודה על השיתוף!'
    })

  } catch (error) {
    console.error('Feedback POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בשליחת המשוב' },
      { status: 500 }
    )
  }
}