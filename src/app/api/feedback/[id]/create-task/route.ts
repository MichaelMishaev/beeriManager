import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Schema for creating task from feedback
const CreateTaskFromFeedbackSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  owner_name: z.string().min(2, 'שם האחראי חייב להכיל לפחות 2 תווים'),
  owner_phone: z.string().optional().nullable(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  due_date: z.string().optional().nullable()
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can create tasks
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = CreateTaskFromFeedbackSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First, get the feedback to use its message as task description
    const { data: feedback, error: feedbackError } = await supabase
      .from('anonymous_feedback')
      .select('*')
      .eq('id', params.id)
      .single()

    if (feedbackError || !feedback) {
      return NextResponse.json(
        { success: false, error: 'משוב לא נמצא' },
        { status: 404 }
      )
    }

    // Check if task already exists for this feedback
    if (feedback.task_id) {
      return NextResponse.json(
        { success: false, error: 'כבר קיימת משימה עבור משוב זה' },
        { status: 400 }
      )
    }

    // Create task with feedback message as description
    // Convert empty strings to null for date fields
    const dueDate = validation.data.due_date && validation.data.due_date.trim() !== ''
      ? validation.data.due_date
      : null

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([{
        title: validation.data.title,
        description: `${feedback.message}\n\n---\nנוצר ממשוב הורים (${feedback.category})`,
        priority: validation.data.priority,
        status: 'pending',
        owner_name: validation.data.owner_name,
        owner_phone: validation.data.owner_phone || null,
        due_date: dueDate,
        feedback_id: params.id, // Link task back to feedback
        follow_up_count: 0,
        attachment_urls: []
      }])
      .select()
      .single()

    if (taskError) {
      console.error('Task creation error:', taskError)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת המשימה' },
        { status: 500 }
      )
    }

    // Update feedback with task_id and set status to 'in_progress'
    const { error: updateError } = await supabase
      .from('anonymous_feedback')
      .update({
        task_id: task.id,
        status: 'in_progress'
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Feedback update error:', updateError)
      // Task was created, so we don't fail the request
      // Just log the error
    }

    // Revalidate pages
    revalidatePath('/tasks')
    revalidatePath('/admin/feedback')

    return NextResponse.json({
      success: true,
      data: task,
      message: 'המשימה נוצרה בהצלחה והקושרה למשוב'
    })

  } catch (error) {
    console.error('Create task from feedback error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת המשימה' },
      { status: 500 }
    )
  }
}
