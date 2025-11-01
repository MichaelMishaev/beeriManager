import { chromium } from 'playwright'

async function verifyEvents() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('🌐 Navigating to homepage...')
  await page.goto('http://localhost:4500/he')

  console.log('⏳ Waiting for page to load...')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  console.log('📸 Taking screenshot...')
  await page.screenshot({ path: '/tmp/homepage-with-events.png', fullPage: true })

  console.log('🔍 Looking for events...')
  const eventsHeading = await page.locator('text=/אירועים|Events/').count()
  console.log(`Found ${eventsHeading} event headings`)

  const eventCards = await page.locator('.event-card, [class*="event"], [class*="Event"]').count()
  console.log(`Found ${eventCards} potential event cards`)

  // Look for specific November event titles
  const novemberEvents = [
    'שיר תקווה',
    'יצחק רבין',
    'מרכז מאיה',
    'בחירות'
  ]

  for (const eventTitle of novemberEvents) {
    const found = await page.locator(`text=${eventTitle}`).count()
    if (found > 0) {
      console.log(`✅ Found event: ${eventTitle}`)
    } else {
      console.log(`❌ NOT found: ${eventTitle}`)
    }
  }

  console.log('\n📄 Page content preview:')
  const bodyText = await page.locator('body').textContent()
  console.log(bodyText?.substring(0, 500))

  console.log('\n✅ Screenshot saved to /tmp/homepage-with-events.png')
  console.log('Browser will stay open for 10 seconds for manual inspection...')
  await page.waitForTimeout(10000)

  await browser.close()
}

verifyEvents()
