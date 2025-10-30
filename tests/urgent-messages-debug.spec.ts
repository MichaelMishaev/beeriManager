import { test, expect } from '@playwright/test'

test.describe('Urgent Messages - Debug Save Issue', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:4500/login')
    await page.fill('input[type="password"]', 'admin1')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin')
  })

  test('Debug: Create urgent message and verify save', async ({ page }) => {
    console.log('=== Starting Urgent Message Save Test ===')

    // Navigate to urgent messages page
    await page.goto('http://localhost:4500/he/admin/urgent')
    await page.waitForLoadState('networkidle')
    console.log('✅ Navigated to urgent messages page')

    // Check initial state
    const initialMessages = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Initial message count: ${initialMessages}`)

    // Click "Add Message" button
    await page.click('button:has-text("הוסף הודעה")')
    console.log('✅ Clicked add message button')

    // Wait for form to appear
    await page.waitForSelector('input[placeholder*="כותרת"]', { timeout: 3000 })
    console.log('✅ Form appeared')

    // Fill in the form
    await page.fill('input[placeholder*="כותרת"]', 'תזכורת בדיקה')
    await page.fill('textarea[placeholder*="תיאור"]', 'זוהי הודעת בדיקה לוודא ששמירה עובדת')
    console.log('✅ Filled form fields')

    // Listen for API requests
    const saveRequest = page.waitForRequest(request =>
      request.url().includes('/api/urgent-messages/save') && request.method() === 'POST'
    )
    const saveResponse = page.waitForResponse(response =>
      response.url().includes('/api/urgent-messages/save')
    )

    // Click save button
    console.log('💾 Clicking save button...')
    await page.click('button:has-text("שמור שינויים")')

    // Wait for save request/response
    try {
      const [req, res] = await Promise.all([saveRequest, saveResponse])
      const requestBody = req.postDataJSON()
      const responseBody = await res.json()

      console.log('\n📤 Request Body:')
      console.log(JSON.stringify(requestBody, null, 2))

      console.log('\n📥 Response Status:', res.status())
      console.log('📥 Response Body:')
      console.log(JSON.stringify(responseBody, null, 2))

      // Verify response
      expect(res.status()).toBe(200)
      expect(responseBody.success).toBe(true)
      console.log('✅ Save request successful')

    } catch (error) {
      console.error('❌ Save request failed:', error)
      throw error
    }

    // Wait for success toast
    try {
      await page.waitForSelector('text=נשמרו בהצלחה', { timeout: 3000 })
      console.log('✅ Success toast appeared')
    } catch {
      console.log('⚠️ No success toast (might be a timing issue)')
    }

    // Wait a bit for database to update
    await page.waitForTimeout(1000)

    // Reload page to verify persistence
    console.log('\n🔄 Reloading page to verify persistence...')
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check if message persisted
    const finalMessages = await page.locator('[data-testid="urgent-message-card"]').count()
    console.log(`📊 Final message count: ${finalMessages}`)

    // Take screenshot
    await page.screenshot({ path: 'urgent-messages-after-reload.png', fullPage: true })
    console.log('📸 Screenshot saved: urgent-messages-after-reload.png')

    // Look for our message
    const ourMessage = page.locator('text=תזכורת בדיקה')
    const isVisible = await ourMessage.isVisible()
    console.log(`🔍 Message "תזכורת בדיקה" visible: ${isVisible}`)

    if (!isVisible) {
      console.error('❌ Message NOT found after reload - NOT PERSISTED TO DATABASE')

      // Debug: Check what's in the database
      console.log('\n🔍 Checking database via API...')
      const apiResponse = await page.request.get('http://localhost:4500/api/urgent-messages?all=true')
      const apiData = await apiResponse.json()
      console.log('Database content:')
      console.log(JSON.stringify(apiData, null, 2))

      throw new Error('Message was not persisted to database')
    }

    console.log('✅ Message persisted successfully')
    expect(finalMessages).toBeGreaterThan(initialMessages)
  })

  test('Debug: Check API directly', async ({ page, request }) => {
    console.log('=== Testing API Directly ===')

    // Get auth cookie
    await page.goto('http://localhost:4500/he/admin/urgent')
    const cookies = await page.context().cookies()
    const authCookie = cookies.find(c => c.name === 'auth-token')
    console.log('🍪 Auth cookie:', authCookie?.value ? 'Found' : 'Not found')

    // Test save API directly
    const testMessage = {
      messages: [{
        id: Date.now().toString(),
        type: 'info',
        title_he: 'API Test ' + Date.now(),
        title_ru: 'API Test ' + Date.now(),
        description_he: 'Testing API directly',
        description_ru: 'Тестирование API напрямую',
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        icon: 'ℹ️',
        color: 'bg-blue-50',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]
    }

    console.log('\n📤 Sending test message to API...')
    const saveResponse = await request.post('http://localhost:4500/api/urgent-messages/save', {
      data: testMessage,
      headers: {
        'Cookie': `auth-token=${authCookie?.value}`
      }
    })

    const saveResult = await saveResponse.json()
    console.log('📥 API Response Status:', saveResponse.status())
    console.log('📥 API Response Body:', JSON.stringify(saveResult, null, 2))

    expect(saveResponse.status()).toBe(200)
    expect(saveResult.success).toBe(true)

    // Check if it's in the database
    await page.waitForTimeout(1000)
    const getResponse = await request.get('http://localhost:4500/api/urgent-messages?all=true', {
      headers: {
        'Cookie': `auth-token=${authCookie?.value}`
      }
    })
    const getData = await getResponse.json()
    console.log('\n📊 Messages in database:', getData.data?.length || 0)
    console.log('📋 Database content:', JSON.stringify(getData, null, 2))
  })
})
