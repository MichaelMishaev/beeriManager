# 🔔 Notifications QA Test Plan

## Test Date: 2025-10-30
## Feature: PWA Push Notifications
## Version: 1.0

---

## 📋 Test Summary

| Area | Tests | Status |
|------|-------|--------|
| UI/UX | 8 | ⏳ Pending |
| Functionality | 10 | ⏳ Pending |
| Integration | 6 | ⏳ Pending |
| Browser Compatibility | 5 | ⏳ Pending |
| Performance | 4 | ⏳ Pending |

---

## 1️⃣ UI/UX Tests

### Test 1.1: Public Page - Bell Icon Visibility
**Steps:**
1. Open app without logging in: http://localhost:4500
2. Look at top-right header

**Expected Result:**
- ✅ One bell icon visible (🔔)
- ✅ No duplicate bells
- ✅ Bell has hover tooltip
- ✅ Bell is clickable

**Status:** ⏳ Pending

---

### Test 1.2: Admin Page - Bell Icon Visibility
**Steps:**
1. Login to admin: http://localhost:4500/login (password: admin1)
2. Navigate to /admin page
3. Look at top-right header

**Expected Result:**
- ✅ One bell icon visible (🔔)
- ✅ No duplicate bells
- ✅ Bell shows notification count badge if there are notifications
- ✅ Bell is clickable

**Status:** ⏳ Pending

---

### Test 1.3: Public Bell - Subscribe Flow
**Steps:**
1. On public page, click bell icon
2. Observe button text

**Expected Result:**
- ✅ Button shows "קבל התראות" (Get Notifications)
- ✅ Icon is a bell
- ✅ Clicking prompts browser permission dialog

**Status:** ⏳ Pending

---

### Test 1.4: Public Bell - Unsubscribe Flow
**Steps:**
1. Subscribe to notifications (Test 1.3)
2. Refresh page
3. Click bell icon again

**Expected Result:**
- ✅ Button shows "בטל התראות" (Cancel Notifications)
- ✅ Icon changes to bell-off
- ✅ Clicking unsubscribes immediately

**Status:** ⏳ Pending

---

### Test 1.5: Admin Bell - Notification Counts
**Steps:**
1. Login as admin
2. Create 2 new tasks
3. Submit 1 new idea
4. Submit 1 feedback
5. Check bell icon

**Expected Result:**
- ✅ Badge shows "4" (total count)
- ✅ Bell has visual indicator (animation/pulse)
- ✅ Clicking opens dropdown with breakdown

**Status:** ⏳ Pending

---

### Test 1.6: Admin Bell - Dropdown Contents
**Steps:**
1. Login as admin (with notifications from Test 1.5)
2. Click bell icon

**Expected Result:**
- ✅ Dropdown shows three sections:
  - "משימות חדשות" with count
  - "רעיונות חדשים" with count
  - "משוב חדש" with count
- ✅ Each section is clickable
- ✅ Clicking navigates to correct page

**Status:** ⏳ Pending

---

### Test 1.7: Mobile View - Public
**Steps:**
1. Resize browser to mobile width (< 768px)
2. Check header on public page

**Expected Result:**
- ✅ One bell icon visible
- ✅ Bell is appropriately sized for mobile
- ✅ No layout issues

**Status:** ⏳ Pending

---

### Test 1.8: Mobile View - Admin
**Steps:**
1. Login as admin
2. Resize browser to mobile width
3. Check header

**Expected Result:**
- ✅ One bell icon visible (notification bell with counts)
- ✅ Bell is appropriately sized
- ✅ Badge is readable on mobile

**Status:** ⏳ Pending

---

## 2️⃣ Functionality Tests

### Test 2.1: Subscribe to Notifications
**Steps:**
1. Open app on public page
2. Click bell icon
3. Click "Allow" on browser prompt

**Expected Result:**
- ✅ Browser shows permission granted
- ✅ Bell icon changes to "unsubscribe" state
- ✅ Subscription saved to database
- ✅ Success toast appears

**Database Check:**
```sql
SELECT * FROM push_subscriptions WHERE is_active = true;
```

**Status:** ⏳ Pending

---

### Test 2.2: Unsubscribe from Notifications
**Steps:**
1. Subscribe first (Test 2.1)
2. Click bell icon
3. Confirm unsubscribe

**Expected Result:**
- ✅ Subscription removed from database
- ✅ Bell icon reverts to "subscribe" state
- ✅ Success toast appears

**Database Check:**
```sql
SELECT * FROM push_subscriptions WHERE endpoint = '[your-endpoint]';
-- Should return 0 rows
```

