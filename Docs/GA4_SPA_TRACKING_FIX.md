# GA4 SPA Tracking Fix - Implementation Report

## Problem Identified

### Symptoms
- ✅ Google Analytics receiving data (13 active users, 166 events)
- ❌ **100% bounce rate** across all pages
- ❌ Only 3 page views tracked despite 13 active users
- ❌ Users appearing to visit only one page

### Root Cause
**Next.js App Router uses client-side navigation (SPA behavior), but GA4 was only tracking initial page loads.**

When users navigate between pages in a Next.js App Router application:
1. No full page reload occurs
2. Only the content changes via React
3. Google Analytics doesn't see this as a new page view
4. Result: GA thinks users only visit one page = 100% bounce rate

## Solution Implemented

### 1. Created `RouteChangeTracker` Component
**File**: `src/components/analytics/RouteChangeTracker.tsx`

**What it does**:
- Monitors route changes using Next.js `usePathname()` and `useSearchParams()` hooks
- Automatically tracks every client-side navigation
- Sends `page_view` events to GA4 on every route change
- Detects user type (admin/user/anonymous) for better segmentation
- Includes query parameters in tracked URLs

**Key Features**:
```typescript
- Tracks pathname changes (e.g., /admin → /events)
- Tracks search param changes (e.g., /tasks → /tasks?status=active)
- Sends user_type with every page view
- Works in both production and development (console logs in dev)
```

### 2. Updated `GoogleAnalytics` Component
**File**: `src/components/analytics/GoogleAnalytics.tsx`

**Changes**:
1. ✅ Added `RouteChangeTracker` to component tree
2. ✅ Disabled automatic `send_page_view` in gtag config
3. ✅ All page views now handled manually via `RouteChangeTracker`
4. ✅ Consistent tracking for both initial load and route changes

**Why disable automatic page_view?**
- Prevents duplicate tracking on initial load
- Ensures all page views go through our custom tracker
- Gives us full control over what data is sent

### 3. Configuration Change
```javascript
// Before (automatic tracking)
gtag('config', 'G-9RS38VPXEZ', {
  send_page_view: true  // ❌ Only tracks initial load
});

// After (manual tracking)
gtag('config', 'G-9RS38VPXEZ', {
  send_page_view: false  // ✅ We handle all page views manually
});
```

## Expected Results

### Before Fix
```
User Journey:
1. Lands on homepage → GA tracks 1 page view
2. Clicks to /tasks → GA sees nothing (client-side nav)
3. Clicks to /events → GA sees nothing (client-side nav)
4. Leaves site → GA records: 1 page view, 100% bounce rate
```

### After Fix
```
User Journey:
1. Lands on homepage → GA tracks 1 page view ✅
2. Clicks to /tasks → GA tracks 2nd page view ✅
3. Clicks to /events → GA tracks 3rd page view ✅
4. Leaves site → GA records: 3 page views, 0% bounce rate ✅
```

## Testing the Fix

### Development Testing
1. Start dev server: `npm run dev`
2. Open browser console
3. Navigate between pages
4. Look for console logs: `[RouteChangeTracker] Route changed: /path`

### Production Testing (After Deployment)
1. **Browser Console Method**:
   - Open DevTools → Network tab
   - Filter by "collect" or "analytics"
   - Navigate between pages
   - Watch for POST requests to `www.google-analytics.com/g/collect`
   - Each route change should trigger a new request

2. **GA4 Real-time Method**:
   - Go to Google Analytics → Reports → Realtime
   - Navigate your site in another tab
   - Watch "Views by page title and screen name" update in real-time
   - Each page navigation should appear

3. **GA4 DebugView Method** (Recommended):
   - Install [Google Analytics Debugger extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/)
   - Enable debug mode
   - Navigate your site
   - Go to GA4 → Admin → DebugView
   - See all events in real-time with full details

## Verification Checklist

After deployment, verify:
- [ ] Navigate homepage → tasks → events → admin
- [ ] Check GA4 Realtime shows 4 page views
- [ ] Each page appears in "Views by page" list
- [ ] Bounce rate decreases over time (not 100%)
- [ ] "Top pages" shows all major pages (not just homepage)
- [ ] Average engagement time increases
- [ ] User journey flows make sense

## Monitoring Metrics

### Key Metrics to Watch (Next 7 Days)

| Metric | Before | Expected After |
|--------|--------|---------------|
| Bounce Rate | 100% | 20-40% |
| Pages per Session | 1.0 | 3-5 |
| Avg Session Duration | 51s | 2-4 min |
| Page Views | ~50/day | 150-300/day |
| Unique Pageviews | Low | Matches user count |

