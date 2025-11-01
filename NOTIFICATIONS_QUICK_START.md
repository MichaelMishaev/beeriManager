# 🔔 Push Notifications - Quick Start

## ✅ Your System is 95% Ready!

All code is implemented. You just need to activate it.

## 🚀 3 Steps to Activate

### Step 1: Add Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJ54xRyCUmH1mK9n8b6AliWwSa1V8mxxwH4c3eovDT9xJ9d6Z_-BFW17CoAZRXTXw2UxMoUjfQQ6-HUpvLP8qL4
VAPID_PRIVATE_KEY=Mt3-nHLmXu2VeLnjygbOrIg3m0tBClWOQnRZweM9e3g
VAPID_SUBJECT=mailto:admin@beeri.online
```

### Step 2: Add to Vercel

1. Go to: https://vercel.com/[your-project]/settings/environment-variables
2. Add all 3 variables above
3. Apply to: Production, Preview, Development

### Step 3: Run Database Migration

```bash
# If you have Supabase CLI:
supabase db push

# Or paste this SQL in Supabase Dashboard → SQL Editor:
# (Copy from: scripts/migrations/013_create_push_subscriptions.sql)
```

## 🎉 That's It!

Deploy and your notifications will work!

```bash
git add .
git commit -m "Add push notification VAPID keys"
git push
```

## 📱 How Users Subscribe

1. Open the app
2. Click the 🔔 bell icon in header
3. Click "קבל התראות"
4. Allow when browser prompts

## 📨 How to Send Notifications

### Method 1: Use API

```typescript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'אירוע חדש!',
    body: 'נוסף אירוע חדש בלוח השנה',
    data: { url: '/events' }
  })
})
```

### Method 2: Use Templates

```typescript
import { notificationService, NotificationTemplates } from '@/lib/notifications'

await notificationService.showLocalNotification(
  NotificationTemplates.newEvent('ישיבת ועד הורים')
)
```

## 🔧 Auto-Notify on Events

Add this to your event creation code:

```typescript
// After creating event
if (event.notify_parents) {
  await fetch('/api/notifications/send', {
    method: 'POST',
    body: JSON.stringify({
      title: 'אירוע חדש',
      body: event.title,
      data: { url: `/events/${event.id}` }
    })
  })
}
```

## 📚 Full Documentation

See: `Docs/development/pwa-notifications-setup.md`

## ⚠️ Important

- **Never commit VAPID private key to git**
- **Test on localhost first** (https://localhost:3000)
- **iOS requires iOS 16.4+** for PWA notifications

---

**Need help?** Check troubleshooting in the full docs.
