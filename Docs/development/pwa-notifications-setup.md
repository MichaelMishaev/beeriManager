# PWA Push Notifications Setup Guide

## 📱 Overview

Your PWA already has a **complete push notification system** implemented! This guide will help you activate and use it.

## ✅ What's Already Implemented

1. **Service Worker** (`/public/sw-custom.js`) - Handles push events
2. **Notification Service** (`/src/lib/notifications.ts`) - Client-side API
3. **UI Components**:
   - `NotificationSubscription` - Subscribe/unsubscribe button
   - `NotificationBell` - In-app notification bell
4. **API Endpoints**:
   - `POST /api/notifications/subscribe` - Store subscriptions
   - `POST /api/notifications/send` - Send notifications to all users
   - `DELETE /api/notifications/subscribe` - Unsubscribe
5. **Database Table** - `push_subscriptions` (Migration 013)
6. **Manifest Permissions** - Already declared in `manifest.json`

## 🚀 Setup Steps

### 1. Generate VAPID Keys (Already Done!)

Your VAPID keys have been generated:

```
Public Key: BJ54xRyCUmH1mK9n8b6AliWwSa1V8mxxwH4c3eovDT9xJ9d6Z_-BFW17CoAZRXTXw2UxMoUjfQQ6-HUpvLP8qL4
Private Key: Mt3-nHLmXu2VeLnjygbOrIg3m0tBClWOQnRZweM9e3g
```

### 2. Add Environment Variables

Add to your `.env.local`:

```bash
# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJ54xRyCUmH1mK9n8b6AliWwSa1V8mxxwH4c3eovDT9xJ9d6Z_-BFW17CoAZRXTXw2UxMoUjfQQ6-HUpvLP8qL4
VAPID_PRIVATE_KEY=Mt3-nHLmXu2VeLnjygbOrIg3m0tBClWOQnRZweM9e3g
VAPID_SUBJECT=mailto:admin@beeri.online
```

**For Vercel Production:**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the same three variables
4. Apply to: **Production, Preview, Development**

### 3. Run Database Migration

If you haven't run migration 013 yet:

```bash
# Using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase Dashboard
# SQL Editor → New Query → Paste the content of:
# scripts/migrations/013_create_push_subscriptions.sql
```

Verify the table exists:
```sql
SELECT * FROM push_subscriptions LIMIT 1;
```

### 4. Deploy Your App

```bash
# Commit changes
git add .
git commit -m "Add push notification environment variables"
git push

# Vercel will auto-deploy
```

## 📲 How to Use Notifications

### For Users

1. **Open the app** on their mobile device
2. **Install the PWA** (if not already installed)
3. **Click the bell icon** 🔔 in the header
4. **Click "קבל התראות"** (Subscribe to notifications)
5. **Allow notifications** when the browser prompts

### For Admins

#### Send a notification to all subscribed users:

```typescript
// From any admin page or API route
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'אירוע חדש!',
    body: 'נוסף אירוע חדש: ישיבת ועד הורים',
    icon: '/icons/icon-192x192.png',
    data: {
      url: '/events/123',
      type: 'event'
    },
    tag: 'new-event',
    requireInteraction: true
  })
})

const result = await response.json()
console.log(`Sent to ${result.sent} users`)
```

#### Use predefined templates:

```typescript
import { notificationService, NotificationTemplates } from '@/lib/notifications'

// Send a new event notification
await notificationService.showLocalNotification(
  NotificationTemplates.newEvent('ישיבת ועד הורים')
)

// Send a task reminder
await notificationService.showLocalNotification(
  NotificationTemplates.taskDue('לאשר תקציב')
)
```

## 🎯 Available Notification Templates

Pre-built templates in `/src/lib/notifications.ts`:

1. **`newEvent(eventTitle)`** - New event added
2. **`eventReminder(eventTitle, timeUntil)`** - Event starting soon
3. **`taskAssigned(taskTitle)`** - New task assigned
4. **`taskDue(taskTitle)`** - Task due today
5. **`issueUpdate(issueTitle, status)`** - Issue status changed
6. **`expenseApproved(expenseTitle, amount)`** - Expense approved
7. **`newFeedback()`** - New parent feedback received

## 🔧 Integration Examples

### Automatically notify when new event is created

