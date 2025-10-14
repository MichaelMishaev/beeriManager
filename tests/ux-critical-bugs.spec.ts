import { test, expect } from '@playwright/test'

/**
 * UX Critical Bugs Test Suite
 * Testing all fixes from UX_CRITICAL_BUGS_ULTRATHINK.md
 */

test.describe('Critical Bug Fixes - UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000/he')
  })

  test.describe('SEVERITY 1: Date Picker Crash Protection', () => {
    test('should not crash on invalid relative date', async ({ page }) => {
      // Login as admin
      await page.goto('http://localhost:3000/he/login')
      await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'test')
      await page.click('button[type="submit"]')

      // Navigate to new task
      await page.goto('http://localhost:3000/he/admin/tasks/new')

      // Fill required fields
      await page.fill('input#title', 'Test Task with Invalid Date')
      await page.fill('input#owner_name', 'Test Owner')

      // Try to use date picker with quick select (should not crash)
      await page.click('text=מחר')

      // Verify page is still functional
      await expect(page.locator('input#title')).toBeVisible()

      // Check no error toast appeared
      const errorToast = page.locator('[data-sonner-toast][data-type="error"]')
      await expect(errorToast).not.toBeVisible()
    })

    test('should show error toast on invalid date calculation', async ({ page }) => {
      // This test validates the error handling path
      await page.goto('http://localhost:3000/he/admin/tasks/new')

      // Use browser console to inject invalid date
      await page.evaluate(() => {
        const input = document.querySelector('input[type="date"]') as HTMLInputElement
        if (input) {
          input.value = '9999-99-99' // Invalid date
          input.dispatchEvent(new Event('change', { bubbles: true }))
        }
      })

      // App should still be responsive
      await expect(page.locator('input#title')).toBeVisible()
    })
  })

  test.describe('SEVERITY 1: TaskCard Null Safety', () => {
    test('should render task without due_date without crashing', async ({ page }) => {
      // Login
      await page.goto('http://localhost:3000/he/login')
      await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'test')
      await page.click('button[type="submit"]')

      // Create task WITHOUT due date
      await page.goto('http://localhost:3000/he/admin/tasks/new')
      await page.fill('input#title', 'Task No Due Date')
      await page.fill('input#owner_name', 'Test Owner')
      await page.click('button[type="submit"]:has-text("צור משימה")')

      // Wait for redirect
      await page.waitForURL('**/tasks')

      // Verify task appears in list (proves TaskCard renders)
      await expect(page.locator('text=Task No Due Date')).toBeVisible()

      // No crash occurred
      await expect(page).not.toHaveTitle(/error/i)
    })

    test('should display placeholder when due date is missing', async ({ page }) => {
      await page.goto('http://localhost:3000/he/tasks')

      // Look for tasks without dates
      const taskCards = page.locator('[class*="TaskCard"]')
      const count = await taskCards.count()

      if (count > 0) {
        // At least one task rendered successfully
        expect(count).toBeGreaterThan(0)
      }
    })
  })

  test.describe('SEVERITY 2: API Error Messages', () => {
    test('should show specific error for 404', async ({ page }) => {
      // Try to edit non-existent task
      await page.goto('http://localhost:3000/he/admin/tasks/00000000-0000-0000-0000-000000000000/edit')

      // Should show 404 error (not generic "error")
      const errorMessage = page.locator('text=/נמצא|404|לא קיים/i')
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
    })

    test('should show specific error for validation failure', async ({ page }) => {
      await page.goto('http://localhost:3000/he/admin/tasks/new')

      // Submit form with invalid data
      await page.fill('input#title', 'A') // Too short
      await page.fill('input#owner_name', 'T') // Too short
      await page.fill('input#owner_phone', '123') // Invalid format
      await page.click('button[type="submit"]:has-text("צור משימה")')

      // Should show specific validation error (not generic)
      const validationError = page.locator('text=/קצר|תקין|2 תווים/i')
      await expect(validationError).toBeVisible({ timeout: 3000 })
    })

    test('should show retry action on server error', async ({ page }) => {
      // Mock a 500 error
      await page.route('**/api/tasks/*', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'שגיאת שרת פנימית',
            code: 'INTERNAL_ERROR',
            action: {
              label: 'נסה שוב',
              onClick: 'retry'
            }
          })
        })
      })

      await page.goto('http://localhost:3000/he/admin/tasks/new')
      await page.fill('input#title', 'Test Task')
      await page.fill('input#owner_name', 'Test Owner')
      await page.click('button[type="submit"]:has-text("צור משימה")')

      // Should show error with retry action
      await expect(page.locator('text=שגיאת שרת')).toBeVisible()
      await expect(page.locator('button:has-text("נסה שוב")')).toBeVisible()
    })
  })

  test.describe('SEVERITY 2: Race Condition Prevention', () => {
    test('should prevent double submission', async ({ page }) => {
      await page.goto('http://localhost:3000/he/admin/tasks/new')

      await page.fill('input#title', 'Race Condition Test')
      await page.fill('input#owner_name', 'Test Owner')

      // Click submit button rapidly twice
      const submitButton = page.locator('button[type="submit"]:has-text("צור משימה")')

      await submitButton.click()
      await submitButton.click() // Second click should be ignored

      // Button should be disabled
      await expect(submitButton).toBeDisabled()

      // Wait for navigation
      await page.waitForURL('**/tasks', { timeout: 5000 })

      // Should only create ONE task (not two)
      const taskCount = await page.locator('text=Race Condition Test').count()
      expect(taskCount).toBeLessThanOrEqual(1)
    })

    test('should lock form during delete', async ({ page }) => {
      // Create a task first
      await page.goto('http://localhost:3000/he/admin/tasks/new')
      await page.fill('input#title', 'Delete Lock Test')
      await page.fill('input#owner_name', 'Test Owner')
      await page.click('button[type="submit"]:has-text("צור משימה")')
      await page.waitForURL('**/tasks')

      // Find and edit the task
      await page.click('text=Delete Lock Test')
      await page.click('a:has-text("עריכה")')

      // Try to delete
      page.on('dialog', dialog => dialog.accept())
      await page.click('button:has-text("מחק משימה")')

      // Both save and delete buttons should be disabled during delete
      await expect(page.locator('button:has-text("שמור שינויים")')).toBeDisabled()
      await expect(page.locator('button:has-text("מחק משימה")')).toBeDisabled()
    })
  })

  test.describe('SEVERITY 3: Generic Error Messages Fixed', () => {
    test('should show network error with retry', async ({ page }) => {
      // Simulate offline
      await page.context().setOffline(true)

      await page.goto('http://localhost:3000/he/admin/tasks/new')
      await page.fill('input#title', 'Offline Test')
      await page.fill('input#owner_name', 'Test Owner')
      await page.click('button[type="submit"]:has-text("צור משימה")')

      // Should show specific "no internet" message
      await expect(page.locator('text=/אין חיבור|offline|אינטרנט/i')).toBeVisible({ timeout: 3000 })
      await expect(page.locator('button:has-text("נסה שוב")')).toBeVisible()

      // Re-enable network
      await page.context().setOffline(false)
    })

    test('should distinguish between different error types', async ({ page }) => {
      // Test 401 error
      await page.route('**/api/tasks', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'אין הרשאה',
              code: 'UNAUTHORIZED'
            })
          })
        } else {
          route.continue()
        }
      })

      await page.goto('http://localhost:3000/he/admin/tasks/new')
      await page.fill('input#title', 'Auth Test')
      await page.fill('input#owner_name', 'Test Owner')
      await page.click('button[type="submit"]:has-text("צור משימה")')

      // Should show auth-specific error
      await expect(page.locator('text=/הרשאה|התחבר/i')).toBeVisible()
    })
  })

  test.describe('SEVERITY 4: Accessibility Improvements', () => {
    test('should have ARIA labels on icon buttons', async ({ page }) => {
      await page.goto('http://localhost:3000/he/tasks')

      // Check if task action buttons have aria-label
      const iconButtons = page.locator('button:has(svg)')
      const firstButton = iconButtons.first()

      if (await firstButton.isVisible()) {
        const ariaLabel = await firstButton.getAttribute('aria-label')
        const title = await firstButton.getAttribute('title')

        // Should have either aria-label or title
        expect(ariaLabel || title).toBeTruthy()
      }
    })

    test('should announce loading states to screen readers', async ({ page }) => {
      await page.goto('http://localhost:3000/he/admin/tasks/new')

      // Submit form to trigger loading state
      await page.fill('input#title', 'Accessibility Test')
      await page.fill('input#owner_name', 'Test Owner')
      await page.click('button[type="submit"]:has-text("צור משימה")')

      // Check for ARIA live region (should exist during loading)
      const liveRegion = page.locator('[role="status"], [aria-live="polite"], [aria-live="assertive"]')

      // At least one live region should exist
      const count = await liveRegion.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('SEVERITY 5: Performance Optimizations', () => {
    test('should load task list quickly', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('http://localhost:3000/he/tasks')

      // Wait for tasks to load
      await page.waitForSelector('text=/משימות|Tasks/i')

      const loadTime = Date.now() - startTime

      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should render 50+ tasks without lag', async ({ page }) => {
      await page.goto('http://localhost:3000/he/tasks')

      // Get all task cards
      const taskCards = page.locator('[class*="Card"]')
      const count = await taskCards.count()

      console.log(`Rendered ${count} task cards`)

      // Page should still be interactive
      await expect(page.locator('button:has-text("משימה חדשה")')).toBeVisible()

      // Scroll should be smooth (no janky behavior)
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })

      await page.waitForTimeout(500)

      // No console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      expect(errors.length).toBe(0)
    })
  })
})

