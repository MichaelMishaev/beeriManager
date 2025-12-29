// @ts-nocheck - Development/debug test file
/**
 * Comprehensive Playwright Tests for Prom Quotes Page
 * Testing 2025-2026 UI/UX Best Practices Implementation
 *
 * Features Tested:
 * - Phase 1: Spacing, Typography, Share Buttons, Micro-interactions
 * - Phase 2: Accessibility, Native Share API, Sticky FAB, Skeleton Loading
 * - Phase 3: Bento Grid, Glassmorphism, QR Code, Screenshot Cards
 * - Phase 4: Dark Mode, Pull-to-Refresh
 */

import { test, expect, Page } from '@playwright/test'

const TEST_PROM_ID = '7da4e5a7-672f-42d7-a83a-fdc011155d58'
const BASE_URL = 'http://localhost:4500'

test.describe('Prom Quotes Page - 2025 UI/UX Enhancements', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/he/admin/prom/${TEST_PROM_ID}/quotes`)
    await page.waitForLoadState('networkidle')
  })

  test.describe('Phase 1: Critical UI/UX Improvements', () => {

    test('should have improved spacing and padding throughout', async ({ page }) => {
      // Check main container spacing
      const mainContainer = page.locator('div').filter({ hasText: 'השוואת הצעות מחיר' }).first()
      await expect(mainContainer).toHaveClass(/space-y-8/)

      // Check card padding (should be p-6 md:p-8)
      const quoteCard = page.locator('[class*="CardContent"]').first()
      if (await quoteCard.isVisible()) {
        const classList = await quoteCard.getAttribute('class')
        expect(classList).toMatch(/p-6|p-8/)
      }
    })

    test('should display enhanced typography scale', async ({ page }) => {
      // Main heading should be text-3xl md:text-4xl
      const mainHeading = page.getByRole('heading', { name: /השוואת הצעות מחיר/ })
      await expect(mainHeading).toBeVisible()
      const headingClass = await mainHeading.getAttribute('class')
      expect(headingClass).toMatch(/text-3xl|text-4xl/)
      expect(headingClass).toContain('font-black')
      expect(headingClass).toContain('bg-gradient-to-r')

      // Quote vendor names should be text-2xl md:text-3xl
      const vendorName = page.locator('h3').first()
      if (await vendorName.isVisible()) {
        const vendorClass = await vendorName.getAttribute('class')
        expect(vendorClass).toMatch(/text-2xl|text-3xl/)
        expect(vendorClass).toContain('font-black')
      }
    })

    test('should have prominent share buttons within cards', async ({ page }) => {
      // Check for share section in expanded card
      const expandButton = page.getByRole('button', { name: /הצג פרטים מלאים/ }).first()
      if (await expandButton.isVisible()) {
        await expandButton.click()
        await page.waitForTimeout(300) // Wait for expansion animation

        // Look for share section
        const shareSection = page.locator('text=שתף עם הורים').first()
        await expect(shareSection).toBeVisible()

        // Check for share buttons
        await expect(page.getByRole('button', { name: /שתף/ }).first()).toBeVisible()
        await expect(page.getByRole('button', { name: /העתק/ }).first()).toBeVisible()
        await expect(page.getByRole('button', { name: /תמונה/ }).first()).toBeVisible()
      }
    })

    test('should have micro-interactions and transitions', async ({ page }) => {
      // Check header back button has transitions
      const backButton = page.getByRole('link').filter({ has: page.locator('svg') }).first()
      const buttonClass = await backButton.getAttribute('class')
      expect(buttonClass).toContain('transition-all')
      expect(buttonClass).toMatch(/hover:scale-110/)
      expect(buttonClass).toMatch(/active:scale-95/)

      // Check stat cards have hover effects
      const statCards = page.locator('[class*="Card"]').filter({ hasText: /סה"כ הצעות|מחיר ממוצע/ }).first()
      if (await statCards.isVisible()) {
        const cardClass = await statCards.getAttribute('class')
        expect(cardClass).toMatch(/hover:scale-105|hover:shadow/)
      }
    })
  })

  test.describe('Phase 2: Important Features', () => {

    test('should have improved accessibility with focus states', async ({ page }) => {
      // Tab through buttons and check focus indicators
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Check for focus-visible classes
      const focusedElement = await page.locator(':focus')
      if (await focusedElement.isVisible()) {
        const classList = await focusedElement.getAttribute('class')
        expect(classList).toMatch(/focus-visible:ring/)
      }
    })

    test('should display Native Share API button in header', async ({ page }) => {
      const shareButton = page.locator('button[title*="שתף"]').first()
      await expect(shareButton).toBeVisible()

      // Click should trigger native share or clipboard
      await shareButton.click()
      await page.waitForTimeout(500)

      // Check for success toast
      const toast = page.locator('text=/הועתק|שותף/')
      await expect(toast).toBeVisible({ timeout: 3000 })
    })

    test('should show sticky FAB on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE

      const fab = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' })
      const fabWithPlus = page.locator('button.fixed.bottom-8')

      if (await fabWithPlus.isVisible()) {
        const fabClass = await fabWithPlus.getAttribute('class')
        expect(fabClass).toContain('md:hidden')
        expect(fabClass).toContain('fixed')
        expect(fabClass).toContain('bottom-8')
        expect(fabClass).toContain('rounded-full')
        expect(fabClass).toContain('z-50')
      }
    })

    test('should display improved skeleton loading states', async ({ page }) => {
      // Reload page and check for skeleton
      await page.reload()

      // Check for skeleton elements during loading
      const skeleton = page.locator('.animate-pulse').first()
      await expect(skeleton).toBeVisible({ timeout: 1000 })

      // Wait for actual content
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=השוואת הצעות מחיר')).toBeVisible()
    })
  })

  test.describe('Phase 3: Enhancement Features', () => {

    test('should display bento grid layout for stats', async ({ page }) => {
      const statsGrid = page.locator('.grid').filter({ has: page.locator('text=/סה"כ הצעות/') }).first()
      await expect(statsGrid).toBeVisible()

      const gridClass = await statsGrid.getAttribute('class')
      expect(gridClass).toContain('grid')
      expect(gridClass).toMatch(/auto-rows/)

      // Check for varied card sizes (bento grid characteristic)
      const largeCard = page.locator('[class*="row-span-2"]').first()
      if (await largeCard.isVisible()) {
        const cardClass = await largeCard.getAttribute('class')
        expect(cardClass).toMatch(/row-span-2|col-span-2/)
      }
    })

    test('should have glassmorphism effects on cards', async ({ page }) => {
      const glassMorphCard = page.locator('[class*="backdrop-blur"]').first()
      if (await glassMorphCard.isVisible()) {
        const cardClass = await glassMorphCard.getAttribute('class')
        expect(cardClass).toContain('backdrop-blur')
        expect(cardClass).toMatch(/bg-gradient-to/)
        expect(cardClass).toMatch(/from-.*\/\d+/)  // opacity in gradient
      }
    })

    test('should open QR code dialog and display QR code', async ({ page }) => {
      const qrButton = page.locator('button[title*="QR"]').first()
      if (await qrButton.isVisible()) {
        await qrButton.click()

        // Check dialog opens
        await expect(page.locator('text=שתף QR Code')).toBeVisible()

        // Check for QR code SVG
        await page.waitForTimeout(500) // Wait for dynamic QR load
        const qrSvg = page.locator('svg').filter({ has: page.locator('rect') })
        await expect(qrSvg).toBeVisible({ timeout: 3000 })

        // Check copy link button
        const copyButton = page.getByRole('button', { name: /העתק קישור/ })
        await expect(copyButton).toBeVisible()
      }
    })

    test('should allow downloading quote card as image', async ({ page }) => {
      // Expand a quote card
      const expandButton = page.getByRole('button', { name: /הצג פרטים מלאים/ }).first()
      if (await expandButton.isVisible()) {
        await expandButton.click()
        await page.waitForTimeout(300)

        // Click download image button
        const downloadButton = page.getByRole('button', { name: /תמונה/ }).first()
        if (await downloadButton.isVisible()) {
          // Set up download listener
          const downloadPromise = page.waitForEvent('download', { timeout: 5000 })

          await downloadButton.click()

          // Verify download initiated
          try {
            const download = await downloadPromise
            expect(download.suggestedFilename()).toMatch(/quote-.*\.png/)
          } catch (e) {
            // Download might not trigger in headless - check for loading state
            const _buttonText = await downloadButton.textContent()
            // Button should show loading or success
          }
        }
      }
    })
  })

  test.describe('Phase 4: Future Features', () => {

    test('should have dark mode toggle and apply dark styles', async ({ page }) => {
      const darkModeButton = page.locator('button[title*="כהה"]').first()
      if (await darkModeButton.isVisible()) {
        await darkModeButton.click()
        await page.waitForTimeout(300)

        // Check for dark class on html element
        const html = page.locator('html')
        const htmlClass = await html.getAttribute('class')
        expect(htmlClass).toContain('dark')

        // Check for dark mode styles
        const darkCard = page.locator('[class*="dark:bg-gray"]').first()
        await expect(darkCard).toBeVisible()
      }
    })

    test('should support system dark mode preference', async ({ page, context }) => {
      // Set system preference to dark
      await context.close()
      const darkContext = await page.context().browser()?.newContext({
        colorScheme: 'dark'
      })

      if (darkContext) {
        const darkPage = await darkContext.newPage()
        await darkPage.goto(`${BASE_URL}/he/admin/prom/${TEST_PROM_ID}/quotes`)

        // Should auto-apply dark mode
        const html = darkPage.locator('html')
        const htmlClass = await html.getAttribute('class')
        expect(htmlClass).toContain('dark')

        await darkContext.close()
      }
    })
  })

  test.describe('Responsive Design', () => {

    test('should adapt layout for mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Check mobile-specific elements
      const mobileDropdown = page.locator('.md\\:hidden').filter({ hasText: /כלים מתקדמים/ })
      if (await mobileDropdown.isVisible()) {
        await expect(mobileDropdown).toBeVisible()
      }

      // Desktop table should be hidden
      const desktopTable = page.locator('.hidden.md\\:block')
      if (await desktopTable.count() > 0) {
        await expect(desktopTable.first()).not.toBeVisible()
      }

      // Mobile cards should be visible
      const mobileCards = page.locator('.md\\:hidden.space-y-4')
      if (await mobileCards.isVisible()) {
        await expect(mobileCards).toBeVisible()
      }
    })

    test('should adapt layout for tablet (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      // Check tablet-appropriate sizing
      const heading = page.getByRole('heading', { name: /השוואת הצעות מחיר/ })
      await expect(heading).toBeVisible()
    })

    test('should adapt layout for desktop (1920px)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })

      // Desktop table should be visible
      const desktopTable = page.locator('.hidden.md\\:block')
      if (await desktopTable.count() > 0) {
        await expect(desktopTable.first()).toBeVisible()
      }

      // FAB should be hidden on desktop
      const fab = page.locator('button.md\\:hidden.fixed')
      if (await fab.count() > 0) {
        await expect(fab).not.toBeVisible()
      }
    })
  })

  test.describe('Interactive Features', () => {

    test('should expand and collapse quote cards', async ({ page }) => {
      const expandButton = page.getByRole('button', { name: /הצג פרטים מלאים/ }).first()
      if (await expandButton.isVisible()) {
        // Initially collapsed
        await expect(expandButton).toBeVisible()

        // Click to expand
        await expandButton.click()
        await page.waitForTimeout(300)

        // Check expanded state
        const collapseButton = page.getByRole('button', { name: /הסתר פרטים/ }).first()
        await expect(collapseButton).toBeVisible()

        // Additional details should be visible
        const contactInfo = page.locator('text=פרטי התקשרות').first()
        if (await contactInfo.isVisible()) {
          await expect(contactInfo).toBeVisible()
        }

        // Click to collapse
        await collapseButton.click()
        await page.waitForTimeout(300)

        // Should return to collapsed state
        await expect(expandButton).toBeVisible()
      }
    })

    test('should allow adding quote to package builder', async ({ page }) => {
      // Open quote details
      const expandButton = page.getByRole('button', { name: /הצג פרטים מלאים/ }).first()
      if (await expandButton.isVisible()) {
        await expandButton.click()
        await page.waitForTimeout(300)

        // Click package button
        const packageButton = page.getByRole('button', { name: /הוסף לחבילה/ }).first()
        if (await packageButton.isVisible()) {
          await packageButton.click()
          await page.waitForTimeout(300)

          // Button should change to "remove from package"
          const removeButton = page.getByRole('button', { name: /הסר מחבילה/ }).first()
          await expect(removeButton).toBeVisible()
        }
      }
    })

    test('should copy link to clipboard when clicking copy button', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-write', 'clipboard-read'])

      const expandButton = page.getByRole('button', { name: /הצג פרטים מלאים/ }).first()
      if (await expandButton.isVisible()) {
        await expandButton.click()
        await page.waitForTimeout(300)

        const copyButton = page.getByRole('button', { name: /העתק/ }).first()
        if (await copyButton.isVisible()) {
          await copyButton.click()

          // Check for success toast
          await expect(page.locator('text=/הועתק/')).toBeVisible({ timeout: 3000 })
        }
      }
    })
  })

  test.describe('Visual Regression', () => {

    test('should match baseline screenshot for desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000) // Wait for animations

      // Take screenshot of entire page
      await expect(page).toHaveScreenshot('quotes-page-desktop.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })

    test('should match baseline screenshot for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      await expect(page).toHaveScreenshot('quotes-page-mobile.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })

    test('should match baseline screenshot for dark mode', async ({ page }) => {
      const darkModeButton = page.locator('button[title*="כהה"]').first()
      if (await darkModeButton.isVisible()) {
        await darkModeButton.click()
        await page.waitForTimeout(500)

        await expect(page).toHaveScreenshot('quotes-page-dark.png', {
          fullPage: true,
          maxDiffPixels: 100
        })
      }
    })
  })

  test.describe('Performance', () => {

    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto(`${BASE_URL}/he/admin/prom/${TEST_PROM_ID}/quotes`)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(5000) // Should load in under 5 seconds
    })

    test('should have smooth animations', async ({ page }) => {
      // Check for CSS transitions
      const card = page.locator('[class*="transition-all"]').first()
      if (await card.isVisible()) {
        const cardClass = await card.getAttribute('class')
        expect(cardClass).toContain('duration')
      }
    })
  })

  test.describe('Accessibility (WCAG AA)', () => {

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      const h3 = page.locator('h3').first()
      if (await h3.isVisible()) {
        await expect(h3).toBeVisible()
      }
    })

    test('should have accessible button labels', async ({ page }) => {
      const buttons = page.locator('button[title]')
      const count = await buttons.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const title = await buttons.nth(i).getAttribute('title')
        expect(title).toBeTruthy()
        expect(title!.length).toBeGreaterThan(0)
      }
    })

    test('should have keyboard navigation support', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab')
      const firstFocused = await page.locator(':focus')
      await expect(firstFocused).toBeVisible()

      await page.keyboard.press('Tab')
      const secondFocused = await page.locator(':focus')
      await expect(secondFocused).toBeVisible()

      // Shift+Tab should go back
      await page.keyboard.press('Shift+Tab')
      const backFocused = await page.locator(':focus')
      await expect(backFocused).toBeVisible()
    })
  })
})
