# Admin (redesign, Nov 2026)

Spec: `Docs/superpowers/specs/2026-11-24-admin-redesign-design.md`. Plan: `Docs/superpowers/plans/2026-11-24-admin-redesign.md`.

The admin side is built around four jobs: events, the homepage highlights carousel, reading what parents sent (inbox) and tickets. Everything else sits behind "more tools". Only the admin side changed; the public site is untouched.

## Routes

| Route | What it is |
|---|---|
| `/admin` | Hub: five rows (`hub-row-events`, `-highlights`, `-tickets`, `-inbox`, `-more`) with live status lines |
| `/admin/events` | Events list with tabs and a "+" button (new) |
| `/admin/events/new`, `/admin/events/[id]/edit` | Existing forms; after saving the owner lands on `/admin/events` |
| `/admin/highlights`, `/admin/tickets` | Restyled lists and editors |
| `/admin/inbox?tab=feedback\|ideas\|survey` | Parents inbox (new) |
| `/admin/more` | Grouped list of every other tool (new) |
| `/admin/feedback`, `/admin/ideas`, `/admin/surveys/skills` | Redirect to the matching inbox tab, keeping any extra query params (`components/features/admin/inbox/redirect.ts`) |

## Shared frame

`(admin)/layout.tsx` renders the admin banner, a centred column (`max-w-2xl`, bottom padding that clears the bar) and `AdminBottomBar`. Components live in `src/components/features/admin/` and are exported from its `index.ts`.

| Component | Props | Notes |
|---|---|---|
| `AdminPageHeader` | `title`, `backHref='/admin'`, `hideBack`, `action`, `subtitle` | Round back button (`admin-header-back`), centred title (`admin-header-title`, the page `h1`), trailing action. Arrow flips with `rtl:rotate-180` |
| `AdminBottomBar` | none | Floating pill with home, events, highlights, inbox, tickets (`admin-bottom-bar`, `admin-bar-<key>`). Current item has `aria-current="page"`; `admin-bar-inbox-dot` shows when feedback + ideas "new" > 0. Hidden on `/admin/prom/<id>/quotes` (that page has its own fixed bar) |
| `AdminGroup` | `title`, `description`, `children`, `className` | White rounded card of rows with optional title above |
| `AdminRow` | `href` or `onClick`, `icon`, `iconClassName`, `leading`, `title`, `subtitle`, `badge`, `trailing`, `testId` | `badge` is the orange count, hidden at 0; renders `<testId>-badge`. Chevron flips in RTL |
| `StatusPill` | `tone: success\|neutral\|warning\|danger\|info` | Small status chip |
| `AdminSegmentedTabs` | `tabs[{value,label,count?}]`, `value`, `onChange` | `admin-tab-<value>`; count shown as `(n)` only when defined |
| `AdminEmptyState` | `icon`, `title`, `description`, `action` | `admin-empty-state` |
| `AdminFormSection` | `title`, `description`, `children` | White card for a block of form fields |

## Counts endpoint

`GET /api/dashboard/admin-counts` (admin cookie required, `force-dynamic`, `no-store`) returns `{ success, data: { events: {upcoming, drafts}, highlights: {active}, tickets: {active}, inbox: {feedback, ideas, survey} } }`. Any failing query returns 500 rather than a wrong zero. `useAdminCounts()` (`src/hooks/useAdminCounts.ts`) shares one in-flight request between the hub and the bar and caches successes for 5 s; on failure `counts` is `null` and callers omit the numbers (hub rows still work). Orange badge = feedback + ideas (survey has no "new" state).

## Inbox

Three tabs, kept in `?tab=` (pushState, so Back steps between tabs). Panels mount on first visit and then stay mounted (hidden) so filters survive tab switches. Tab labels show the counts. Panels: `FeedbackPanel`, `IdeasPanel`, `SkillsAdminDashboard`. Clicking a "new" feedback card marks it read.

## Events list rules

Logic in `src/lib/utils/admin-events.ts` (`classifyEvent`, `startOfTodayIsrael`); "today" is Israel's calendar day.
- **Past:** starts before today, or status `completed`, whatever else is true.
- **Drafts:** status `draft` (and not past). A past draft is "past".
- **Upcoming:** everything else (published, ongoing, cancelled). Cancelled events stay in the tab their date puts them in and show the cancelled pill.
- Upcoming/drafts sort soonest first; past newest first, 30 at a time ("show more").
- Events imported from the calendar are stored as midnight UTC with no end time and display as "all day".
- No delete on the list; deleting stays inside the edit page.

## Translations

Everything lives under the `admin` namespace in `messages/he.json` and `messages/ru.json`: `admin.common` (back, retry, statuses), `nav` (bottom bar), `hub`, `more`, `events`, `highlights`, `tickets`, `inbox`, `tasks`, `messaging`, `records`, `org`, `prom`. Add every key to both files.

## Gotchas

1. **Async server pages under `(admin)` must call `setRequestLocale(params.locale)`** (from `next-intl/server`) before `getTranslations`, or pass the locale explicitly (`getTranslations({ locale, namespace })`). Without it these pages 404'd during the build.
2. **Never pass lucide icon components as props from a server page to a client component** (function props cannot be serialised, it crashes). Render the icon in the server page or pass a key and map to the icon inside the client component. Hit in `committees/page.tsx`, `vendors/page.tsx`, `vendors/[id]/page.tsx`, `tags/page.tsx`.
3. Service workers answer `fetch` themselves and bypass `page.route`; admin specs use `serviceWorkers: 'block'`.

## Tests

`tests/e2e/admin/`: `hub.spec.ts`, `frame.spec.ts`, `events-list.spec.ts` (includes pure `classifyEvent` tests), `inbox.spec.ts`. Helpers in `tests/helpers/admin.helper.ts`. They run against the dev server with the real database, so they are **read-only**: they log in through the API, mock `admin-counts`, the events list and the inbox lists with `page.route`, and block every non-GET request to `/api` (any write fails the test). Run with `ADMIN_PASSWORD` exported: `npx playwright test tests/e2e/admin --project=chromium --workers=1`.

## Known issue

`startOfTodayIsrael` subtracts the wall-clock time since midnight from "now", so on the two days a year the clocks change it is an hour off (events in that hour are classified into the wrong tab). Documented by a `test.fail()` in `events-list.spec.ts`; flip it when fixed. The same helper is duplicated in `api/dashboard/admin-counts/route.ts`.
