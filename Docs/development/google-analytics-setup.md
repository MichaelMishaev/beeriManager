# Google Analytics Setup Guide

## Step 1: Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** (gear icon) in the bottom left
4. Under **Property**, click **Data Streams**
5. Click **Add stream** → **Web**
6. Enter your website details:
   - Website URL: `https://beeri.online` (or your domain)
   - Stream name: `BeeriManager`
7. Click **Create stream**
8. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

## Step 2: Add Measurement ID to Environment Variables

Add to `.env.local`:

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Also add to Vercel environment variables:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
4. Apply to: Production, Preview, Development

## Step 3: Install Google Analytics Component

The analytics script will be added to your root layout automatically.

## Step 4: Test Analytics

After deployment:
1. Visit your website
2. Go to Google Analytics → Reports → Realtime
3. You should see your visit in real-time

## Features Tracked

The setup will automatically track:
- **Page views** - Every page navigation
- **Events** - User interactions (clicks, form submissions)
- **Conversions** - Important actions (event registrations, feedback submissions)
- **User demographics** - Location, device, browser
- **User flow** - How users navigate through your site

## Privacy Compliance

For GDPR/CCPA compliance:
- Analytics data is anonymized by default
- No personal information is collected
- Users in Israel/EU are protected by default settings

## PWA Installation Tracking (Automatically Tracked)

The app automatically tracks PWA installation events:

### Events Tracked:

1. **`pwa_install_prompt_shown`** - When browser shows install is available
   - Category: PWA
   - Label: "Install prompt available"

2. **`pwa_install_button_clicked`** - When user clicks install button
   - Category: PWA
   - Label: "User clicked install button"

3. **`pwa_install_accepted`** - When user accepts installation
   - Category: PWA
   - Label: "User accepted PWA installation"

4. **`pwa_install_dismissed`** - When user dismisses installation
   - Category: PWA
   - Label: "User dismissed PWA installation"

5. **`pwa_running_standalone`** - When app is running as installed PWA
   - Category: PWA
   - Label: "App running in standalone mode"

### Viewing PWA Stats in Google Analytics:

1. Go to **Reports** → **Engagement** → **Events**
2. Search for events starting with `pwa_`
3. View metrics:
   - **pwa_install_accepted** count = Total installations
   - **pwa_install_prompt_shown** count = Install opportunities
   - Conversion rate = accepted / prompt_shown

## Custom Events (Optional)

You can track additional custom events:

```typescript
// Track event registration
gtag('event', 'event_registration', {
  event_id: '123',
  event_name: 'ישיבת ועד'
})

// Track feedback submission
gtag('event', 'feedback_submitted', {
  feedback_type: 'anonymous'
})
```

## Verify Installation

After deploying, verify the installation:

1. Open your website in Chrome
2. Right-click → Inspect → Network tab
3. Filter by "google-analytics" or "gtag"
4. You should see requests to `www.google-analytics.com`

## Troubleshooting

**Not seeing data?**
- Wait 24-48 hours for data to appear
- Check Realtime reports instead
- Verify Measurement ID is correct
- Check browser console for errors

**Ad blockers?**
- Analytics might be blocked by ad blockers
- This is expected and normal
- Most real users don't use ad blockers

## Next Steps

After setup, you can:
- Create custom reports
- Set up conversion goals
- Track specific events
- Monitor user behavior
- Analyze traffic sources