**Status:** ⏳ Pending

---

### Test 2.3: Send Test Notification (Browser Console)
**Steps:**
1. Subscribe to notifications
2. Open DevTools Console (F12)
3. Paste and run:
```javascript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'בדיקה',
    body: 'זוהי התראת בדיקה',
    icon: '/icons/icon-192x192.png'
  })
})
.then(r => r.json())
.then(d => console.log('Sent:', d))
```

**Expected Result:**
- ✅ Console shows: `Sent: { success: true, sent: 1, ... }`
- ✅ Push notification appears on screen
- ✅ Notification displays Hebrew text correctly (RTL)
- ✅ Icon appears correctly

**Status:** ⏳ Pending

---

### Test 2.4: Notification Click Behavior
**Steps:**
1. Send notification with URL:
```javascript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'בדיקת ניווט',
    body: 'לחץ כדי לנווט',
    data: { url: '/events' }
  })
})
```
2. Click the notification

**Expected Result:**
- ✅ Notification closes
- ✅ Browser/app opens to /events page
- ✅ If app already open, focuses existing window

**Status:** ⏳ Pending

---

### Test 2.5: Multiple Subscribers
**Steps:**
1. Open app in 2 different browsers (Chrome + Firefox)
2. Subscribe both
3. Send notification from console

**Expected Result:**
- ✅ Both browsers receive notification
- ✅ Console shows: `Sent: { sent: 2, ... }`
- ✅ Both notifications display correctly

**Status:** ⏳ Pending

---

### Test 2.6: Notification Templates
**Steps:**
1. Open DevTools Console
2. Test each template:
```javascript
// Test new event
await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    title: 'אירוע חדש נוסף',
    body: 'ישיבת ועד הורים',
    data: { type: 'event' }
  })
})
```

**Templates to Test:**
- ✅ New Event
- ✅ Event Reminder
- ✅ Task Assigned
- ✅ Task Due
- ✅ Issue Update
- ✅ Expense Approved
- ✅ New Feedback

**Expected Result:**
- ✅ All notifications display correctly
- ✅ Hebrew text displays RTL
- ✅ Icons appear

**Status:** ⏳ Pending

---

### Test 2.7: Service Worker Registration
**Steps:**
1. Open DevTools → Application → Service Workers
2. Check registration status

**Expected Result:**
- ✅ Service worker registered
- ✅ Shows "activated and running"
- ✅ File: sw.js or similar
- ✅ No errors in console

**Status:** ⏳ Pending

---

### Test 2.8: Notification Permission States
**Test Scenarios:**

**A. Permission Denied**
1. Reset notification permission (browser settings)
2. Click subscribe, click "Block"

**Expected:**
- ✅ Error toast appears
- ✅ Bell stays in "subscribe" state
- ✅ Helpful error message in Hebrew

**B. Permission Granted**
1. Reset permission
2. Click subscribe, click "Allow"

**Expected:**
- ✅ Success toast
- ✅ Bell changes to "unsubscribe"

**Status:** ⏳ Pending

---

### Test 2.9: Admin Notification Bell - Mark as Read
**Steps:**
1. Login as admin
2. Create notifications (tasks/ideas/feedback)
3. Click bell icon
4. Click on one notification category

**Expected Result:**
- ✅ Navigates to correct page
- ✅ After return, bell count updates
- ✅ localStorage updated with view timestamp

**Status:** ⏳ Pending

---

### Test 2.10: Admin Bell - Real-time Updates
**Steps:**
1. Login as admin
2. Open admin panel
3. Wait 30 seconds (polling interval)
4. In another browser, submit feedback

**Expected Result:**
- ✅ Bell updates count within 30 seconds
- ✅ Bell shows animation/pulse
- ✅ No page refresh needed

**Status:** ⏳ Pending

---

## 3️⃣ Integration Tests

### Test 3.1: VAPID Keys Configuration
**Steps:**
1. Check environment variables
```bash
echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY
```

**Expected Result:**
- ✅ Keys are present
- ✅ Public key starts with "BJ54..."
- ✅ Private key is set (not shown)
- ✅ Keys match between local and Vercel

**Status:** ⏳ Pending

---

### Test 3.2: Database Table Exists
**Steps:**
1. Run in Supabase SQL Editor:
```sql
SELECT * FROM push_subscriptions LIMIT 1;
```

**Expected Result:**
- ✅ Table exists
- ✅ No SQL errors
- ✅ Columns: id, endpoint, keys, subscription_data, is_active, created_at, updated_at

