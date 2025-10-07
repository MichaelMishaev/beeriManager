import { test } from '@playwright/test'

test.describe('Event API Debug', () => {
  test('should debug event creation API call', async ({ page, context }) => {
    // First, let's get an auth token by logging in
    await page.goto('http://localhost:4500/he/admin/events/new')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Take a screenshot to see what page we're on
    await page.screenshot({ path: 'test-results/initial-page.png', fullPage: true })

    // Check if we need to login
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    // If we're on login page, login first
    if (currentUrl.includes('login')) {
      console.log('Need to login first')
      await page.fill('input[type="password"]', 'admin123')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
      await page.goto('http://localhost:4500/he/admin/events/new')
      await page.waitForTimeout(2000)
    }

    // Get cookies
    const cookies = await context.cookies()
    console.log('Cookies:', cookies)

    // Set up request/response logging
    page.on('request', request => {
      if (request.url().includes('/api/events')) {
        console.log('\n=== API REQUEST ===')
        console.log('URL:', request.url())
        console.log('Method:', request.method())
        console.log('Headers:', request.headers())
        const postData = request.postData()
        if (postData) {
          console.log('Body:', postData)
          try {
            const parsed = JSON.parse(postData)
            console.log('Parsed Body:', JSON.stringify(parsed, null, 2))
          } catch (e) {
            console.log('Could not parse body')
          }
        }
      }
    })

    page.on('response', async response => {
      if (response.url().includes('/api/events')) {
        console.log('\n=== API RESPONSE ===')
        console.log('Status:', response.status())
        console.log('Status Text:', response.statusText())
        try {
          const body = await response.json()
          console.log('Response Body:', JSON.stringify(body, null, 2))
        } catch (e) {
          const text = await response.text()
          console.log('Response Text:', text)
        }
      }
    })

    // Listen to console logs from the page
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('API Error') || text.includes('Validation errors') || text.includes('Error')) {
        console.log('Browser Console:', text)
      }
    })

    // Wait for form to load
    await page.waitForSelector('input#title')

    // Fill in minimal fields
    await page.fill('input#title', 'Test Event')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('input#start_date', dateString)

    // Don't fill time - test all-day event

    // Submit
    console.log('\n=== SUBMITTING FORM ===')
    await page.click('button[type="submit"]:has-text("צור אירוע")')

    // Wait to capture the response
    await page.waitForTimeout(5000)

    // Take final screenshot
    await page.screenshot({ path: 'test-results/after-submit.png', fullPage: true })
  })

  test('should test direct API call', async ({ request, context, page }) => {
    // First get auth cookie
    await page.goto('http://localhost:4500/he/admin/events/new')
    await page.waitForTimeout(1000)

    const cookies = await context.cookies()
    const authCookie = cookies.find(c => c.name === 'auth-token')

    console.log('Auth Cookie:', authCookie)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const testData = {
      title: 'Test Event API',
      description: 'Test description',
      event_type: 'general',
      priority: 'normal',
      status: 'draft',
      location: 'Test Location',
      start_datetime: `${tomorrow.toISOString().split('T')[0]}T00:00:00.000Z`,
      end_datetime: null,
      registration_enabled: false,
      max_attendees: null,
      registration_deadline: null,
      requires_payment: false,
      payment_amount: null,
      budget_allocated: null
    }

    console.log('\n=== DIRECT API CALL ===')
    console.log('Request Data:', JSON.stringify(testData, null, 2))

    const response = await request.post('http://localhost:4500/api/events', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie ? `${authCookie.name}=${authCookie.value}` : ''
      },
      data: testData
    })

    console.log('\n=== API RESPONSE ===')
    console.log('Status:', response.status())

    const responseBody = await response.json()
    console.log('Response:', JSON.stringify(responseBody, null, 2))
  })
})
