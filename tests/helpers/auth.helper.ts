import { Page, BrowserContext } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async loginAsAdmin(password: string = process.env.ADMIN_PASSWORD || 'test-password') {
    await this.page.goto('/login');
    await this.page.waitForSelector('input[type="password"]');
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/admin');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/');
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="admin-nav"]', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

export async function createAuthenticatedContext(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    // Add auth token to localStorage if needed
    localStorage.setItem('auth-token', 'test-token');
  });
}