import { FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');

  // Clean up test database
  await cleanupTestDatabase();

  // Remove auth files
  if (fs.existsSync('tests/auth-admin.json')) {
    fs.unlinkSync('tests/auth-admin.json');
  }

  console.log('✅ Global teardown completed');
}

async function cleanupTestDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete all test data
  await supabase.from('event_registrations').delete().eq('registrant_name', 'Test User');
  await supabase.from('events').delete().ilike('title', '%test%');
  await supabase.from('tasks').delete().ilike('title', '%test%');
  await supabase.from('issues').delete().ilike('title', '%test%');
  await supabase.from('anonymous_feedback').delete().ilike('message', '%test%');

  console.log('🗑️ Test data cleaned up');
}

export default globalTeardown;