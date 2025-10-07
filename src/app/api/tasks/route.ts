import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Task validation schema
const TaskSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  owner_name: z.string().min(2, 'שם האחראי חייב להכיל לפחות 2 תווים'),
  owner_phone: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(), // Optional date string format
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

    // Order by priority and due date (nulls last)
    query = query
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
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
    console.log('Auth token present:', !!token)

    if (!token || !verifyJWT(token.value)) {
      console.log('Auth failed - token:', !!token)
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('Received task data:', JSON.stringify(body, null, 2))

    const validation = TaskSchema.safeParse(body)

    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }

    console.log('Validation passed, creating task...')
    const supabase = createClient()

    // Create task
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...validation.data,
        follow_up_count: 0,
        attachment_urls: validation.data.attachment_urls || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Task creation error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת המשימה', details: error.message },
        { status: 500 }
      )
    }

    console.log('Task created successfully:', data?.id)

    // Revalidate tasks page to show new task immediately
    revalidatePath('/tasks')
    revalidatePath('/he/tasks')
    revalidatePath('/en/tasks')
    revalidatePath('/ru/tasks')

    // TODO: Send notification to task owner (implement later)

    return NextResponse.json({
      success: true,
      data,
      message: 'המשימה נוצרה בהצלחה'
    })

  } catch (error) {
    console.error('Tasks POST error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error')
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת המשימה', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Only admins can delete tasks
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Delete all tasks one by one to work with audit triggers
    const { data: allTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id')

    if (fetchError) {
      console.error('Tasks fetch error:', fetchError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת המשימות' },
        { status: 500 }
      )
    }

    if (!allTasks || allTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'אין משימות למחיקה'
      })
    }

    // Delete each task individually to satisfy audit trigger
    let deletedCount = 0
    for (const task of allTasks) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

      if (!error) {
        deletedCount++
      } else {
        console.error('Error deleting task:', task.id, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount} משימות נמחקו בהצלחה`
    })

  } catch (error) {
    console.error('Tasks DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת המשימות' },
      { status: 500 }
    )
  }
}