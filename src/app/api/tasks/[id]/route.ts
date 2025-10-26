import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createErrorResponse, createSuccessResponse, zodErrorsToHebrew } from '@/lib/utils/api-errors'

// Task validation schema
const TaskSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  owner_name: z.string().min(2, 'שם האחראי חייב להכיל לפחות 2 תווים'),
  owner_phone: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(), // Optional date string format
  reminder_date: z.string().optional().nullable(),
  event_id: z.string().optional().nullable(),
  parent_task_id: z.string().optional().nullable(),
  auto_remind: z.boolean().optional(),
  completion_comment: z.string().optional().nullable() // Optional comment when completing/cancelling task
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
        createErrorResponse('המשימה לא נמצאה. ייתכן שהיא נמחקה', {
          code: 'TASK_NOT_FOUND',
          action: {
            label: 'חזור לרשימה',
            href: '/tasks'
          }
        }),
        { status: 404 }
      )
    }

    return NextResponse.json(createSuccessResponse(data))

  } catch (error) {
    console.error('Task GET error:', error)
    return NextResponse.json(
      createErrorResponse('שגיאה בטעינת המשימה. נסה לרענן את הדף', {
        code: 'INTERNAL_ERROR',
        action: {
          label: 'נסה שוב',
          onClick: 'reload'
        }
      }),
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
        createErrorResponse('אין הרשאה. נדרשת התחברות מחדש', {
          code: 'UNAUTHORIZED',
          action: {
            label: 'התחבר',
            href: '/login'
          }
        }),
        { status: 401 }
      )
    }

    const body = await req.json()
    // Support partial updates - only validate fields that are provided
    const validation = TaskSchema.partial().safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('אנא תקן את השדות המסומנים באדום', {
          code: 'VALIDATION_ERROR',
          fieldErrors: zodErrorsToHebrew(validation.error)
        }),
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
        createErrorResponse('שגיאה בעדכון המשימה. נסה שוב', {
          code: 'UPDATE_FAILED',
          action: {
            label: 'נסה שוב',
            onClick: 'retry'
          }
        }),
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

    // Revalidate tasks page to show updated task immediately
    revalidatePath('/tasks')
    revalidatePath('/he/tasks')
    revalidatePath('/en/tasks')
    revalidatePath('/ru/tasks')
    revalidatePath(`/tasks/${params.id}`)
    revalidatePath(`/he/tasks/${params.id}`)
    revalidatePath(`/en/tasks/${params.id}`)
    revalidatePath(`/ru/tasks/${params.id}`)

    return NextResponse.json(createSuccessResponse(data, 'המשימה עודכנה בהצלחה'))

  } catch (error) {
    console.error('Task PUT error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        createErrorResponse('נתונים שגויים נשלחו לשרת', {
          code: 'INVALID_JSON'
        }),
        { status: 400 }
      )
    }

    return NextResponse.json(
      createErrorResponse('שגיאת שרת פנימית. נסה שוב בעוד רגע', {
        code: 'INTERNAL_ERROR',
        action: {
          label: 'נסה שוב',
          onClick: 'retry'
        }
      }),
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