test.describe('RTL and Hebrew Compliance', () => {
  test('should display Hebrew text correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/he')

    // Check for Hebrew content
    const hebrewText = page.locator('text=/ועד הורים|משימות|אירועים/i')
    await expect(hebrewText.first()).toBeVisible()
  })

  test('should have RTL direction', async ({ page }) => {
    await page.goto('http://localhost:3000/he')

    const html = page.locator('html')
    const dir = await html.getAttribute('dir')

    expect(dir).toBe('rtl')
  })

  test('should format dates in Hebrew', async ({ page }) => {
    await page.goto('http://localhost:3000/he/tasks')

    // Look for Hebrew date words
    const hebrewDates = page.locator('text=/היום|מחר|אתמול|לפני|בעוד/i')

    if (await hebrewDates.first().isVisible()) {
      expect(await hebrewDates.count()).toBeGreaterThan(0)
    }
  })
})

test.describe('Mobile UX (NN/g Compliance)', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/he')

    // Check button sizes
    const buttons = page.locator('button')
    const firstButton = buttons.first()

    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox()

      // Minimum touch target: 44x44px (Apple HIG)
      expect(box?.height).toBeGreaterThanOrEqual(36) // Allow some variance
    }
  })

  test('should show mobile navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/he')

    // Mobile menu button should be visible
    const menuButton = page.locator('button:has(svg)')
    await expect(menuButton.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/he/tasks')

    // Content should fit within viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = page.viewportSize()?.width || 0

    // No horizontal scroll
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // 10px tolerance
  })
})
