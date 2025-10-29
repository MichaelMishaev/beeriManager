import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

test.describe('Feedback-Task Migration Verification', () => {
  let supabase: ReturnType<typeof createClient>

  test.beforeAll(() => {
    // Create Supabase admin client
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  })

  test('should verify anonymous_feedback table has task_id column', async () => {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'anonymous_feedback')
      .eq('column_name', 'task_id')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data.column_name).toBe('task_id')
    expect(data.data_type).toBe('uuid')
    expect(data.is_nullable).toBe('YES')

    console.log('✅ anonymous_feedback.task_id column exists:', data)
  })

  test('should verify anonymous_feedback table has status_comment column', async () => {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'anonymous_feedback')
      .eq('column_name', 'status_comment')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data.column_name).toBe('status_comment')
    expect(data.data_type).toBe('text')
    expect(data.is_nullable).toBe('YES')

    console.log('✅ anonymous_feedback.status_comment column exists:', data)
  })

  test('should verify tasks table has feedback_id column', async () => {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'tasks')
      .eq('column_name', 'feedback_id')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data.column_name).toBe('feedback_id')
    expect(data.data_type).toBe('uuid')
    expect(data.is_nullable).toBe('YES')

    console.log('✅ tasks.feedback_id column exists:', data)
  })

  test('should verify status constraint allows new status values', async () => {
    const { data, error } = await supabase
      .from('information_schema.check_constraints')
      .select('*')
      .eq('constraint_name', 'anonymous_feedback_status_check')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data.check_clause).toContain('done')
    expect(data.check_clause).toContain('in_progress')
    expect(data.check_clause).toContain('other')

    console.log('✅ Status constraint updated with new values')
  })

  test('should verify idx_feedback_task_id index exists', async () => {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .eq('indexname', 'idx_feedback_task_id')
      .eq('tablename', 'anonymous_feedback')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data.indexname).toBe('idx_feedback_task_id')

    console.log('✅ Index idx_feedback_task_id exists on anonymous_feedback')
  })

  test('should verify idx_tasks_feedback_id index exists', async () => {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .eq('indexname', 'idx_tasks_feedback_id')
      .eq('tablename', 'tasks')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data.indexname).toBe('idx_tasks_feedback_id')

    console.log('✅ Index idx_tasks_feedback_id exists on tasks')
  })

  test('should test creating feedback with new status values', async () => {
    // Test 'done' status
    const { data: feedbackDone, error: errorDone } = await supabase
      .from('anonymous_feedback')
      .insert({
        message: 'Test feedback - done status',
        category: 'general',
        status: 'done'
      })
      .select()
      .single()

    expect(errorDone).toBeNull()
    expect(feedbackDone).toBeTruthy()
    expect(feedbackDone.status).toBe('done')
    console.log('✅ Can create feedback with "done" status')

    // Test 'in_progress' status
    const { data: feedbackInProgress, error: errorInProgress } = await supabase
      .from('anonymous_feedback')
      .insert({
        message: 'Test feedback - in_progress status',
        category: 'general',
        status: 'in_progress'
      })
      .select()
      .single()

    expect(errorInProgress).toBeNull()
    expect(feedbackInProgress).toBeTruthy()
    expect(feedbackInProgress.status).toBe('in_progress')
    console.log('✅ Can create feedback with "in_progress" status')

    // Test 'other' status with comment
    const { data: feedbackOther, error: errorOther } = await supabase
      .from('anonymous_feedback')
      .insert({
        message: 'Test feedback - other status',
        category: 'general',
        status: 'other',
        status_comment: 'Custom status comment'
      })
      .select()
      .single()

    expect(errorOther).toBeNull()
    expect(feedbackOther).toBeTruthy()
    expect(feedbackOther.status).toBe('other')
    expect(feedbackOther.status_comment).toBe('Custom status comment')
    console.log('✅ Can create feedback with "other" status and comment')

    // Cleanup
    await supabase
      .from('anonymous_feedback')
      .delete()
      .in('id', [feedbackDone.id, feedbackInProgress.id, feedbackOther.id])
  })

  test('should test bidirectional linking between feedback and task', async () => {
    // 1. Create a feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('anonymous_feedback')
      .insert({
        message: 'Test feedback for task linking',
        category: 'suggestion',
        status: 'new'
      })
      .select()
      .single()

    expect(feedbackError).toBeNull()
    expect(feedback).toBeTruthy()
    console.log('✅ Created test feedback:', feedback.id)

    // 2. Create a task linked to the feedback
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Test task from feedback',
        description: 'Test task description',
        priority: 'normal',
        status: 'pending',
        owner_name: 'Test Owner',
        feedback_id: feedback.id,
        follow_up_count: 0
      })
      .select()
      .single()

    expect(taskError).toBeNull()
    expect(task).toBeTruthy()
    expect(task.feedback_id).toBe(feedback.id)
    console.log('✅ Created task linked to feedback:', task.id)

    // 3. Update feedback with task_id
    const { data: updatedFeedback, error: updateError } = await supabase
      .from('anonymous_feedback')
      .update({ task_id: task.id, status: 'in_progress' })
      .eq('id', feedback.id)
      .select()
      .single()

    expect(updateError).toBeNull()
    expect(updatedFeedback.task_id).toBe(task.id)
    expect(updatedFeedback.status).toBe('in_progress')
    console.log('✅ Updated feedback with task_id')

    // 4. Fetch task with feedback data (test JOIN)
    const { data: taskWithFeedback, error: joinError } = await supabase
      .from('tasks')
      .select(`
        *,
        feedback:anonymous_feedback(id, message, category, created_at)
      `)
      .eq('id', task.id)
      .single()

    expect(joinError).toBeNull()
    expect(taskWithFeedback).toBeTruthy()
    expect(taskWithFeedback.feedback).toBeTruthy()
    expect(taskWithFeedback.feedback.id).toBe(feedback.id)
    expect(taskWithFeedback.feedback.message).toBe('Test feedback for task linking')
    console.log('✅ Successfully fetched task with linked feedback data')

    // 5. Fetch feedback with task data (test reverse JOIN)
    const { data: feedbackWithTask, error: reverseJoinError } = await supabase
      .from('anonymous_feedback')
      .select(`
        *,
        task:tasks(id, title, status, owner_name)
      `)
      .eq('id', feedback.id)
      .single()

    expect(reverseJoinError).toBeNull()
    expect(feedbackWithTask).toBeTruthy()
    expect(feedbackWithTask.task).toBeTruthy()
    expect(feedbackWithTask.task.id).toBe(task.id)
    expect(feedbackWithTask.task.title).toBe('Test task from feedback')
    console.log('✅ Successfully fetched feedback with linked task data')

    // 6. Cleanup
    await supabase.from('tasks').delete().eq('id', task.id)
    await supabase.from('anonymous_feedback').delete().eq('id', feedback.id)
    console.log('✅ Cleaned up test data')
  })

  test('should verify foreign key constraints work correctly', async () => {
    // Create feedback and task
    const { data: feedback } = await supabase
      .from('anonymous_feedback')
      .insert({
        message: 'Test FK constraint',
        category: 'general',
        status: 'new'
      })
      .select()
      .single()

    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Test FK task',
        priority: 'normal',
        status: 'pending',
        owner_name: 'Test',
        feedback_id: feedback.id,
        follow_up_count: 0
      })
      .select()
      .single()

    // Update feedback with task_id
    await supabase
      .from('anonymous_feedback')
      .update({ task_id: task.id })
      .eq('id', feedback.id)

    // Delete task - feedback.task_id should be set to NULL (ON DELETE SET NULL)
    await supabase.from('tasks').delete().eq('id', task.id)

    // Check feedback.task_id is now null
    const { data: updatedFeedback } = await supabase
      .from('anonymous_feedback')
      .select('task_id')
      .eq('id', feedback.id)
      .single()

    expect(updatedFeedback.task_id).toBeNull()
    console.log('✅ Foreign key ON DELETE SET NULL works correctly')

    // Cleanup
    await supabase.from('anonymous_feedback').delete().eq('id', feedback.id)
  })

  test('should print migration summary', async () => {
    console.log('\n========================================')
    console.log('📊 MIGRATION VERIFICATION SUMMARY')
    console.log('========================================\n')

    // Get all new columns
    const { data: feedbackColumns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'anonymous_feedback')
      .in('column_name', ['task_id', 'status_comment'])

    const { data: taskColumns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'tasks')
      .eq('column_name', 'feedback_id')

    console.log('📋 anonymous_feedback table:')
    feedbackColumns?.forEach(col => {
      console.log(`   ✓ ${col.column_name} (${col.data_type})`)
    })

    console.log('\n📋 tasks table:')
    taskColumns?.forEach(col => {
      console.log(`   ✓ ${col.column_name} (${col.data_type})`)
    })

    // Get indexes
    const { data: indexes } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .in('indexname', ['idx_feedback_task_id', 'idx_tasks_feedback_id'])

    console.log('\n🔍 Indexes:')
    indexes?.forEach(idx => {
      console.log(`   ✓ ${idx.indexname} on ${idx.tablename}`)
    })

    console.log('\n✅ All migrations applied successfully!')
    console.log('========================================\n')
  })
})
