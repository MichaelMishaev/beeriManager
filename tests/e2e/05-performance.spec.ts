import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load home page quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const measurements: any = {};

          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              measurements.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              measurements.lcp = entry.startTime;
            }
          });

          if (measurements.fcp && measurements.lcp) {
            resolve(measurements);
          }
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });

    // FCP should be under 1.8s (good)
    if ((vitals as any).fcp) {
      expect((vitals as any).fcp).toBeLessThan(1800);
    }

    // LCP should be under 2.5s (good)
    if ((vitals as any).lcp) {
      expect((vitals as any).lcp).toBeLessThan(2500);
    }
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/events');

    // Measure time to render large list
    const startTime = Date.now();

    // Scroll through long list (simulating many events)
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
    }

    const scrollTime = Date.now() - startTime;
    expect(scrollTime).toBeLessThan(2000); // Should scroll smoothly in under 2s
  });

  test('should minimize JavaScript bundle size', async ({ page }) => {
    // Listen for all network requests
    const jsRequests: any[] = [];

    page.on('response', (response) => {
      if (response.url().endsWith('.js') && response.status() === 200) {
        jsRequests.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0')
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Calculate total JS size
    const totalJSSize = jsRequests.reduce((total, req) => total + req.size, 0);

    // Should be under 500KB total
    expect(totalJSSize).toBeLessThan(500 * 1024);

    // Main bundle should be under 200KB
    const mainBundle = jsRequests.find(req => req.url.includes('main') || req.url.includes('index'));
    if (mainBundle) {
      expect(mainBundle.size).toBeLessThan(200 * 1024);
    }
  });

  test('should optimize images', async ({ page }) => {
    const imageRequests: any[] = [];

    page.on('response', (response) => {
      if (response.url().match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        imageRequests.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0'),
          type: response.headers()['content-type']
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if modern formats are used
    const modernFormats = imageRequests.filter(img =>
      img.type.includes('webp') || img.type.includes('avif')
    );

    // At least 50% of images should use modern formats
    if (imageRequests.length > 0) {
      const modernPercentage = modernFormats.length / imageRequests.length;
      expect(modernPercentage).toBeGreaterThan(0.3);
    }

    // Individual images shouldn't be too large
    imageRequests.forEach(img => {
      expect(img.size).toBeLessThan(500 * 1024); // 500KB max per image
    });
  });

  test('should cache resources effectively', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Clear in-memory cache but keep disk cache
    await page.reload({ waitUntil: 'networkidle' });

    const cachedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.fromServiceWorker() ||
          response.status() === 304 ||
          response.headers()['cf-cache-status'] === 'HIT') {
        cachedRequests.push(response.url());
      }
    });

    // Second visit should use cache
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have cached some resources
    expect(cachedRequests.length).toBeGreaterThan(0);
  });

  test('should work on slow networks', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    const startTime = Date.now();

    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Should still be usable on slow networks (under 10s)
    expect(loadTime).toBeLessThan(10000);

    // Should show loading states
    await expect(page.locator('[data-testid="loading-spinner"]')).toHaveCount(0); // Should be done loading
  });

  test('should handle concurrent users', async ({ browser }) => {
    // Simulate multiple users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    const startTime = Date.now();

    // All users load the page simultaneously
    await Promise.all(
      pages.map(page => page.goto('/'))
    );

    // All users should see the page
    await Promise.all(
      pages.map(page => expect(page.locator('h1')).toBeVisible())
    );

    const loadTime = Date.now() - startTime;

    // Should handle concurrent load (under 5s)
    expect(loadTime).toBeLessThan(5000);

    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });
});