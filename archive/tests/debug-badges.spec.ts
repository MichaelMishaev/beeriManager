import { test } from '@playwright/test'

test('Debug badge rendering', async ({ page }) => {
  await page.goto('http://localhost:4500/he/protocols/19628a84-8021-4cc7-a456-fce610a598d7')
  await page.waitForLoadState('networkidle')

  // Wait a bit for React hydration
  await page.waitForTimeout(2000)

  // Get the decisions section HTML
  const decisionsSection = page.locator('text=החלטות').locator('..')
  const decisionsHTML = await decisionsSection.innerHTML()

  console.log('\n=== DECISIONS SECTION HTML ===')
  console.log(decisionsHTML.substring(0, 2000))
  console.log('\n')

  // Look for any elements with cursor-pointer class
  const cursorPointerElements = page.locator('[class*="cursor-pointer"]')
  const count = await cursorPointerElements.count()
  console.log(`\nFound ${count} elements with cursor-pointer class`)

  for (let i = 0; i < Math.min(count, 5); i++) {
    const el = cursorPointerElements.nth(i)
    const html = await el.evaluate(node => node.outerHTML)
    console.log(`\nElement ${i + 1}:`)
    console.log(html.substring(0, 300))
  }

  // Check if CheckCircle2 icons are present (from lucide-react)
  const svgIcons = page.locator('svg')
  const svgCount = await svgIcons.count()
  console.log(`\nFound ${svgCount} SVG elements on page`)

  // Look for button or span elements that might be badges
  const buttons = page.locator('button, span[class*="inline-flex"]')
  const buttonCount = await buttons.count()
  console.log(`\nFound ${buttonCount} button/span elements`)

  // Screenshot the decisions section specifically
  await decisionsSection.screenshot({ path: 'tests/screenshots/decisions-section.png' })
})
