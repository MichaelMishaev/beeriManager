const { chromium } = require('playwright');

async function measurePerformance() {
  console.log('🚀 Starting performance measurement for https://beeri.online/he\n');

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect performance metrics
  const metrics = {
    startTime: Date.now(),
    navigationStart: null,
    domContentLoaded: null,
    loadComplete: null,
    timeToInteractive: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    errors: [],
    networkRequests: [],
    slowRequests: []
  };

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      metrics.errors.push(msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    metrics.errors.push(error.message);
  });

  // Monitor network requests
  const requestStartTimes = new Map();

  page.on('request', request => {
    requestStartTimes.set(request.url(), Date.now());
  });

  page.on('response', async (response) => {
    const request = response.request();
    const startTime = requestStartTimes.get(request.url()) || Date.now();
    const duration = Date.now() - startTime;

    let size = 0;
    try {
      const body = await response.body();
      size = body.length;
    } catch (e) {
      // Some responses can't be read
    }

    const requestInfo = {
      url: request.url(),
      method: request.method(),
      status: response.status(),
      duration: Math.round(duration),
      size: size
    };

    metrics.networkRequests.push(requestInfo);

    // Flag slow requests (> 1 second)
    if (duration > 1000) {
      metrics.slowRequests.push(requestInfo);
    }
  });

  console.log('📡 Navigating to https://beeri.online/he...');
  const navigationPromise = page.goto('https://beeri.online/he', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Measure navigation timing
  metrics.navigationStart = Date.now();

  try {
    await navigationPromise;
    metrics.loadComplete = Date.now() - metrics.navigationStart;
    console.log(`✅ Page loaded in ${metrics.loadComplete}ms`);
  } catch (error) {
    console.error('❌ Navigation failed:', error.message);
    metrics.errors.push(`Navigation timeout: ${error.message}`);
  }

  // Get Web Vitals using Performance API
  try {
    const performanceMetrics = await page.evaluate(() => {
      return {
        navigationTiming: performance.timing,
        resourceTiming: performance.getEntriesByType('resource').map(r => ({
          name: r.name,
          duration: r.duration,
          transferSize: r.transferSize,
          type: r.initiatorType
        })),
        paintTiming: performance.getEntriesByType('paint').map(p => ({
          name: p.name,
          startTime: p.startTime
        }))
      };
    });

    // Calculate key metrics
    const timing = performanceMetrics.navigationTiming;
    metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    metrics.firstContentfulPaint = performanceMetrics.paintTiming.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    console.log('\n📊 Performance Metrics:');
    console.log('─────────────────────────────────────');
    console.log(`DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`);
    console.log(`Load Complete: ${Math.round(metrics.loadComplete)}ms`);

  } catch (error) {
    console.error('❌ Failed to get performance metrics:', error.message);
  }

  // Check if content is actually loaded (not stuck in loading state)
  const isLoading = await page.evaluate(() => {
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    const loadingText = document.body.innerText.includes('טוען');
    return {
      hasSkeletons: skeletons.length > 0,
      loadingText: loadingText,
      bodyText: document.body.innerText.substring(0, 200)
    };
  });

  console.log('\n🔍 Content Loading Status:');
  console.log('─────────────────────────────────────');
  console.log(`Skeleton loaders present: ${isLoading.hasSkeletons}`);
  console.log(`Loading text present: ${isLoading.loadingText}`);
  console.log(`Page content preview: ${isLoading.bodyText}`);

  // Network summary
  console.log('\n🌐 Network Summary:');
  console.log('─────────────────────────────────────');
  console.log(`Total requests: ${metrics.networkRequests.length}`);
  console.log(`Slow requests (>1s): ${metrics.slowRequests.length}`);

  if (metrics.slowRequests.length > 0) {
    console.log('\n⚠️  Slow Requests:');
    metrics.slowRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
      console.log(`    Duration: ${req.duration}ms | Status: ${req.status} | Size: ${Math.round(req.size / 1024)}KB`);
    });
  }

  // Group requests by type
  const requestsByType = {};
  metrics.networkRequests.forEach(req => {
    const ext = req.url.split('.').pop().split('?')[0];
    requestsByType[ext] = requestsByType[ext] || [];
    requestsByType[ext].push(req);
  });

  console.log('\n📦 Requests by Type:');
  Object.entries(requestsByType).forEach(([type, reqs]) => {
    const totalSize = reqs.reduce((sum, r) => sum + r.size, 0);
    const avgDuration = reqs.reduce((sum, r) => sum + r.duration, 0) / reqs.length;
    console.log(`  ${type}: ${reqs.length} requests, ${Math.round(totalSize / 1024)}KB total, ${Math.round(avgDuration)}ms avg`);
  });

  // Errors
  if (metrics.errors.length > 0) {
    console.log('\n❌ Errors Found:');
    console.log('─────────────────────────────────────');
    metrics.errors.forEach(error => {
      console.log(`  ${error}`);
    });
  }

  // Take screenshot
  await page.screenshot({ path: 'scripts/performance-screenshot.png', fullPage: true });
  console.log('\n📸 Screenshot saved to scripts/performance-screenshot.png');

  await browser.close();

  // Final assessment
  console.log('\n🎯 Assessment:');
  console.log('─────────────────────────────────────');
  if (isLoading.hasSkeletons) {
    console.log('❌ CRITICAL: Page stuck in loading state!');
  }
  if (metrics.loadComplete > 3000) {
    console.log('⚠️  WARNING: Page load time exceeds 3 seconds');
  }
  if (metrics.slowRequests.length > 3) {
    console.log(`⚠️  WARNING: ${metrics.slowRequests.length} slow network requests detected`);
  }
  if (metrics.errors.length > 0) {
    console.log(`❌ CRITICAL: ${metrics.errors.length} JavaScript errors detected`);
  }

  return metrics;
}

measurePerformance().catch(console.error);
