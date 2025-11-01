# ⚡ Quick QA Checklist - Notifications

## 🚀 5-Minute Manual Test

### ✅ Step 1: Test Public Page (30 seconds)

1. Open: http://localhost:4500
2. **Look for:** One 🔔 bell icon (top-right corner)
3. **Click bell** → Should show "קבל התראות" button
4. **Result:** Pass ✅ / Fail ❌

---

### ✅ Step 2: Test Subscription (1 minute)

1. Click "קבל התראות"
2. Browser should ask permission → Click **"Allow"**
3. Bell should change to show "בטל התראות"
4. **Result:** Pass ✅ / Fail ❌

---

### ✅ Step 3: Test Sending Notification (1 minute)

1. Open DevTools (F12) → Console
2. Paste and run:
```javascript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'בדיקה 🎉',
    body: 'זוהי התראת בדיקה!',
    icon: '/icons/icon-192x192.png'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Sent to', d.sent, 'users'))
```
3. **Look for:** Push notification appears on screen
4. **Result:** Pass ✅ / Fail ❌

---

### ✅ Step 4: Test Admin Page (1 minute)

1. Go to: http://localhost:4500/login
2. Password: `admin1`
3. After login, **look for:** One 🔔 bell icon with notification badge
4. Click bell → Should show dropdown with counts (tasks, ideas, feedback)
5. **Result:** Pass ✅ / Fail ❌

---

### ✅ Step 5: Test Mobile View (1 minute)

1. Resize browser to mobile width (< 768px) or use DevTools device mode
2. **Public page:** Should show one bell icon
3. **Admin page:** Should show one bell icon with badge
4. **Result:** Pass ✅ / Fail ❌

---

### ✅ Step 6: Test Unsubscribe (30 seconds)

1. On public page, click bell
2. Click "בטל התראות"
3. Bell should change back to "קבל התראות"
4. **Result:** Pass ✅ / Fail ❌

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Public bell visibility | ⏳ | |
| 2. Subscribe flow | ⏳ | |
| 3. Send notification | ⏳ | |
| 4. Admin bell & counts | ⏳ | |
| 5. Mobile responsive | ⏳ | |
| 6. Unsubscribe flow | ⏳ | |

---

## 🐛 Known Issues

- **iOS Safari:** Requires iOS 16.4+ and PWA must be installed first
- **Permission blocked:** User must manually allow in browser settings
- **VAPID keys:** Must be configured in environment variables

---

## ✅ Pass Criteria

All 6 tests must pass (✅) with no critical bugs.

---

**Tested By:** _______________
**Date:** _______________
**Build:** Development / Production