In your event creation API route:

```typescript
// After creating the event
await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    title: 'אירוע חדש נוסף',
    body: `${newEvent.title} - ${formatDate(newEvent.date)}`,
    data: {
      url: `/events/${newEvent.id}`,
      type: 'event'
    }
  })
})
```

### Notify when task is assigned

```typescript
// In task assignment logic
await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    title: 'משימה חדשה הוקצתה',
    body: task.title,
    data: {
      url: `/tasks/${task.id}`,
      type: 'task'
    }
  })
})
```

## 📊 Testing Notifications

### 1. Test on localhost

```bash
npm run dev
```

Visit: https://localhost:3000 (must be HTTPS for notifications!)

### 2. Test subscription

Open DevTools Console and run:
```javascript
// Check if notifications are supported
console.log('Supported:', 'Notification' in window)

// Check permission
console.log('Permission:', Notification.permission)

// Request permission
await Notification.requestPermission()
```

### 3. Send a test notification

Navigate to your admin panel and trigger a test notification, or use the API:

```bash
curl -X POST https://beeri.online/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "בדיקה",
    "body": "זוהי התראת בדיקה"
  }'
```

## 🎨 Customizing Notifications

### Add custom notification with actions

```typescript
await fetch('/api/notifications/send', {
  method: 'POST',
  body: JSON.stringify({
    title: 'אישור נדרש',
    body: 'יש לאשר הוצאה חדשה',
    requireInteraction: true,
    actions: [
      {
        action: 'approve',
        title: 'אשר',
        icon: '/icons/check.png'
      },
      {
        action: 'reject',
        title: 'דחה',
        icon: '/icons/x.png'
      }
    ],
    data: {
      url: '/admin/expenses',
      expenseId: '123'
    }
  })
})
```

### Modify notification appearance

Edit `/public/sw-custom.js`:

```javascript
const options = {
  body: data.body,
  icon: '/icons/icon-192x192.png',
  badge: '/icons/icon-96x96.png',
  vibrate: [200, 100, 200], // Vibration pattern
  dir: 'rtl',
  lang: 'he',
  tag: 'unique-tag', // Replace existing notification with same tag
  renotify: true, // Re-alert even if tag exists
  silent: false // Play sound
}
```

## 🔐 Security & Privacy

1. **VAPID Keys** - Keep `VAPID_PRIVATE_KEY` secret (never commit to git!)
2. **RLS Policies** - Database table has Row Level Security enabled
3. **User Consent** - Users must explicitly opt-in to notifications
4. **Unsubscribe** - Users can unsubscribe anytime via the bell icon

## 🐛 Troubleshooting

### Notifications not working?

1. **Check VAPID keys are set:**
   ```bash
   echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
   ```

2. **Verify service worker is registered:**
   - DevTools → Application → Service Workers
   - Should see `sw.js` registered

3. **Check notification permission:**
   ```javascript
   console.log(Notification.permission)
   // Should be 'granted'
   ```

4. **Check subscriptions in database:**
   ```sql
   SELECT count(*) FROM push_subscriptions WHERE is_active = true;
   ```

5. **Test with local notification:**
   ```javascript
   import { notificationService } from '@/lib/notifications'
   await notificationService.showLocalNotification({
     title: 'Test',
     body: 'This is a test'
   })
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Permission denied" | User must manually allow in browser settings |
| "Not supported" | Must use HTTPS or localhost |
| "VAPID key invalid" | Check keys match (public in client, private in server) |
| "No subscriptions" | Users need to click subscribe button |
| Service worker not updating | Clear cache, or increment version in `next.config.js` |

## 📱 Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ (16.4+) | ✅ (16.4+) |
| Edge | ✅ | ✅ |
| Opera | ✅ | ✅ |

**Note:** iOS Safari requires iOS 16.4+ for push notifications in PWAs.

## 🚀 Next Steps

1. **Add automated notifications** for new events, tasks, etc.
2. **Set up scheduled notifications** for event reminders
3. **Create admin panel** for sending custom announcements
4. **Track notification analytics** (open rates, click-through)
5. **Add notification preferences** (let users choose which types to receive)

## 📚 Resources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Keys](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)

---

**Your notification system is ready to go! Just add the VAPID keys to your environment variables and deploy.** 🎉