**Status:** ⏳ Pending

---

### Test 3.3: API Endpoint - Subscribe
**Steps:**
1. Test API directly:
```bash
curl -X POST http://localhost:4500/api/notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{"subscription":{"endpoint":"test","keys":{}}}'
```

**Expected Result:**
- ✅ Returns: `{"success":true}`
- ✅ Status code: 200
- ✅ Entry appears in database

**Status:** ⏳ Pending

---

### Test 3.4: API Endpoint - Send
**Steps:**
1. Subscribe first
2. Test send API:
```bash
curl -X POST http://localhost:4500/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Test"}'
```

**Expected Result:**
- ✅ Returns: `{"success":true,"sent":1,...}`
- ✅ Notification received
- ✅ Status code: 200

**Status:** ⏳ Pending

---

### Test 3.5: API Endpoint - Counts
**Steps:**
1. Login as admin
2. Test:
```bash
curl http://localhost:4500/api/notifications/counts
```

**Expected Result:**
- ✅ Returns JSON with counts
- ✅ Structure: `{total, tasks, ideas, feedback, latestTimestamps}`
- ✅ Status code: 200

**Status:** ⏳ Pending

---

### Test 3.6: Google Analytics Tracking
**Steps:**
1. Subscribe to notifications
2. Check Network tab for GA events:
   - `pwa_install_prompt_shown`
   - `pwa_install_button_clicked`
   - `pwa_install_accepted`

**Expected Result:**
- ✅ Events sent to GA
- ✅ No errors in console
- ✅ Event parameters correct

**Status:** ⏳ Pending

---

## 4️⃣ Browser Compatibility Tests

### Test 4.1: Chrome Desktop
- ✅ Subscribe works
- ✅ Notifications display
- ✅ UI renders correctly
- ✅ No console errors

**Status:** ⏳ Pending

---

### Test 4.2: Firefox Desktop
- ✅ Subscribe works
- ✅ Notifications display
- ✅ UI renders correctly
- ✅ No console errors

**Status:** ⏳ Pending

---

### Test 4.3: Safari Desktop (macOS 16.4+)
- ✅ Subscribe works
- ✅ Notifications display
- ✅ UI renders correctly
- ✅ No console errors

**Status:** ⏳ Pending

---

### Test 4.4: Chrome Mobile (Android)
- ✅ Subscribe works
- ✅ Notifications display
- ✅ UI renders correctly on mobile
- ✅ Notification sounds/vibrates

**Status:** ⏳ Pending

---

### Test 4.5: Safari Mobile (iOS 16.4+)
- ✅ Subscribe works
- ✅ Notifications display
- ✅ UI renders correctly
- ✅ PWA must be installed first

**Status:** ⏳ Pending

---

## 5️⃣ Performance Tests

### Test 5.1: Subscription Speed
**Steps:**
1. Time from click to subscribed
2. Measure API response time

**Expected Result:**
- ✅ < 1 second total
- ✅ API responds < 500ms
- ✅ No loading state needed

**Status:** ⏳ Pending

---

### Test 5.2: Notification Delivery Speed
**Steps:**
1. Send notification
2. Measure time until displayed

**Expected Result:**
- ✅ < 2 seconds
- ✅ No delays
- ✅ Instant display

**Status:** ⏳ Pending

---

### Test 5.3: Database Query Performance
**Steps:**
1. Add 100 subscriptions
2. Send notification
3. Check response time

**Expected Result:**
- ✅ < 5 seconds for 100 users
- ✅ No timeouts
- ✅ All users receive notification

**Status:** ⏳ Pending

---

### Test 5.4: Memory Leaks
**Steps:**
1. Open DevTools → Performance
2. Subscribe/unsubscribe 10 times
3. Check memory usage

**Expected Result:**
- ✅ No memory leaks
- ✅ Memory stable
- ✅ No detached DOM nodes

**Status:** ⏳ Pending

---

## 🐛 Bug Tracking

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| - | - | - | - |

---

## ✅ QA Sign-off

- [ ] All UI/UX tests passed
- [ ] All functionality tests passed
- [ ] All integration tests passed
- [ ] All browser compatibility tests passed
- [ ] All performance tests passed
- [ ] No critical bugs
- [ ] Documentation updated

**QA Engineer:** _______________
**Date:** _______________
**Signature:** _______________

---

## 📝 Notes

- VAPID keys must be kept secret
- iOS requires iOS 16.4+ for PWA notifications
- Service worker must be HTTPS (or localhost)
- Notification permission is per-origin

---

**Last Updated:** 2025-10-30
