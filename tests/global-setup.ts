import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  console.log('🚀 Starting global test setup...');

  // Set up test database
  await setupTestDatabase();

  // Create admin session for tests
  await createAdminSession(baseURL);

  console.log('✅ Global setup completed');
}

async function setupTestDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Clean up existing test data
  await supabase.from('events').delete().ilike('title', '%test%');
  await supabase.from('tasks').delete().ilike('title', '%test%');
  await supabase.from('issues').delete().ilike('title', '%test%');

  // Insert test data
  const testEvent = {
    title: 'Test Event - Automation',
    description: 'Event created for automation testing',
    start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    event_type: 'general',
    status: 'published',
    registration_enabled: true,
    max_attendees: 50,
    created_by: 'automation'
  };

  await supabase.from('events').insert([testEvent]);

  const testTask = {
    title: 'Test Task - Automation',
    description: 'Task created for automation testing',
    owner_name: 'Test Owner',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    created_by: 'automation'
  };

  await supabase.from('tasks').insert([testTask]);

  console.log('📊 Test data inserted');
}

async function createAdminSession(baseURL: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login as admin
  await page.goto(`${baseURL}/login`);

  // Wait for login form and fill password
  await page.waitForSelector('input[type="password"]');
  await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'test-password');
  await page.click('button[type="submit"]');

  // Wait for successful login redirect
  await page.waitForURL(`${baseURL}/admin`);

  // Save authentication state
  await context.storageState({ path: 'tests/auth-admin.json' });

  await browser.close();
  console.log('🔐 Admin session created');
}

export default globalSetup;