### Red Flags
- ❌ Bounce rate still 100% after 48 hours
- ❌ Pages/session still 1.0
- ❌ Only homepage showing in "Top pages"
- ❌ No increase in page view count

If red flags appear:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in production
3. Check Network tab for GA requests
4. Review deployment logs

## Technical Details

### How It Works

#### Initial Page Load
```
1. User visits https://beeri.online
2. Next.js renders page
3. GoogleAnalytics component mounts
4. RouteChangeTracker mounts
5. useEffect fires → sends page_view for "/"
```

#### Client-Side Navigation
```
1. User clicks link to /tasks
2. Next.js updates URL and content (no reload)
3. usePathname() hook detects change
4. RouteChangeTracker useEffect fires
5. Sends page_view for "/tasks"
6. GA4 records new page view
```

#### With Query Parameters
```
1. User filters tasks: /tasks?status=active
2. useSearchParams() detects change
3. RouteChangeTracker fires
4. Sends page_view for "/tasks?status=active"
```

### Architecture

```
app/[locale]/layout.tsx
  └─ <GoogleAnalytics />
       ├─ <Script> (loads gtag.js)
       ├─ <Script> (configures GA with send_page_view: false)
       └─ <RouteChangeTracker /> ← NEW
            └─ useEffect([pathname, searchParams])
                 └─ trackPageView() → gtag('event', 'page_view')
```

### Why This Approach?

**Alternative approaches considered**:

1. ❌ **Next.js Router events** - Not available in App Router
2. ❌ **Middleware tracking** - Can't access window/gtag on server
3. ❌ **Manual tracking on every link** - Too error-prone
4. ✅ **Automatic hook-based tracking** - Clean, centralized, reliable

## Additional Benefits

### User Segmentation
Every page view now includes `user_type`:
- `admin` - Users on /admin routes with auth token
- `user` - Authenticated users on regular routes
- `anonymous` - Unauthenticated visitors

This enables:
- Filter admin behavior separately
- Compare admin vs user navigation patterns
- Track authentication impact on engagement

### Query Parameter Tracking
Automatically tracks:
- Filters: `/tasks?status=active`
- Search: `/vendors?search=catering`
- Sorting: `/events?sort=date`
- Pagination: `/tasks?page=2`

This enables:
- Understand which filters users use most
- Track search query patterns
- Optimize popular navigation paths

## Files Modified

1. ✅ **Created**: `src/components/analytics/RouteChangeTracker.tsx`
   - New component for SPA tracking
   - 50 lines, fully typed, documented

2. ✅ **Modified**: `src/components/analytics/GoogleAnalytics.tsx`
   - Added RouteChangeTracker import and usage
   - Disabled automatic page_view
   - Added comments explaining changes

3. ✅ **No changes needed**: `src/lib/analytics.ts`
   - trackPageView() already works correctly
   - detectUserType() already implemented
   - No breaking changes

## Rollout Plan

### Phase 1: Deploy (Immediate)
- Deploy changes to production
- Monitor for errors in logs
- Check GA4 Realtime for data

### Phase 2: Verify (24 hours)
- Wait for GA4 data to populate
- Check bounce rate trending down
- Verify page views increasing
- Review user flows

### Phase 3: Analyze (7 days)
- Compare before/after metrics
- Identify most visited pages
- Analyze user navigation patterns
- Set up custom reports

### Phase 4: Optimize (Ongoing)
- Use data to improve UX
- Identify drop-off points
- A/B test navigation changes
- Monitor engagement trends

## Troubleshooting

### Issue: Still seeing 100% bounce rate
**Solution**:
1. Clear browser cache
2. Check Network tab for `collect` requests
3. Verify `send_page_view: false` in production build
4. Wait 24-48 hours for GA4 to process

### Issue: No page views showing
**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` in production env
3. Test with GA Debugger extension
4. Check Ad Blocker not blocking GA

### Issue: Duplicate page views
**Solution**:
1. Verify `send_page_view: false` is set
2. Check only one GoogleAnalytics component mounted
3. Look for React Strict Mode double-renders (dev only)

## References

- [GA4 Single Page Application Tracking](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
- [Next.js App Router Navigation](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- [Google Analytics Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)

## Summary

✅ **Problem**: 100% bounce rate due to missing SPA tracking
✅ **Solution**: Automatic route change tracking via React hooks
✅ **Implementation**: Clean, type-safe, zero-config for developers
✅ **Expected Impact**: Accurate page views, correct bounce rate, better insights

**Next steps**: Deploy, monitor, analyze, optimize.
