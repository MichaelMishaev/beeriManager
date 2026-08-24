import { test, expect } from '@playwright/test';

test.describe('PWA service worker update', () => {
  test('should reload the page when a new service worker takes control', async ({ page }) => {
    // regression: see gh#TBD
    // next-pwa activates new service workers via skipWaiting, but an already-open
    // tab/installed PWA keeps running its old JS bundle until something reloads it.
    // ServiceWorkerUpdater must listen for `controllerchange` and reload once.
    await page.goto('/he');

    await page.evaluate(() => {
      (window as any).__reloaded = false
      const originalReload = window.location.reload.bind(window.location)
      ;(window as any).__originalReload = originalReload
      window.location.reload = () => {
        ;(window as any).__reloaded = true
      }
    });

    await page.evaluate(() => {
      navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
    });

    await expect.poll(() => page.evaluate(() => (window as any).__reloaded)).toBe(true);
  });

  test('should not reload more than once for repeated controllerchange events', async ({ page }) => {
    await page.goto('/he');

    await page.evaluate(() => {
      ;(window as any).__reloadCount = 0
      window.location.reload = () => {
        ;(window as any).__reloadCount += 1
      }
    });

    await page.evaluate(() => {
      navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
      navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
      navigator.serviceWorker.dispatchEvent(new Event('controllerchange'))
    });

    await expect.poll(() => page.evaluate(() => (window as any).__reloadCount)).toBe(1);
  });
});
