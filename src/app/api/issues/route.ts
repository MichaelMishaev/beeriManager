import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Issue validation schema
const IssueSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().min(1, 'תיאור נדרש'),
  category: z.enum(['safety', 'maintenance', 'academic', 'social', 'financial', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  reporter_name: z.string().min(1, 'שם המדווח נדרש'),
  reporter_contact: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
  attachment_urls: z.array(z.string()).optional().default([])
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
    // Public endpoint - no authentication required for issue submission
    const body = await req.json()
    console.log('Issue submission body:', JSON.stringify(body, null, 2))

    const validation = IssueSchema.safeParse(body)

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

    // Prepare insert data - only include core fields that exist in DB schema
    const insertData = {
      title: validation.data.title,
      description: validation.data.description,
      category: validation.data.category,
      priority: validation.data.priority,
      status: validation.data.status,
      reporter_name: validation.data.reporter_name
    }

    const { data, error } = await supabase
      .from('issues')
      .insert([insertData])
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