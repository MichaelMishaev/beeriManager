import { Page, expect } from '@playwright/test';

export class HebrewHelper {
  constructor(private page: Page) {}

  /**
   * Verify that Hebrew text is displayed correctly with RTL direction
   */
  async verifyHebrewText(selector: string, expectedText: string) {
    const element = this.page.locator(selector);
    await expect(element).toHaveText(expectedText);

    // Check RTL direction
    const direction = await element.evaluate(el => window.getComputedStyle(el).direction);
    expect(direction).toBe('rtl');
  }

  /**
   * Fill Hebrew text in form fields
   */
  async fillHebrewText(selector: string, text: string) {
    await this.page.fill(selector, text);
    // Verify text was entered correctly
    await expect(this.page.locator(selector)).toHaveValue(text);
  }

  /**
   * Verify Hebrew date formatting
   */
  async verifyHebrewDate(selector: string, expectedFormat: RegExp = /\d{1,2} ב[א-ת]+ \d{4}/) {
    const dateText = await this.page.locator(selector).textContent();
    expect(dateText).toMatch(expectedFormat);
  }

  /**
   * Check if page layout is properly RTL
   */
  async verifyRTLLayout() {
    const htmlDir = await this.page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    // Check if navigation is on the right side
    const nav = this.page.locator('nav').first();
    const position = await nav.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > window.innerWidth / 2;
    });
    expect(position).toBe(true);
  }

  /**
   * Test Hebrew keyboard input
   */
  async testHebrewKeyboard(inputSelector: string) {
    await this.page.focus(inputSelector);

    // Type Hebrew characters
    await this.page.keyboard.type('שלום עולם');

    const value = await this.page.inputValue(inputSelector);
    expect(value).toBe('שלום עולם');
  }
}