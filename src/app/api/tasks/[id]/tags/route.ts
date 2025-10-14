import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Schema for adding tags to a task
const AddTagsSchema = z.object({
  tag_ids: z.array(z.string().uuid('מזהה תגית לא תקין'))
    .min(1, 'יש לציין לפחות תגית אחת')
})

// Schema for removing a tag from a task
const RemoveTagSchema = z.object({
  tag_id: z.string().uuid('מזהה תגית לא תקין')
})

/**
 * GET /api/tasks/[id]/tags
 * Get all tags for a specific task
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Verify task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', params.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: 'משימה לא נמצאה' },
        { status: 404 }
      )
    }

    // Get all tags for this task via junction table
    const { data, error } = await supabase
      .from('task_tags')
      .select(`
        id,
        created_at,
        tags (
          id,
          name,
          name_he,
          emoji,
          color,
          description,
          display_order
        )
      `)
      .eq('task_id', params.id)
      .order('tags(display_order)', { ascending: true })

    if (error) {
      console.error('Task tags query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת תגיות המשימה' },
        { status: 500 }
      )
    }

    // Flatten the response
    const tags = data?.map(item => ({
      ...item.tags,
      task_tag_id: item.id,
      added_at: item.created_at
    })) || []

    return NextResponse.json({
      success: true,
      data: tags,
      count: tags.length
    })

  } catch (error) {
    console.error('Task tags GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת תגיות המשימה' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks/[id]/tags
 * Add one or more tags to a task (admin only)
 * Handles duplicate prevention automatically via UNIQUE constraint
 */
export async function POST(
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
    const validation = AddTagsSchema.safeParse(body)

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

    const supabase = createClient()

    // Verify task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('id', params.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: 'משימה לא נמצאה' },
        { status: 404 }
      )
    }

    // Verify all tags exist and are active
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, name_he, is_active')
      .in('id', validation.data.tag_ids)

    if (tagsError) {
      console.error('Tags verification error:', tagsError)
      return NextResponse.json(
        { success: false, error: 'שגיאה באימות התגיות' },
        { status: 500 }
      )
    }

    if (!tags || tags.length !== validation.data.tag_ids.length) {
      return NextResponse.json(
        { success: false, error: 'אחת או יותר מהתגיות לא קיימות' },
        { status: 400 }
      )
    }

    const inactiveTags = tags.filter(t => !t.is_active)
    if (inactiveTags.length > 0) {
      return NextResponse.json(
        { success: false, error: `תגיות לא פעילות: ${inactiveTags.map(t => t.name_he).join(', ')}` },
        { status: 400 }
      )
    }

    // Insert task_tags relationships (ignore duplicates)
    const taskTags = validation.data.tag_ids.map(tag_id => ({
      task_id: params.id,
      tag_id
    }))

    const { data, error } = await supabase
      .from('task_tags')
      .upsert(taskTags, { onConflict: 'task_id,tag_id', ignoreDuplicates: true })
      .select()

    if (error) {
      console.error('Task tags insert error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בהוספת התגיות', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')
    revalidatePath(`/tasks/${params.id}`)

    return NextResponse.json({
      success: true,
      data,
      message: `${data?.length || 0} תגיות נוספו למשימה`,
      added_count: data?.length || 0
    })

  } catch (error) {
    console.error('Task tags POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהוספת תגיות למשימה' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/[id]/tags
 * Remove a specific tag from a task (admin only)
 * Requires tag_id in request body
 */
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

    const body = await req.json()
    const validation = RemoveTagSchema.safeParse(body)

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

    const supabase = createClient()

    // Delete the task_tag relationship
    const { error } = await supabase
      .from('task_tags')
      .delete()
      .eq('task_id', params.id)
      .eq('tag_id', validation.data.tag_id)

    if (error) {
      console.error('Task tag delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בהסרת התגית', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')
    revalidatePath(`/tasks/${params.id}`)

    return NextResponse.json({
      success: true,
      message: 'התגית הוסרה מהמשימה בהצלחה'
    })

  } catch (error) {
    console.error('Task tag DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהסרת התגית מהמשימה' },
      { status: 500 }
    )
  }
}
