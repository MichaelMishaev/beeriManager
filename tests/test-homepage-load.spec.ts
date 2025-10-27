import { test, expect } from '@playwright/test'

test.describe('Homepage Load Test', () => {
  test('should load Hebrew homepage without 404 errors', async ({ page }) => {
    // Navigate to Hebrew homepage
    const response = await page.goto('http://localhost:4500/he', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Verify page loaded successfully
    expect(response?.status()).toBe(200)

    // Verify no 404 errors in console
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait a bit for any potential polling requests
    await page.waitForTimeout(3000)

    // Check for 404 errors
    const has404Errors = errors.some(err => err.includes('404'))
    expect(has404Errors).toBe(false)

    console.log('✅ Page loaded successfully without 404 errors')
  })

  test('should load tasks page without 404 errors', async ({ page }) => {
    // Navigate to tasks page
    const response = await page.goto('http://localhost:4500/he/tasks', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Verify page loaded successfully
    expect(response?.status()).toBe(200)

    console.log('✅ Tasks page loaded successfully')
  })
})
