import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Task validation schema
const TaskSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  owner_name: z.string().min(2, 'שם האחראי חייב להכיל לפחות 2 תווים'),
  owner_phone: z.string().optional().nullable(),
  due_date: z.string(),
  reminder_date: z.string().optional().nullable(),
  event_id: z.string().optional().nullable(),
  parent_task_id: z.string().optional().nullable(),
  auto_remind: z.boolean().optional()
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'המשימה לא נמצאה' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Task GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת המשימה' },
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

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Task update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון המשימה' },
        { status: 500 }
      )
    }

    // If task is marked as completed, update follow_up_count
    if (validation.data.status === 'completed') {
      await supabase
        .from('tasks')
        .update({
          follow_up_count: 0,
          completed_at: new Date().toISOString()
        })
        .eq('id', params.id)
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'המשימה עודכנה בהצלחה'
    })

  } catch (error) {
    console.error('Task PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון המשימה' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const supabase = createClient()

    // Soft delete - mark as archived
    const { error } = await supabase
      .from('tasks')
      .update({
        archived_at: new Date().toISOString(),
        status: 'cancelled'
      })
      .eq('id', params.id)

    if (error) {
      console.error('Task delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת המשימה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'המשימה נמחקה בהצלחה'
    })

  } catch (error) {
    console.error('Task DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת המשימה' },
      { status: 500 }
    )
  }
}