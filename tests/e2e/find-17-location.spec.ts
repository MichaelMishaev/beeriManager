import { test } from '@playwright/test'

test('Find exact location of "17" elements', async ({ page }) => {
  await page.goto('http://localhost:4500')
  await page.waitForLoadState('networkidle')

  // Find all "17" elements
  const seventeens = await page.locator('text=/^17$/').all()

  console.log(`\n=== Found ${seventeens.length} instances of "17" ===\n`)

  for (let i = 0; i < seventeens.length; i++) {
    const element = seventeens[i]

    // Get full ancestor chain
    const ancestors = await element.evaluate((el) => {
      const chain = []
      let current = el
      while (current && current !== document.body) {
        const classes = current.className || ''
        const id = current.id ? `#${current.id}` : ''
        const tag = current.tagName.toLowerCase()
        chain.push(`${tag}${id}${classes ? '.' + classes.split(' ').join('.') : ''}`)
        current = current.parentElement
      }
      return chain
    })

    // Get surrounding context
    const parent5 = await element.locator('xpath=ancestor::*[5]').first()
    const parent5Html = await parent5.innerHTML().catch(() => 'N/A')

    // Get bounding box to understand position
    const box = await element.boundingBox()

    console.log(`\n--- Instance ${i + 1} of "17" ---`)
    console.log('Position:', box)
    console.log('Ancestor chain:', ancestors.join(' > '))
    console.log('5th parent HTML (truncated):', parent5Html.substring(0, 500))
  }

  // Take full page screenshot
  await page.screenshot({
    path: '/Users/michaelmishayev/Desktop/full-page-with-17.png',
    fullPage: true
  })

  console.log('\n✅ Full page screenshot saved to: /Users/michaelmishayev/Desktop/full-page-with-17.png')
})
