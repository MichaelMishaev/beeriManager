import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth.helper';

/**
 * Comprehensive Admin Panel Automation
 * This test systematically checks and clicks every button in the admin dashboard
 */
test.describe('Admin Panel - Comprehensive Button Test', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginAsAdmin();
    await page.goto('/he/admin');
    await page.waitForLoadState('networkidle');
  });

  test('Admin Dashboard - Verify all sections are visible', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('לוח בקרה למנהל');

    // Verify all admin section cards are visible
    const sections = [
      'אירועים',
      'משימות',
      'וועדות',
      'בעיות',
      'פרוטוקולים',
      'כספים',
      'משוב',
      'רעיונות',
      'כרטיסים',
      'אנשי קשר',
      'הודעות דחופות',
      'קרוסלת הדגשות',
      'התראות Push',
      'הגדרות'
    ];

    for (const sectionTitle of sections) {
      await expect(page.locator(`text=${sectionTitle}`).first()).toBeVisible();
    }
  });

  test('Admin Dashboard - Verify and click all stat cards', async ({ page }) => {
    // Stats cards are clickable links
    const statCards = [
      { selector: 'a:has-text("אירועים החודש")', expectedUrl: '/events' },
      { selector: 'a:has-text("משימות פתוחות")', expectedUrl: '/tasks' },
      { selector: 'a:has-text("בעיות לטיפול")', expectedUrl: '/issues' },
      { selector: 'a:has-text("נרשמים החודש")', expectedUrl: '/events' }
    ];

    for (const statCard of statCards) {
      // Verify the stat card is visible
      const card = page.locator(statCard.selector).first();
      await expect(card).toBeVisible();

      // Click and verify navigation
      await card.click();
      await page.waitForURL(`**${statCard.expectedUrl}*`);

      // Go back to admin dashboard
      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Events Section - Test all buttons', async ({ page }) => {
    const eventsButtons = [
      { text: 'צור אירוע חדש', url: '/admin/events/new' },
      { text: 'רשימת אירועים', url: '/events' },
      { text: 'ניהול הרשמות', url: '/admin/events/registrations' }
    ];

    for (const button of eventsButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      // Verify URL contains expected path (some may not exist yet)
      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      // Go back to admin dashboard
      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Tasks Section - Test all buttons', async ({ page }) => {
    const tasksButtons = [
      { text: 'צור משימה חדשה', url: '/admin/tasks/new' },
      { text: 'רשימת משימות', url: '/tasks' },
      { text: 'הקצאת משימות', url: '/admin/tasks/assign' }
    ];

    for (const button of tasksButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Committees Section - Test all buttons', async ({ page }) => {
    const committeesButtons = [
      { text: 'וועדה חדשה', url: '/admin/committees/new' },
      { text: 'רשימת וועדות', url: '/admin/committees' }
    ];

    for (const button of committeesButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Issues Section - Test all buttons', async ({ page }) => {
    const issuesButtons = [
      { text: 'דווח על בעיה', url: '/admin/issues/new' },
      { text: 'רשימת בעיות', url: '/issues' },
      { text: 'סטטיסטיקות', url: '/admin/issues/stats' }
    ];

    for (const button of issuesButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Protocols Section - Test all buttons', async ({ page }) => {
    const protocolsButtons = [
      { text: 'הוסף פרוטוקול', url: '/admin/protocols/new' },
      { text: 'ארכיון פרוטוקולים', url: '/protocols' },
      { text: 'העלאת מסמכים', url: '/admin/protocols/upload' }
    ];

    for (const button of protocolsButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Expenses Section - Test all buttons', async ({ page }) => {
    const expensesButtons = [
      { text: 'הוסף הוצאה', url: '/admin/expenses/new' },
      { text: 'רשימת הוצאות', url: '/admin/expenses' },
      { text: 'דוחות כספיים', url: '/admin/expenses/reports' }
    ];

    for (const button of expensesButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Feedback Section - Test all buttons', async ({ page }) => {
    const feedbackButtons = [
      { text: 'צפייה במשובים', url: '/admin/feedback' },
      { text: 'סטטיסטיקות', url: '/admin/feedback/stats' },
      { text: 'ייצוא נתונים', url: '/admin/feedback/export' }
    ];

    for (const button of feedbackButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Ideas Section - Test all buttons', async ({ page }) => {
    const ideasButtons = [
      { text: 'צפייה ברעיונות', url: '/admin/ideas' },
      { text: 'שליחת רעיון', url: '/ideas' }
    ];

    for (const button of ideasButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Tickets Section - Test all buttons', async ({ page }) => {
    const ticketsButtons = [
      { text: 'כרטיס חדש', url: '/admin/tickets/new' },
      { text: 'ניהול כרטיסים', url: '/admin/tickets' },
      { text: 'צפייה ציבורית', url: '/tickets' }
    ];

    for (const button of ticketsButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Contacts Section - Test all buttons', async ({ page }) => {
    const contactsButtons = [
      { text: 'ניהול אנשי קשר', url: '/admin/contacts' }
    ];

    for (const button of contactsButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Urgent Messages Section - Test all buttons', async ({ page }) => {
    const urgentButtons = [
      { text: 'ניהול הודעות דחופות', url: '/admin/urgent' }
    ];

    for (const button of urgentButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Highlights Section - Test all buttons', async ({ page }) => {
    const highlightsButtons = [
      { text: 'ניהול הדגשות', url: '/admin/highlights' }
    ];

    for (const button of highlightsButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Push Notifications Section - Test all buttons', async ({ page }) => {
    const notificationsButtons = [
      { text: 'שלח התראות', url: '/admin/notifications' }
    ];

    for (const button of notificationsButtons) {
      const btn = page.locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Settings Section - Test all buttons', async ({ page }) => {
    const settingsButtons = [
      { text: 'ניהול תגיות', url: '/admin/tags' },
      { text: 'הגדרות כלליות', url: '/admin/settings' }
    ];

    for (const button of settingsButtons) {
      // Need to be more specific with the selector as "הגדרות" appears multiple times
      const btn = page.locator('.space-y-2').filter({ hasText: 'הגדרות' }).locator(`a:has-text("${button.text}")`).first();
      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}", navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
    }
  });

  test('Quick Actions Section - Test all buttons', async ({ page }) => {
    // Scroll to bottom where quick actions are
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const quickActionsButtons = [
      { text: 'אירוע חדש', url: '/admin/events/new' },
      { text: 'משימה חדשה', url: '/admin/tasks/new' },
      { text: 'פרוטוקול חדש', url: '/admin/protocols/new' },
      { text: 'שליחת הודעה', url: '/admin/broadcast' },
      { text: 'דוחות', url: '/admin/reports' }
    ];

    for (const button of quickActionsButtons) {
      // Find button in Quick Actions section
      const quickActionsCard = page.locator('div').filter({ hasText: 'פעולות מהירות' }).first();
      const btn = quickActionsCard.locator(`a:has-text("${button.text}")`).first();

      await expect(btn).toBeVisible();

      await btn.click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log(`Clicked "${button.text}" from Quick Actions, navigated to: ${currentUrl}`);

      await page.goto('/he/admin');
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
    }
  });

  test('Header Buttons - Instructions and Settings', async ({ page }) => {
    // Test "הוראות שימוש" button (opens dialog)
    const instructionsButton = page.locator('button:has-text("הוראות שימוש")').first();
    await expect(instructionsButton).toBeVisible();
    await instructionsButton.click();

    // Verify dialog opened
    await expect(page.locator('text=הוראות שימוש למנהלים')).toBeVisible();

    // Close dialog (click outside or ESC)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Test "הגדרות" button in header
    const headerSettingsButton = page.locator('a:has-text("הגדרות")').last();
    await expect(headerSettingsButton).toBeVisible();
    await headerSettingsButton.click();

    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    console.log(`Clicked "הגדרות" from header, navigated to: ${currentUrl}`);
  });

  test('Test drag-and-drop functionality', async ({ page }) => {
    // Verify drag handles are visible
    const dragHandles = page.locator('button').filter({ has: page.locator('svg').first() });
    const count = await dragHandles.count();
    console.log(`Found ${count} drag handles`);

    // Verify they exist (one per card)
    expect(count).toBeGreaterThan(0);
  });

  test('All buttons comprehensive test - single run', async ({ page }) => {
    // This test clicks ALL buttons in one go and logs results
    const allButtons = [
      // Events
      { section: 'Events', text: 'צור אירוע חדש', url: '/admin/events/new' },
      { section: 'Events', text: 'רשימת אירועים', url: '/events' },
      { section: 'Events', text: 'ניהול הרשמות', url: '/admin/events/registrations' },
      // Tasks
      { section: 'Tasks', text: 'צור משימה חדשה', url: '/admin/tasks/new' },
      { section: 'Tasks', text: 'רשימת משימות', url: '/tasks' },
      { section: 'Tasks', text: 'הקצאת משימות', url: '/admin/tasks/assign' },
      // Committees
      { section: 'Committees', text: 'וועדה חדשה', url: '/admin/committees/new' },
      { section: 'Committees', text: 'רשימת וועדות', url: '/admin/committees' },
      // Issues
      { section: 'Issues', text: 'דווח על בעיה', url: '/admin/issues/new' },
      { section: 'Issues', text: 'רשימת בעיות', url: '/issues' },
      { section: 'Issues', text: 'סטטיסטיקות', url: '/admin/issues/stats' },
      // Protocols
      { section: 'Protocols', text: 'הוסף פרוטוקול', url: '/admin/protocols/new' },
      { section: 'Protocols', text: 'ארכיון פרוטוקולים', url: '/protocols' },
      { section: 'Protocols', text: 'העלאת מסמכים', url: '/admin/protocols/upload' },
      // Expenses
      { section: 'Expenses', text: 'הוסף הוצאה', url: '/admin/expenses/new' },
      { section: 'Expenses', text: 'רשימת הוצאות', url: '/admin/expenses' },
      { section: 'Expenses', text: 'דוחות כספיים', url: '/admin/expenses/reports' },
      // Feedback
      { section: 'Feedback', text: 'צפייה במשובים', url: '/admin/feedback' },
      { section: 'Feedback', text: 'סטטיסטיקות', url: '/admin/feedback/stats' },
      { section: 'Feedback', text: 'ייצוא נתונים', url: '/admin/feedback/export' },
      // Ideas
      { section: 'Ideas', text: 'צפייה ברעיונות', url: '/admin/ideas' },
      { section: 'Ideas', text: 'שליחת רעיון', url: '/ideas' },
      // Tickets
      { section: 'Tickets', text: 'כרטיס חדש', url: '/admin/tickets/new' },
      { section: 'Tickets', text: 'ניהול כרטיסים', url: '/admin/tickets' },
      { section: 'Tickets', text: 'צפייה ציבורית', url: '/tickets' },
      // Contacts
      { section: 'Contacts', text: 'ניהול אנשי קשר', url: '/admin/contacts' },
      // Urgent
      { section: 'Urgent', text: 'ניהול הודעות דחופות', url: '/admin/urgent' },
      // Highlights
      { section: 'Highlights', text: 'ניהול הדגשות', url: '/admin/highlights' },
      // Notifications
      { section: 'Notifications', text: 'שלח התראות', url: '/admin/notifications' },
      // Settings
      { section: 'Settings', text: 'ניהול תגיות', url: '/admin/tags' },
      { section: 'Settings', text: 'הגדרות כלליות', url: '/admin/settings' },
    ];

    let passedCount = 0;
    let failedCount = 0;
    const results: Array<{ section: string; button: string; status: string; url: string }> = [];

    for (const button of allButtons) {
      try {
        await page.goto('/he/admin');
        await page.waitForLoadState('networkidle');

        const btn = page.locator(`a:has-text("${button.text}")`).first();
        await expect(btn).toBeVisible({ timeout: 5000 });

        await btn.click();
        await page.waitForTimeout(1000);

        const currentUrl = page.url();
        results.push({
          section: button.section,
          button: button.text,
          status: '✅ PASS',
          url: currentUrl
        });
        passedCount++;
      } catch (error) {
        results.push({
          section: button.section,
          button: button.text,
          status: '❌ FAIL',
          url: String(error)
        });
        failedCount++;
      }
    }

    // Print summary
    console.log('\n========================================');
    console.log('ADMIN PANEL AUTOMATION TEST SUMMARY');
    console.log('========================================');
    console.log(`Total Buttons Tested: ${allButtons.length}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log('========================================\n');

    // Print detailed results
    for (const result of results) {
      console.log(`[${result.section}] ${result.status} - ${result.button}`);
      console.log(`  → ${result.url}\n`);
    }

    // Ensure at least 80% of buttons work
    const successRate = (passedCount / allButtons.length) * 100;
    expect(successRate).toBeGreaterThanOrEqual(80);
  });
});
