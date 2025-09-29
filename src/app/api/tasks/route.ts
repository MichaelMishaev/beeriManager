import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Task validation schema
const TaskSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  owner_name: z.string().min(2, 'שם האחראי חייב להכיל לפחות 2 תווים'),
  owner_phone: z.string().optional().nullable(),
  due_date: z.string(), // Accept date string format
  reminder_date: z.string().optional().nullable(),
  event_id: z.string().optional().nullable(),
  parent_task_id: z.string().optional().nullable(),
  auto_remind: z.boolean().optional(),
  attachment_urls: z.array(z.string().url()).optional()
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const owner = searchParams.get('owner')
    const category = searchParams.get('category')
    const overdue = searchParams.get('overdue') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('tasks')
      .select('*')

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    if (owner) {
      query = query.ilike('owner_name', `%${owner}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (overdue) {
      query = query
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .lt('due_date', new Date().toISOString())
    }

    // Order by priority and due date
    query = query
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Tasks query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת המשימות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Tasks GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת המשימות' },
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
    const validation = TaskSchema.safeParse(body)

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

    // Create task
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...validation.data,
        assigned_by: 'admin', // In a full system, this would come from JWT
        follow_up_count: 0,
        attachment_urls: validation.data.attachment_urls || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Task creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת המשימה' },
        { status: 500 }
      )
    }

    // TODO: Send notification to task owner (implement later)

    return NextResponse.json({
      success: true,
      data,
      message: 'המשימה נוצרה בהצלחה'
    })

  } catch (error) {
    console.error('Tasks POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת המשימה' },
      { status: 500 }
    )
  }
}