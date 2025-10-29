/**
 * Script to verify feedback-task migration
 * Run with: npx tsx scripts/verify-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('✅ Loaded .env.local\n')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.log('SUPABASE_URL:', SUPABASE_URL ? '✓ Found' : '✗ Missing')
  console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓ Found' : '✗ Missing')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function main() {
  console.log('========================================')
  console.log('🔍 FEEDBACK-TASK MIGRATION VERIFICATION')
  console.log('========================================\n')

  let allTestsPassed = true

  // Test 1: Check anonymous_feedback.task_id column
  console.log('📋 Test 1: Verify anonymous_feedback.task_id column...')
  const { data: feedbackTaskId, error: error1 } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'anonymous_feedback')
    .eq('column_name', 'task_id')
    .maybeSingle()

  if (error1 || !feedbackTaskId) {
    console.log('❌ FAILED: task_id column not found in anonymous_feedback')
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: task_id (${feedbackTaskId.data_type}) - nullable: ${feedbackTaskId.is_nullable}`)
  }

  // Test 2: Check anonymous_feedback.status_comment column
  console.log('\n📋 Test 2: Verify anonymous_feedback.status_comment column...')
  const { data: feedbackComment, error: error2 } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'anonymous_feedback')
    .eq('column_name', 'status_comment')
    .maybeSingle()

  if (error2 || !feedbackComment) {
    console.log('❌ FAILED: status_comment column not found in anonymous_feedback')
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: status_comment (${feedbackComment.data_type}) - nullable: ${feedbackComment.is_nullable}`)
  }

  // Test 3: Check tasks.feedback_id column
  console.log('\n📋 Test 3: Verify tasks.feedback_id column...')
  const { data: taskFeedbackId, error: error3 } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'tasks')
    .eq('column_name', 'feedback_id')
    .maybeSingle()

  if (error3 || !taskFeedbackId) {
    console.log('❌ FAILED: feedback_id column not found in tasks')
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: feedback_id (${taskFeedbackId.data_type}) - nullable: ${taskFeedbackId.is_nullable}`)
  }

  // Test 4: Check idx_feedback_task_id index
  console.log('\n📋 Test 4: Verify idx_feedback_task_id index...')
  const { data: idx1, error: error4 } = await supabase
    .from('pg_indexes')
    .select('indexname, tablename')
    .eq('indexname', 'idx_feedback_task_id')
    .maybeSingle()

  if (error4 || !idx1) {
    console.log('❌ FAILED: idx_feedback_task_id index not found')
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: ${idx1.indexname} on ${idx1.tablename}`)
  }

  // Test 5: Check idx_tasks_feedback_id index
  console.log('\n📋 Test 5: Verify idx_tasks_feedback_id index...')
  const { data: idx2, error: error5 } = await supabase
    .from('pg_indexes')
    .select('indexname, tablename')
    .eq('indexname', 'idx_tasks_feedback_id')
    .maybeSingle()

  if (error5 || !idx2) {
    console.log('❌ FAILED: idx_tasks_feedback_id index not found')
    allTestsPassed = false
  } else {
    console.log(`✅ PASSED: ${idx2.indexname} on ${idx2.tablename}`)
  }

  // Test 6: Test creating feedback with new status values
  console.log('\n📋 Test 6: Test new status values (done, in_progress, other)...')

  // Test 'done' status
  const { data: testDone, error: errorDone } = await supabase
    .from('anonymous_feedback')
    .insert({
      message: 'Test done status',
      category: 'general',
      status: 'done'
    })
    .select()
    .maybeSingle()

  if (errorDone || !testDone || testDone.status !== 'done') {
    console.log('❌ FAILED: Cannot create feedback with "done" status')
    if (errorDone) console.log('   Error:', errorDone.message)
    allTestsPassed = false
  } else {
    console.log('✅ PASSED: Can create feedback with "done" status')
    await supabase.from('anonymous_feedback').delete().eq('id', testDone.id)
  }

  // Test 'in_progress' status
  const { data: testProgress, error: errorProgress } = await supabase
    .from('anonymous_feedback')
    .insert({
      message: 'Test in_progress status',
      category: 'general',
      status: 'in_progress'
    })
    .select()
    .maybeSingle()

  if (errorProgress || !testProgress || testProgress.status !== 'in_progress') {
    console.log('❌ FAILED: Cannot create feedback with "in_progress" status')
    if (errorProgress) console.log('   Error:', errorProgress.message)
    allTestsPassed = false
  } else {
    console.log('✅ PASSED: Can create feedback with "in_progress" status')
    await supabase.from('anonymous_feedback').delete().eq('id', testProgress.id)
  }

  // Test 'other' status with comment
  const { data: testOther, error: errorOther } = await supabase
    .from('anonymous_feedback')
    .insert({
      message: 'Test other status',
      category: 'general',
      status: 'other',
      status_comment: 'Custom comment'
    })
    .select()
    .maybeSingle()

  if (errorOther || !testOther || testOther.status !== 'other' || testOther.status_comment !== 'Custom comment') {
    console.log('❌ FAILED: Cannot create feedback with "other" status and comment')
    if (errorOther) console.log('   Error:', errorOther.message)
    allTestsPassed = false
  } else {
    console.log('✅ PASSED: Can create feedback with "other" status and comment')
    await supabase.from('anonymous_feedback').delete().eq('id', testOther.id)
  }

  // Test 7: Test bidirectional linking
  console.log('\n📋 Test 7: Test bidirectional linking...')

  const { data: feedback, error: fbError } = await supabase
    .from('anonymous_feedback')
    .insert({
      message: 'Test bidirectional link',
      category: 'suggestion',
      status: 'new'
    })
    .select()
    .maybeSingle()

  if (fbError || !feedback) {
    console.log('❌ FAILED: Cannot create test feedback')
    allTestsPassed = false
  } else {
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Test task from feedback',
        priority: 'normal',
        status: 'pending',
        owner_name: 'Test',
        feedback_id: feedback.id,
        follow_up_count: 0
      })
      .select()
      .maybeSingle()

    if (taskError || !task || task.feedback_id !== feedback.id) {
      console.log('❌ FAILED: Cannot create task linked to feedback')
      if (taskError) console.log('   Error:', taskError.message)
      allTestsPassed = false
    } else {
      // Update feedback with task_id
      const { error: updateError } = await supabase
        .from('anonymous_feedback')
        .update({ task_id: task.id })
        .eq('id', feedback.id)

      if (updateError) {
        console.log('❌ FAILED: Cannot update feedback with task_id')
        console.log('   Error:', updateError.message)
        allTestsPassed = false
      } else {
        // Test JOINs
        const { data: taskWithFeedback, error: joinError } = await supabase
          .from('tasks')
          .select(`
            id,
            title,
            feedback:anonymous_feedback(id, message, category)
          `)
          .eq('id', task.id)
          .maybeSingle()

        if (joinError || !taskWithFeedback?.feedback) {
          console.log('❌ FAILED: Cannot JOIN task with feedback')
          if (joinError) console.log('   Error:', joinError.message)
          allTestsPassed = false
        } else {
          console.log('✅ PASSED: Bidirectional linking works')
          console.log(`   - Task "${taskWithFeedback.title}" links to feedback`)
          console.log(`   - Feedback "${taskWithFeedback.feedback.message}" links to task`)
        }
      }

      // Cleanup
      await supabase.from('tasks').delete().eq('id', task.id)
    }
    await supabase.from('anonymous_feedback').delete().eq('id', feedback.id)
  }

  // Summary
  console.log('\n========================================')
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED')
    console.log('========================================\n')
    console.log('🎉 Migration verified successfully!')
    console.log('\n📊 Schema Summary:')
    console.log('   • anonymous_feedback.task_id → tasks(id)')
    console.log('   • anonymous_feedback.status_comment (TEXT)')
    console.log('   • tasks.feedback_id → anonymous_feedback(id)')
    console.log('   • Indexes: idx_feedback_task_id, idx_tasks_feedback_id')
    console.log('   • New statuses: done, in_progress, other')
    console.log('\n✨ You can now create tasks from feedback and view linked data!')
  } else {
    console.log('❌ SOME TESTS FAILED')
    console.log('========================================\n')
    console.log('⚠️  Please check the migration was applied correctly.')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('\n❌ Error running verification:', error)
  process.exit(1)
})
