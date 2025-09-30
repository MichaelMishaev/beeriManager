import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

// Helper to generate unique test names with timestamps
function generateUniqueTestName(prefix: string): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

test.describe('Admin Dashboard - Create Entities from Cards', () => {
  let testData: {
    eventTitle: string;
    taskTitle: string;
    committeeTitle: string;
    issueTitle: string;
    protocolTitle: string;
    expenseTitle: string;
  };

  test.beforeAll(() => {
    // Generate unique test data for this test run
    testData = {
      eventTitle: generateUniqueTestName('אירוע בדיקה'),
      taskTitle: generateUniqueTestName('משימה בדיקה'),
      committeeTitle: generateUniqueTestName('וועדת בדיקה'),
      issueTitle: generateUniqueTestName('בעיה בדיקה'),
      protocolTitle: generateUniqueTestName('פרוטוקול בדיקה'),
      expenseTitle: generateUniqueTestName('הוצאה בדיקה')
    };
  });

  test.beforeEach(async ({ page }) => {
    // Login as admin
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    // Navigate to admin dashboard
    await page.goto('http://localhost:4500/admin');

    // Wait for the page to load
    await page.waitForSelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3', { timeout: 10000 });
  });

  test('should create new event from אירועים card', async ({ page }) => {
    console.log('Testing אירועים (Events) card...');

    // Take screenshot before action
    await page.screenshot({ path: 'test-results/screenshots/01-admin-dashboard.png', fullPage: true });

    // Find and click the "צור אירוע חדש" button in the אירועים card
    await page.locator('text=אירועים').locator('..').locator('..').locator('text=צור אירוע חדש').click();

    // Wait for navigation to /admin/events/new
    await page.waitForURL(/.*\/admin\/events\/new/, { timeout: 10000 });

    // Take screenshot of form
    await page.screenshot({ path: 'test-results/screenshots/02-event-form.png', fullPage: true });

    // Fill required fields
    await page.fill('#title', testData.eventTitle);

    // Set future date for event
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const timeStr = '18:00';

    await page.fill('#start_date', dateStr);
    await page.fill('#start_time', timeStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for either navigation or error
    try {
      await page.waitForURL(/\/events\/.*/, { timeout: 10000 });
      console.log('✓ Event created successfully - navigated to event page');
    } catch (error) {
      // Take screenshot on failure
      await page.screenshot({ path: 'test-results/screenshots/02-event-form-error.png', fullPage: true });
      throw error;
    }

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    console.log('✓ Event created successfully');
  });

  test('should create new task from משימות card', async ({ page }) => {
    console.log('Testing משימות (Tasks) card...');

    // Navigate back to admin dashboard
    await page.goto('http://localhost:4500/admin');
    await page.waitForSelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3');

    // Find and click the "צור משימה חדשה" button in the משימות card
    await page.locator('text=משימות').locator('..').locator('..').locator('text=צור משימה חדשה').click();

    // Wait for navigation
    await page.waitForURL(/.*\/admin\/tasks\/new/, { timeout: 10000 });

    // Fill required fields
    await page.fill('#title', testData.taskTitle);
    await page.fill('#owner_name', 'בודק אוטומטי');

    // Set future due date
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueDateStr = nextWeek.toISOString().split('T')[0];

    await page.fill('#due_date', dueDateStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    try {
      await page.waitForURL(/\/tasks/, { timeout: 10000 });
      console.log('✓ Task created successfully - navigated to tasks page');
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/03-task-form-error.png', fullPage: true });
      throw error;
    }

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    console.log('✓ Task created successfully');
  });

  test('should create new committee from וועדות card', async ({ page }) => {
    console.log('Testing וועדות (Committees) card...');

    // Navigate back to admin dashboard
    await page.goto('http://localhost:4500/admin');
    await page.waitForSelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3');

    // Find and click the "וועדה חדשה" button in the וועדות card
    await page.locator('text=וועדות').locator('..').locator('..').locator('text=וועדה חדשה').click();

    // Wait for navigation
    await page.waitForURL(/.*\/admin\/committees\/new/, { timeout: 10000 });

    // Fill required fields
    await page.fill('#name', testData.committeeTitle);

    // Add at least one member
    const memberInput = page.locator('input[placeholder="שם חבר וועדה"]');
    await memberInput.fill('חבר בדיקה 1');
    await page.locator('button:has-text("הוסף")').first().click();

    // Wait a bit for the member to be added
    await page.waitForTimeout(500);

    // Add at least one responsibility
    const responsibilityInput = page.locator('input[placeholder*="תחום אחריות"]');
    await responsibilityInput.fill('בדיקות אוטומטיות');
    await page.locator('button:has-text("הוסף")').last().click();

    // Wait a bit for the responsibility to be added
    await page.waitForTimeout(500);

    // Submit form
    await page.click('button[type="submit"]:has-text("שמור וועדה")');

    // Wait for navigation
    try {
      await page.waitForURL(/\/admin\/committees/, { timeout: 10000 });
      console.log('✓ Committee created successfully - navigated to committees page');
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/04-committee-form-error.png', fullPage: true });
      throw error;
    }

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    console.log('✓ Committee created successfully');
  });

  test('should create new issue from בעיות card', async ({ page }) => {
    console.log('Testing בעיות (Issues) card...');

    // Navigate back to admin dashboard
    await page.goto('http://localhost:4500/admin');
    await page.waitForSelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3');

    // Find and click the "דווח על בעיה" button in the בעיות card
    await page.locator('text=בעיות').locator('..').locator('..').locator('text=דווח על בעיה').click();

    // Wait for navigation
    await page.waitForURL(/.*\/admin\/issues\/new/, { timeout: 10000 });

    // Fill required fields
    await page.fill('#title', testData.issueTitle);
    await page.fill('#description', 'תיאור מפורט של הבעיה לצורך בדיקה אוטומטית. זה צריך להיות לפחות 10 תווים כדי לעבור את הולידציה.');
    await page.fill('#reporter_name', 'מדווח בדיקה');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    try {
      await page.waitForURL(/\/issues/, { timeout: 10000 });
      console.log('✓ Issue created successfully - navigated to issues page');
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/05-issue-form-error.png', fullPage: true });
      throw error;
    }

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    console.log('✓ Issue created successfully');
  });

  test('should create new protocol from פרוטוקולים card', async ({ page }) => {
    console.log('Testing פרוטוקולים (Protocols) card...');

    // Navigate back to admin dashboard
    await page.goto('http://localhost:4500/admin');
    await page.waitForSelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3');

    // Find and click the "הוסף פרוטוקול" button in the פרוטוקולים card
    await page.locator('text=פרוטוקולים').locator('..').locator('..').locator('text=הוסף פרוטוקול').click();

    // Wait for navigation
    await page.waitForURL(/.*\/admin\/protocols\/new/, { timeout: 10000 });

    // Fill required fields
    await page.fill('#title', testData.protocolTitle);

    // Set meeting date
    const today = new Date();
    const meetingDateStr = today.toISOString().split('T')[0];
    await page.fill('#meeting_date', meetingDateStr);

    // Add at least one attendee
    const attendeeInput = page.locator('input[placeholder="שם המשתתף"]');
    await attendeeInput.fill('משתתף בדיקה 1');
    await page.locator('button:has-text("הוסף")').click();

    // Wait a bit for the attendee to be added
    await page.waitForTimeout(500);

    // Submit form
    await page.click('button[type="submit"]:has-text("שמור")');

    // Wait for navigation
    try {
      await page.waitForURL(/\/protocols/, { timeout: 10000 });
      console.log('✓ Protocol created successfully - navigated to protocols page');
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/06-protocol-form-error.png', fullPage: true });
      throw error;
    }

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    console.log('✓ Protocol created successfully');
  });

  test('should create new expense from כספים card', async ({ page }) => {
    console.log('Testing כספים (Expenses) card...');

    // Navigate back to admin dashboard
    await page.goto('http://localhost:4500/admin');
    await page.waitForSelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3');

    // Find and click the "הוסף הוצאה" button in the כספים card
    await page.locator('text=כספים').locator('..').locator('..').locator('text=הוסף הוצאה').click();

    // Wait for navigation
    await page.waitForURL(/.*\/admin\/expenses\/new/, { timeout: 10000 });

    // Fill required fields
    await page.fill('#title', testData.expenseTitle);
    await page.fill('#amount', '100.50');

    // Set expense date
    const today = new Date();
    const expenseDateStr = today.toISOString().split('T')[0];
    await page.fill('#expense_date', expenseDateStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    try {
      await page.waitForURL(/\/admin\/expenses/, { timeout: 10000 });
      console.log('✓ Expense created successfully - navigated to expenses page');
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/07-expense-form-error.png', fullPage: true });
      throw error;
    }

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    console.log('✓ Expense created successfully');
  });

  test('should verify all entities were created via API', async ({ request, page }) => {
    console.log('Verifying all created entities via API...');

    // First, login to get auth cookie for API requests
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();

    // Get cookies from the page context
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Check events (public, no auth needed but using cookie for consistency)
    console.log('Checking events...');
    const eventsResponse = await request.get('http://localhost:4500/api/events', {
      headers: { 'Cookie': cookieHeader }
    });
    expect(eventsResponse.ok()).toBeTruthy();
    const eventsData = await eventsResponse.json();
    expect(eventsData.success).toBe(true);
    const testEvent = eventsData.data.find((e: any) => e.title === testData.eventTitle);
    expect(testEvent).toBeTruthy();
    console.log(`✓ Event verified in database: ${testEvent?.id}`);

    // Check tasks
    console.log('Checking tasks...');
    const tasksResponse = await request.get('http://localhost:4500/api/tasks', {
      headers: { 'Cookie': cookieHeader }
    });
    expect(tasksResponse.ok()).toBeTruthy();
    const tasksData = await tasksResponse.json();
    expect(tasksData.success).toBe(true);
    const testTask = tasksData.data.find((t: any) => t.title === testData.taskTitle);
    expect(testTask).toBeTruthy();
    console.log(`✓ Task verified in database: ${testTask?.id}`);

    // Check committees
    console.log('Checking committees...');
    const committeesResponse = await request.get('http://localhost:4500/api/committees', {
      headers: { 'Cookie': cookieHeader }
    });
    expect(committeesResponse.ok()).toBeTruthy();
    const committeesData = await committeesResponse.json();
    expect(committeesData.success).toBe(true);
    const testCommittee = committeesData.data.find((c: any) => c.name === testData.committeeTitle);
    expect(testCommittee).toBeTruthy();
    console.log(`✓ Committee verified in database: ${testCommittee?.id}`);

    // Check issues
    console.log('Checking issues...');
    const issuesResponse = await request.get('http://localhost:4500/api/issues', {
      headers: { 'Cookie': cookieHeader }
    });
    expect(issuesResponse.ok()).toBeTruthy();
    const issuesData = await issuesResponse.json();
    expect(issuesData.success).toBe(true);
    const testIssue = issuesData.data.find((i: any) => i.title === testData.issueTitle);
    expect(testIssue).toBeTruthy();
    console.log(`✓ Issue verified in database: ${testIssue?.id}`);

    // Check protocols
    console.log('Checking protocols...');
    const protocolsResponse = await request.get('http://localhost:4500/api/protocols', {
      headers: { 'Cookie': cookieHeader }
    });
    expect(protocolsResponse.ok()).toBeTruthy();
    const protocolsData = await protocolsResponse.json();
    expect(protocolsData.success).toBe(true);
    const testProtocol = protocolsData.data.find((p: any) => p.title === testData.protocolTitle);
    expect(testProtocol).toBeTruthy();
    console.log(`✓ Protocol verified in database: ${testProtocol?.id}`);

    // Check expenses
    console.log('Checking expenses...');
    const expensesResponse = await request.get('http://localhost:4500/api/expenses', {
      headers: { 'Cookie': cookieHeader }
    });
    expect(expensesResponse.ok()).toBeTruthy();
    const expensesData = await expensesResponse.json();
    expect(expensesData.success).toBe(true);
    const testExpense = expensesData.data.find((e: any) => e.title === testData.expenseTitle);
    expect(testExpense).toBeTruthy();
    console.log(`✓ Expense verified in database: ${testExpense?.id}`);

    console.log('\n✅ All entities verified successfully via API!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Events: ${testEvent?.id}`);
    console.log(`Tasks: ${testTask?.id}`);
    console.log(`Committees: ${testCommittee?.id}`);
    console.log(`Issues: ${testIssue?.id}`);
    console.log(`Protocols: ${testProtocol?.id}`);
    console.log(`Expenses: ${testExpense?.id}`);
    console.log('═══════════════════════════════════════════════════');
  });
});
