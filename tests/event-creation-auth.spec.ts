import { test } from '@playwright/test'

test.describe('Event Creation with Auth', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:4500/he/login')
    await page.waitForSelector('input#password')
    await page.fill('input#password', 'admin1')
    await page.click('button[type="submit"]')

    // Wait for redirect to admin page
    await page.waitForURL('**/admin**', { timeout: 5000 })
  })

  test('should create event with minimal fields and debug 400 error', async ({ page }) => {
    // Set up comprehensive logging
    page.on('console', msg => {
      console.log('BROWSER CONSOLE:', msg.text())
    })

    page.on('request', request => {
      if (request.url().includes('/api/events')) {
        console.log('\n=== REQUEST TO /api/events ===')
        console.log('Method:', request.method())
        const postData = request.postData()
        if (postData) {
          console.log('Request Body:')
          console.log(postData)
          try {
            const parsed = JSON.parse(postData)
            console.log('Parsed:')
            console.log(JSON.stringify(parsed, null, 2))
          } catch (e) {
            console.log('Could not parse')
          }
        }
      }
    })

    page.on('response', async response => {
      if (response.url().includes('/api/events')) {
        console.log('\n=== RESPONSE FROM /api/events ===')
        console.log('Status:', response.status())
        try {
          const body = await response.json()
          console.log('Response Body:')
          console.log(JSON.stringify(body, null, 2))
        } catch (e) {
          const text = await response.text()
          console.log('Response Text:', text)
        }
      }
    })

    // Navigate to new event page
    await page.goto('http://localhost:4500/he/admin/events/new')
    await page.waitForSelector('input#title')

    // Fill minimal fields
    await page.fill('input#title', 'Test Event')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('input#start_date', dateString)

    console.log('\n=== SUBMITTING FORM ===')

    // Submit form
    await page.click('button[type="submit"]:has-text("צור אירוע")')

    // Wait for response
    await page.waitForTimeout(3000)

    // Take screenshot
    await page.screenshot({ path: 'test-results/event-creation-authenticated.png', fullPage: true })
  })

  test('should create event with time specified', async ({ page }) => {
    page.on('console', msg => {
      console.log('BROWSER:', msg.text())
    })

    page.on('response', async response => {
      if (response.url().includes('/api/events')) {
        console.log('Response Status:', response.status())
        const body = await response.json()
        console.log('Response:', JSON.stringify(body, null, 2))
      }
    })

    await page.goto('http://localhost:4500/he/admin/events/new')
    await page.waitForSelector('input#title')

    await page.fill('input#title', 'Timed Event')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]

    await page.fill('input#start_date', dateString)
    await page.fill('input#start_time', '10:00')

    console.log('\n=== SUBMITTING WITH TIME ===')
    await page.click('button[type="submit"]:has-text("צור אירוע")')

    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test-results/event-with-time.png', fullPage: true })
  })
})
