import { test } from '@playwright/test'

test.describe('Event Creation', () => {
  test('should create a new event with minimal fields', async ({ page }) => {
    // Navigate to login page first
    await page.goto('http://localhost:4500/he/admin/login')

    // Login (assuming there's a password field)
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'admin123')
    await page.click('button[type="submit"]')

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle')

    // Navigate to new event page
    await page.goto('http://localhost:4500/he/admin/events/new')

    // Wait for page to load
    await page.waitForSelector('input#title')

    // Fill in minimal required fields
    await page.fill('input#title', 'בדיקת אירוע')

    // Set start date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('input#start_date', dateString)

    // Listen to console logs
    page.on('console', msg => {
      console.log('Browser console:', msg.text())
    })

    // Listen to network requests
    page.on('request', request => {
      if (request.url().includes('/api/events')) {
        console.log('Request URL:', request.url())
        console.log('Request method:', request.method())
        console.log('Request body:', request.postData())
      }
    })

    page.on('response', async response => {
      if (response.url().includes('/api/events')) {
        console.log('Response status:', response.status())
        try {
          const body = await response.json()
          console.log('Response body:', JSON.stringify(body, null, 2))
        } catch (e) {
          console.log('Could not parse response body')
        }
      }
    })

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait a bit to see the error
    await page.waitForTimeout(3000)

    // Take a screenshot
    await page.screenshot({ path: 'test-results/event-creation-error.png', fullPage: true })
  })

  test('should create event with all fields', async ({ page }) => {
    // Navigate to login page first
    await page.goto('http://localhost:4500/he/admin/login')

    // Login
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'admin123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForLoadState('networkidle')

    // Navigate to new event page
    await page.goto('http://localhost:4500/he/admin/events/new')

    // Wait for page to load
    await page.waitForSelector('input#title')

    // Fill all fields
    await page.fill('input#title', 'אירוע מלא')
    await page.fill('textarea#description', 'תיאור האירוע')

    // Set dates
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('input#start_date', dateString)
    await page.fill('input#start_time', '10:00')
    await page.fill('input#end_date', dateString)
    await page.fill('input#end_time', '12:00')

    // Set location
    await page.fill('input#location', 'בית הספר')

    // Listen to API calls
    page.on('console', msg => {
      console.log('Browser console:', msg.text())
    })

    page.on('response', async response => {
      if (response.url().includes('/api/events')) {
        console.log('Response status:', response.status())
        const body = await response.json()
        console.log('Response body:', JSON.stringify(body, null, 2))
      }
    })

    // Submit
    await page.click('button[type="submit"]')

    // Wait to see result
    await page.waitForTimeout(3000)

    // Take screenshot
    await page.screenshot({ path: 'test-results/event-creation-full.png', fullPage: true })
  })
})
