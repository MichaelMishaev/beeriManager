import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Schema for bulk adding tags
const BulkAddTagsSchema = z.object({
  task_ids: z.array(z.string().uuid('מזהה משימה לא תקין'))
    .min(1, 'יש לציין לפחות משימה אחת'),
  tag_ids: z.array(z.string().uuid('מזהה תגית לא תקין'))
    .min(1, 'יש לציין לפחות תגית אחת')
})

// Schema for bulk removing tags
const BulkRemoveTagsSchema = z.object({
  task_ids: z.array(z.string().uuid('מזהה משימה לא תקין'))
    .min(1, 'יש לציין לפחות משימה אחת'),
  tag_ids: z.array(z.string().uuid('מזהה תגית לא תקין'))
    .min(1, 'יש לציין לפחות תגית אחת')
})

/**
 * POST /api/tasks/bulk/tags
 * Add tags to multiple tasks (admin only)
 * Creates all possible task_id + tag_id combinations
 */
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
    const validation = BulkAddTagsSchema.safeParse(body)

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

    // Verify all tasks exist
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id')
      .in('id', validation.data.task_ids)

    if (tasksError) {
      console.error('Tasks verification error:', tasksError)
      return NextResponse.json(
        { success: false, error: 'שגיאה באימות המשימות' },
        { status: 500 }
      )
    }

    if (!tasks || tasks.length !== validation.data.task_ids.length) {
      return NextResponse.json(
        { success: false, error: 'אחת או יותר מהמשימות לא קיימות' },
        { status: 400 }
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

    // Create all combinations of task_id + tag_id
    const taskTags = []
    for (const task_id of validation.data.task_ids) {
      for (const tag_id of validation.data.tag_ids) {
        taskTags.push({ task_id, tag_id })
      }
    }

    // Insert all combinations (ignore duplicates)
    const { data, error } = await supabase
      .from('task_tags')
      .upsert(taskTags, { onConflict: 'task_id,tag_id', ignoreDuplicates: true })
      .select()

    if (error) {
      console.error('Bulk task tags insert error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בהוספת תגיות', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')

    const addedCount = data?.length || 0
    const totalAttempted = taskTags.length
    const skippedDuplicates = totalAttempted - addedCount

    return NextResponse.json({
      success: true,
      data: {
        added_count: addedCount,
        skipped_duplicates: skippedDuplicates,
        task_count: validation.data.task_ids.length,
        tag_count: validation.data.tag_ids.length
      },
      message: `נוספו ${addedCount} קשרי תגית-משימה${skippedDuplicates > 0 ? ` (${skippedDuplicates} כבר היו קיימים)` : ''}`
    })

  } catch (error) {
    console.error('Bulk task tags POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהוספת תגיות למשימות' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/bulk/tags
 * Remove tags from multiple tasks (admin only)
 * Removes all specified task_id + tag_id combinations
 */
export async function DELETE(req: NextRequest) {
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
    const validation = BulkRemoveTagsSchema.safeParse(body)

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

    // Delete all combinations of task_id + tag_id
    // We need to delete them one by one or use a more complex query
    let deletedCount = 0

    for (const task_id of validation.data.task_ids) {
      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', task_id)
        .in('tag_id', validation.data.tag_ids)

      if (!error) {
        deletedCount++
      } else {
        console.error(`Error removing tags from task ${task_id}:`, error)
      }
    }

    // Revalidate pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')

    return NextResponse.json({
      success: true,
      data: {
        tasks_updated: deletedCount,
        task_count: validation.data.task_ids.length,
        tag_count: validation.data.tag_ids.length
      },
      message: `תגיות הוסרו מ-${deletedCount} משימות`
    })

  } catch (error) {
    console.error('Bulk task tags DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהסרת תגיות מהמשימות' },
      { status: 500 }
    )
  }
}
