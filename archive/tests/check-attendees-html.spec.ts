import { test, expect } from '@playwright/test'

test('Verify attendees section exists in edit page source code', async ({ page }) => {
  // Navigate directly to protocols list to get a protocol ID
  await page.goto('http://localhost:4500/he/protocols')
  await page.waitForLoadState('networkidle')

  // Get first protocol href
  const firstProtocolLink = page.locator('a[href*="/protocols/"]').first()
  const href = await firstProtocolLink.getAttribute('href')

  if (!href) {
    console.log('❌ No protocol found to test')
    return
  }

  // Extract ID from href (format: /he/protocols/[id])
  const protocolId = href.split('/').pop()

  console.log(`✅ Found protocol ID: ${protocolId}`)

  // Navigate to edit page
  const editUrl = `http://localhost:4500/he/admin/protocols/${protocolId}`
  console.log(`🔍 Navigating to: ${editUrl}`)

  await page.goto(editUrl)
  await page.waitForLoadState('networkidle')

  // Get the full page HTML
  const html = await page.content()

  // Check if attendees text exists in HTML
  const hasAttendeesTitle = html.includes('משתתפים')
  const hasAttendeesDescription = html.includes('רשימת המשתתפים בישיבה')
  const hasAttendeesPlaceholder = html.includes('שם המשתתף')
  const hasAddButton = html.includes('הוסף')

  console.log(`✅ "משתתפים" found in HTML: ${hasAttendeesTitle}`)
  console.log(`✅ "רשימת המשתתפים בישיבה" found in HTML: ${hasAttendeesDescription}`)
  console.log(`✅ "שם המשתתף" placeholder found in HTML: ${hasAttendeesPlaceholder}`)
  console.log(`✅ "הוסף" button found in HTML: ${hasAddButton}`)

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/edit-page-attendees-check.png', fullPage: true })
  console.log('📸 Screenshot saved to: tests/screenshots/edit-page-attendees-check.png')

  // Check if Card component with attendees is rendered
  const attendeesCard = page.locator('text=משתתפים *')
  const cardCount = await attendeesCard.count()
  console.log(`✅ Attendees Card count: ${cardCount}`)

  if (cardCount === 0) {
    console.log('❌ ATTENDEES CARD NOT RENDERED!')
    console.log('Searching for all card titles on page...')
    const allCards = await page.locator('[class*="CardTitle"]').allTextContents()
    console.log('📋 All card titles found:', allCards)
  } else {
    console.log('✅ Attendees card is rendered!')

    // Check for input field
    const inputField = page.locator('input[placeholder="שם המשתתף"]')
    const inputCount = await inputField.count()
    console.log(`✅ Input field count: ${inputCount}`)

    // Check for add button
    const addButton = page.locator('button:has-text("הוסף")')
    const buttonCount = await addButton.count()
    console.log(`✅ Add button count: ${buttonCount}`)
  }

  expect(hasAttendeesTitle).toBe(true)
  expect(cardCount).toBeGreaterThan(0)
})
