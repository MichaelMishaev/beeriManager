import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Feedback validation schema - matches complaint form fields
const FeedbackSchema = z.object({
  category: z.enum(['general', 'event', 'task', 'suggestion', 'complaint', 'other']),
  subject: z.string().min(2, 'נושא חייב להכיל לפחות 2 תווים').max(100),
  message: z.string().min(1, 'הודעה נדרשת'),
  parent_name: z.string().optional().nullable(),
  contact_email: z.string().optional().nullable(), // Can be email or phone
  is_anonymous: z.boolean().default(true)
})

export async function GET(req: NextRequest) {
  try {
    // Only admins can view feedback
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('anonymous_feedback')
      .select(`
        *,
        task:task_id(id, title, status, owner_name, due_date)
      `)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
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
    console.log('Feedback submission body:', JSON.stringify(body, null, 2))

    const validation = FeedbackSchema.safeParse(body)

    if (!validation.success) {
      console.error('Feedback validation errors:', validation.error.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    console.log('Feedback validation passed:', validation.data)

    const supabase = await createClient()

    // Prepare message combining subject and detailed message
    const fullMessage = validation.data.subject +
      (validation.data.message && validation.data.message !== validation.data.subject
        ? '\n\n' + validation.data.message
        : '')

    // Store contact info in admin_notes as JSON if provided
    const contactInfo = (validation.data.parent_name || validation.data.contact_email) ? {
      parent_name: validation.data.parent_name || null,
      contact: validation.data.contact_email || null
    } : null

    // Map to actual database columns
    const feedbackData: any = {
      message: fullMessage,
      category: validation.data.category || 'complaint',
    }

    if (contactInfo) {
      feedbackData.admin_notes = JSON.stringify(contactInfo)
    }

    console.log('Inserting feedback data:', JSON.stringify(feedbackData, null, 2))

    // Create feedback
    const { data, error } = await supabase
      .from('anonymous_feedback')
      .insert([feedbackData])
      .select()
      .single()

    if (error) {
      console.error('Feedback creation error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { success: false, error: 'שגיאה בשליחת המשוב', details: error.message },
        { status: 500 }
      )
    }

    console.log('Feedback created successfully:', data)

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

export async function DELETE(req: NextRequest) {
  try {
    // Only admins can delete feedback
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Delete all feedback
    const { error } = await supabase
      .from('anonymous_feedback')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (error) {
      console.error('Feedback deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת המשובים' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'כל המשובים נמחקו בהצלחה'
    })

  } catch (error) {
    console.error('Feedback DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת המשובים' },
      { status: 500 }
    )
  }
}