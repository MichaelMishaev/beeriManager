## GA4 Events & Conversions (SPA)

Use this as the working map between in-app events, GTM data layer signals, and GA4 conversions.

### Pageviews (SPA)
- Event name: `page_view`
- Sent via: `gtag('event', 'page_view', { page_path, page_title, page_location, page_referrer, user_type })`
- Data layer mirror: `event: 'spa_page_view'` with same params
- Source: `RouteChangeTracker` on every route change (initial + client nav)

### Key Events Emitted In-App
- `auth_login` — Admin login attempt/success/failure (`LoginPage`)
  - Params: `component_name`, `user_type`, `method`, optional `error`
- `auth_logout` — Logout from nav (`Navigation`)
  - Params: `component_name`, `user_type`, `from`, optional `error`
- `navigation_navigate` — Menu navigation (`Navigation`)
  - Params: `to`, `from`, `component_name`, `user_type`
- `admin_task_*` — Highlights admin flows (create/update/delete/translate) (`AdminHighlightsPage`)
- `engaged_session_10_actions` — Auto-fired after 10 tracked actions in a session
  - Params: `engagement_actions`

### Data Layer Shape
All custom events also push to `window.dataLayer`:
```ts
{
  event: 'custom_event' | 'conversion_engaged_session',
  event_name: '<name>',
  ...params
}
```

### Conversions to Mark in GA4
Mark these event names as Conversions in GA4 (Admin → Conversions):
- `auth_login` (successful admin login)
- `admin_task_create_success` (content added)
- `pwa_install_accepted` (already emitted by PWA tracking)
- `engaged_session_10_actions` (strong engagement)

### Validation Checklist
- Use GA4 DebugView: confirm `page_view` fires on every route change with `page_location` and `page_referrer`.
- In GTM Preview: confirm `spa_page_view` and `custom_event` appear with params.
- Ensure only one GA instance is loaded and `send_page_view: false` remains in config.

### Notes
- No PII is sent; avoid adding emails/names to event params.
- If GTM container is added later, map `spa_page_view` and `custom_event` to GA4 configuration tags instead of changing app code.
