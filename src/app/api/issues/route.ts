import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Issue validation schema
const IssueSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים'),
  category: z.enum(['safety', 'maintenance', 'academic', 'social', 'financial', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  reporter_name: z.string().min(2, 'שם המדווח חייב להכיל לפחות 2 תווים'),
  reporter_contact: z.string().optional(),
  assigned_to: z.string().optional(),
  resolution: z.string().optional(),
  attachment_urls: z.array(z.string().url()).optional()
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('issues')
      .select('*')

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Order by priority and created date
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Issues query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הבעיות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Issues GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הבעיות' },
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
    const validation = IssueSchema.safeParse(body)

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

    // Create issue
    const { data, error } = await supabase
      .from('issues')
      .insert([{
        ...validation.data,
        reported_by: 'admin', // In a full system, this would come from JWT
        attachment_urls: validation.data.attachment_urls || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Issue creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הבעיה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הבעיה נוצרה בהצלחה'
    })

  } catch (error) {
    console.error('Issues POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הבעיה' },
      { status: 500 }
    )
  }
}