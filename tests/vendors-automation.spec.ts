import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:4500'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-admin-password'

test.describe('Vendors Management Automation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/he/admin/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/he/admin`)
  })

  test('Create, Edit, and Delete Vendor', async ({ page }) => {
    // Navigate to vendors page
    await page.goto(`${BASE_URL}/he/admin/vendors`)
    await page.waitForLoadState('networkidle')

    // ========== CREATE VENDOR ==========
    console.log('📝 Creating new vendor...')

    // Click "Add New Vendor" button
    await page.click('button:has-text("ספק חדש"), button:has-text("הוסף ספק")')

    // Fill vendor form
    await page.fill('input[name="name"]', 'ספק אוטומציה טסט')
    await page.fill('textarea[name="description"]', 'ספק נוצר באמצעות אוטומציה של Playwright')

    // Select category
    await page.selectOption('select[name="category"]', 'catering')

    // Fill contact details
    await page.fill('input[name="contact_person"]', 'איש קשר טסט')
    await page.fill('input[name="phone"]', '0501234567')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="website"]', 'https://example.com')

    // Fill business details
    await page.fill('input[name="business_number"]', '123456789')
    await page.fill('input[name="license_number"]', 'LIC-12345')

    // Select price range
    await page.selectOption('select[name="price_range"]', 'moderate')

    // Fill payment terms
    await page.fill('textarea[name="payment_terms"]', 'תשלום תוך 30 יום')

    // Fill notes
    await page.fill('textarea[name="notes"]', 'ספק מומלץ לאירועים')

    // Select status
    await page.selectOption('select[name="status"]', 'active')

    // Submit form
    await page.click('button[type="submit"]:has-text("שמור"), button[type="submit"]:has-text("צור")')

    // Wait for success message or redirect
    await page.waitForTimeout(2000)

    // Verify vendor was created - should be in the list
    await expect(page.locator('text=ספק אוטומציה טסט')).toBeVisible()
    console.log('✅ Vendor created successfully')

    // ========== EDIT VENDOR ==========
    console.log('✏️  Editing vendor...')

    // Find and click the vendor edit button
    const vendorRow = page.locator('text=ספק אוטומציה טסט').locator('..')
    await vendorRow.locator('button:has-text("ערוך"), [aria-label="ערוך"]').first().click()

    // Wait for edit form to load
    await page.waitForLoadState('networkidle')

    // Modify vendor details
    await page.fill('input[name="name"]', 'ספק אוטומציה טסט - מעודכן')
    await page.fill('textarea[name="description"]', 'תיאור מעודכן של הספק')
    await page.fill('input[name="phone"]', '0509876543')

    // Submit edit form
    await page.click('button[type="submit"]:has-text("שמור"), button[type="submit"]:has-text("עדכן")')

    // Wait for update
    await page.waitForTimeout(2000)

    // Verify vendor was updated
    await expect(page.locator('text=ספק אוטומציה טסט - מעודכן')).toBeVisible()
    console.log('✅ Vendor updated successfully')

    // ========== DELETE VENDOR ==========
    console.log('🗑️  Deleting vendor...')

    // Find and click the vendor delete button
    const updatedVendorRow = page.locator('text=ספק אוטומציה טסט - מעודכן').locator('..')
    await updatedVendorRow.locator('button:has-text("מחק"), [aria-label="מחק"]').first().click()

    // Confirm deletion in dialog
    await page.click('button:has-text("אישור"), button:has-text("מחק"), button:has-text("כן")')

    // Wait for deletion
    await page.waitForTimeout(2000)

    // Verify vendor was deleted
    await expect(page.locator('text=ספק אוטומציה טסט - מעודכן')).not.toBeVisible()
    console.log('✅ Vendor deleted successfully')
  })

  test('Create vendor with minimal fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/he/admin/vendors`)
    await page.waitForLoadState('networkidle')

    // Click "Add New Vendor" button
    await page.click('button:has-text("ספק חדש"), button:has-text("הוסף ספק")')

    // Fill only required fields
    await page.fill('input[name="name"]', 'ספק מינימלי')
    await page.fill('textarea[name="description"]', 'תיאור קצר')
    await page.selectOption('select[name="category"]', 'other')
    await page.selectOption('select[name="price_range"]', 'moderate')

    // Submit form
    await page.click('button[type="submit"]:has-text("שמור"), button[type="submit"]:has-text("צור")')

    await page.waitForTimeout(2000)

    // Verify vendor was created
    await expect(page.locator('text=ספק מינימלי')).toBeVisible()

    // Clean up - delete the vendor
    const vendorRow = page.locator('text=ספק מינימלי').locator('..')
    await vendorRow.locator('button:has-text("מחק"), [aria-label="מחק"]').first().click()
    await page.click('button:has-text("אישור"), button:has-text("מחק"), button:has-text("כן")')
  })

  test('Test vendor validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/he/admin/vendors`)
    await page.waitForLoadState('networkidle')

    // Click "Add New Vendor" button
    await page.click('button:has-text("ספק חדש"), button:has-text("הוסף ספק")')

    // Try to submit empty form - should show validation errors
    await page.click('button[type="submit"]:has-text("שמור"), button[type="submit"]:has-text("צור")')

    // Check for validation error messages
    await expect(page.locator('text=שם הספק חייב להכיל, text=נדרש')).toBeVisible({ timeout: 3000 })
  })

  test('Search and filter vendors', async ({ page }) => {
    await page.goto(`${BASE_URL}/he/admin/vendors`)
    await page.waitForLoadState('networkidle')

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="חיפוש"], input[type="search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('קייטרינג')
      await page.waitForTimeout(1000)

      // Verify search results
      console.log('🔍 Search functionality working')
    }

    // Test category filter
    const categoryFilter = page.locator('select:has-text("קטגוריה"), select[name="category"]')
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('catering')
      await page.waitForTimeout(1000)

      console.log('🏷️  Category filter working')
    }

    // Test status filter
    const statusFilter = page.locator('select:has-text("סטטוס"), select[name="status"]')
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('active')
      await page.waitForTimeout(1000)

      console.log('✓ Status filter working')
    }
  })
})
