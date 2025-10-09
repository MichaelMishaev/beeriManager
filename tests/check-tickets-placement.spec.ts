import { test } from '@playwright/test'

test('Check tickets section placement in DOM', async ({ page }) => {
  await page.goto('http://localhost:4500')
  await page.waitForLoadState('networkidle')

  // Wait for tickets section to render
  await page.waitForTimeout(2000)

  // Find the tickets section
  const ticketsSection = page.locator('text=כרטיסים לאירועים').first()

  if (await ticketsSection.isVisible()) {
    // Get parent elements
    const parent1 = ticketsSection.locator('xpath=ancestor::div[1]')
    const parent2 = ticketsSection.locator('xpath=ancestor::div[2]')
    const parent3 = ticketsSection.locator('xpath=ancestor::div[3]')
    const parent4 = ticketsSection.locator('xpath=ancestor::div[4]')
    const parent5 = ticketsSection.locator('xpath=ancestor::div[5]')

    const classes1 = await parent1.getAttribute('class')
    const classes2 = await parent2.getAttribute('class')
    const classes3 = await parent3.getAttribute('class')
    const classes4 = await parent4.getAttribute('class')
    const classes5 = await parent5.getAttribute('class')

    console.log('Parent 1:', classes1)
    console.log('Parent 2:', classes2)
    console.log('Parent 3:', classes3)
    console.log('Parent 4:', classes4)
    console.log('Parent 5:', classes5)

    // Check if it's in the correct location
    const isInCorrectLocation = classes3?.includes('lg:col-span-2') || classes4?.includes('lg:col-span-2') || classes5?.includes('lg:col-span-2')

    console.log('Is in correct location:', isInCorrectLocation)

    // Take a screenshot
    await page.screenshot({ path: 'tickets-placement.png', fullPage: true })
  } else {
    console.log('Tickets section not visible (no tickets yet)')
  }
})
