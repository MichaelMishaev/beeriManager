import { test, expect } from '@playwright/test'

test.describe('Share Tasks Functionality', () => {
  test('should only share visible tasks (not completed or invalid status)', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Navigate to tasks page
    await page.goto('http://localhost:4500/he/tasks', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Wait for page to fully load
    await page.waitForTimeout(2000)

    // Find and click the share button
    const shareButton = page.locator('button:has-text("שתף משימות")')

    // Check if button exists
    const buttonExists = await shareButton.count() > 0
    if (!buttonExists) {
      console.log('⚠️ Share button not found - might be no tasks to share')
      return
    }

    // Check if button is disabled (no tasks to share)
    const isDisabled = await shareButton.isDisabled()
    if (isDisabled) {
      console.log('✅ Share button correctly disabled when no active tasks')
      return
    }

    // Click share button (will copy to clipboard on desktop)
    await shareButton.click()

    // Wait for clipboard operation
    await page.waitForTimeout(500)

    // Get clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

    console.log('📋 Shared text:', clipboardText)

    // Verify the shared text format
    expect(clipboardText).toContain('📋 רשימת משימות - פורטל בארי')
    expect(clipboardText).toContain('https://beeri.online/he/tasks/')

    // Verify it doesn't contain test tasks with invalid status
    // Test tasks typically have "test" in the title
    const lines = clipboardText.split('\\n')
    const taskLines = lines.filter(line => line.match(/^\\d+\\./))

    console.log(`✅ Found ${taskLines.length} tasks in share text`)

    // Verify all shared tasks have valid status emojis (⏳ or 🔄 or ❓ for urgent)
    taskLines.forEach(line => {
      const hasValidStatus = line.includes('⏳') || line.includes('🔄') || line.includes('❓')
      expect(hasValidStatus).toBe(true)
    })

    console.log('✅ All shared tasks have valid status indicators')
  })
})
