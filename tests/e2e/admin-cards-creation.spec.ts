import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - Create Entities from Cards', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('http://localhost:4500/admin');

    // Wait for the page to load
    await page.waitForSelector('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3');
  });

  test('should create new event from אירועים card', async ({ page }) => {
    console.log('Testing אירועים (Events) card...');

    // Find and click the "צור אירוע חדש" button in the אירועים card
    await page.locator('text=אירועים').locator('..').locator('..').locator('text=צור אירוע חדש').click();

    // Wait for navigation to /admin/events/new
    await expect(page).toHaveURL(/.*\/admin\/events\/new/);

    // Fill required fields
    await page.fill('#title', 'אירוע בדיקה אוטומטי');

    // Set future date for event
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const timeStr = '18:00';

    await page.fill('#start_date', dateStr);
    await page.fill('#start_time', timeStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success toast or redirect
    await page.waitForTimeout(2000);

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    // Verify redirect to events page or success
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/events/);

    console.log('✓ Event created successfully');
  });

  test('should create new task from משימות card', async ({ page }) => {
    console.log('Testing משימות (Tasks) card...');

    // Find and click the "צור משימה חדשה" button in the משימות card
    await page.locator('text=משימות').locator('..').locator('..').locator('text=צור משימה חדשה').click();

    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/tasks\/new/);

    // Fill required fields
    await page.fill('#title', 'משימה בדיקה אוטומטית');
    await page.fill('#owner_name', 'בודק אוטומטי');

    // Set future due date
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueDateStr = nextWeek.toISOString().split('T')[0];

    await page.fill('#due_date', dueDateStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    // Verify redirect to tasks page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/tasks/);

    console.log('✓ Task created successfully');
  });

  test('should create new committee from וועדות card', async ({ page }) => {
    console.log('Testing וועדות (Committees) card...');

    // Find and click the "וועדה חדשה" button in the וועדות card
    await page.locator('text=וועדות').locator('..').locator('..').locator('text=וועדה חדשה').click();

    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/committees\/new/);

    // Fill required fields
    await page.fill('#name', 'וועדת בדיקה אוטומטית');

    // Add at least one member
    await page.fill('input[placeholder="שם חבר וועדה"]', 'חבר בדיקה 1');
    await page.locator('button:has-text("הוסף")').first().click();

    // Add at least one responsibility
    await page.fill('input[placeholder*="תחום אחריות"]', 'בדיקות אוטומטיות');
    await page.locator('button:has-text("הוסף")').last().click();

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    // Verify redirect
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/committees/);

    console.log('✓ Committee created successfully');
  });

  test('should create new issue from בעיות card', async ({ page }) => {
    console.log('Testing בעיות (Issues) card...');

    // Find and click the "דווח על בעיה" button in the בעיות card
    await page.locator('text=בעיות').locator('..').locator('..').locator('text=דווח על בעיה').click();

    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/issues\/new/);

    // Fill required fields
    await page.fill('#title', 'בעיה לבדיקה אוטומטית');
    await page.fill('#description', 'תיאור מפורט של הבעיה לצורך בדיקה אוטומטית');
    await page.fill('#reporter_name', 'מדווח בדיקה');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    // Verify redirect
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/issues/);

    console.log('✓ Issue created successfully');
  });

  test('should create new protocol from פרוטוקולים card', async ({ page }) => {
    console.log('Testing פרוטוקולים (Protocols) card...');

    // Find and click the "הוסף פרוטוקול" button in the פרוטוקולים card
    await page.locator('text=פרוטוקולים').locator('..').locator('..').locator('text=הוסף פרוטוקול').click();

    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/protocols\/new/);

    // Fill required fields
    await page.fill('#title', 'פרוטוקול בדיקה אוטומטי');

    // Set meeting date
    const today = new Date();
    const meetingDateStr = today.toISOString().split('T')[0];
    await page.fill('#meeting_date', meetingDateStr);

    // Add at least one attendee
    await page.fill('input[placeholder="שם המשתתף"]', 'משתתף בדיקה 1');
    await page.locator('button:has-text("הוסף")').click();

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    // Verify redirect
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/protocols/);

    console.log('✓ Protocol created successfully');
  });

  test('should create new expense from כספים card', async ({ page }) => {
    console.log('Testing כספים (Expenses) card...');

    // Find and click the "הוסף הוצאה" button in the כספים card
    await page.locator('text=כספים').locator('..').locator('..').locator('text=הוסף הוצאה').click();

    // Wait for navigation
    await expect(page).toHaveURL(/.*\/admin\/expenses\/new/);

    // Fill required fields
    await page.fill('#title', 'הוצאה לבדיקה אוטומטית');
    await page.fill('#amount', '100.50');

    // Set expense date
    const today = new Date();
    const expenseDateStr = today.toISOString().split('T')[0];
    await page.fill('#expense_date', expenseDateStr);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for no error messages
    const errorMessages = await page.locator('.text-red-500, .border-red-500').count();
    expect(errorMessages).toBe(0);

    // Verify redirect
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/expenses/);

    console.log('✓ Expense created successfully');
  });

  test('should verify all entities were created via API', async ({ request }) => {
    console.log('Verifying all created entities via API...');

    // Check events
    const eventsResponse = await request.get('http://localhost:4500/api/events');
    const eventsData = await eventsResponse.json();
    expect(eventsData.success).toBe(true);
    const testEvent = eventsData.data.find((e: any) => e.title === 'אירוע בדיקה אוטומטי');
    expect(testEvent).toBeTruthy();
    console.log('✓ Event verified in database');

    // Check tasks
    const tasksResponse = await request.get('http://localhost:4500/api/tasks');
    const tasksData = await tasksResponse.json();
    expect(tasksData.success).toBe(true);
    const testTask = tasksData.data.find((t: any) => t.title === 'משימה בדיקה אוטומטית');
    expect(testTask).toBeTruthy();
    console.log('✓ Task verified in database');

    // Check committees
    const committeesResponse = await request.get('http://localhost:4500/api/committees');
    const committeesData = await committeesResponse.json();
    expect(committeesData.success).toBe(true);
    const testCommittee = committeesData.data.find((c: any) => c.name === 'וועדת בדיקה אוטומטית');
    expect(testCommittee).toBeTruthy();
    console.log('✓ Committee verified in database');

    // Check issues
    const issuesResponse = await request.get('http://localhost:4500/api/issues');
    const issuesData = await issuesResponse.json();
    expect(issuesData.success).toBe(true);
    const testIssue = issuesData.data.find((i: any) => i.title === 'בעיה לבדיקה אוטומטית');
    expect(testIssue).toBeTruthy();
    console.log('✓ Issue verified in database');

    // Check protocols
    const protocolsResponse = await request.get('http://localhost:4500/api/protocols');
    const protocolsData = await protocolsResponse.json();
    expect(protocolsData.success).toBe(true);
    const testProtocol = protocolsData.data.find((p: any) => p.title === 'פרוטוקול בדיקה אוטומטי');
    expect(testProtocol).toBeTruthy();
    console.log('✓ Protocol verified in database');

    // Check expenses
    const expensesResponse = await request.get('http://localhost:4500/api/expenses');
    const expensesData = await expensesResponse.json();
    expect(expensesData.success).toBe(true);
    const testExpense = expensesData.data.find((e: any) => e.title === 'הוצאה לבדיקה אוטומטית');
    expect(testExpense).toBeTruthy();
    console.log('✓ Expense verified in database');

    console.log('✅ All entities verified successfully!');
  });
});
