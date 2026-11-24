# Bugs found + fixed

## 2026-11-25 — AI assistant route answered without login
- **How found:** review during the admin redesign: `POST /api/ai-assistant` had no auth check, so anyone with the URL could spend the OpenAI budget.
- **Fix:** the route requires the admin `auth-token` (401 otherwise). `src/app/api/ai-assistant/route.ts`. The daily usage limit was then removed completely at the owner's request (route, chat counter, `/api/ai-assistant/check-limit`); the 5000-character message limit stays.
- **Verified:** without cookie → 401; logged-in admin → 200 (greeting action, no OpenAI call).

## 2026-11-25 — Delete-everything API routes removed
- **How found:** live browser test agent read the routes: `DELETE /api/events` and `DELETE /api/highlights` (no ID) deleted every row. Admin-only, but nothing in the app or tests called them.
- **Fix:** both handlers removed; deleting a single item by ID is unchanged. Verified: both now return 405.

## 2026-11-25 — Small admin text and layout fixes
- Admin banner and AI button label were hard-coded (Hebrew / English on Russian pages) → `admin.common.adminModeBanner|aiAssistant|aiAssistantOpen`.
- Protocol draft banner wrapped one word per line and scrolled the page sideways at 375px → stacks vertically on phones (`src/components/ui/draft-banner.tsx`; its text is still Hebrew only).
- Event delete confirm said "cannot be undone" although the event is archived → reworded.
- Protocol edit page always redirected to `/he/...` and to a nonexistent `/admin/protocols` → uses the current locale.

## 2026-11-25 — Editing a ticket did nothing (no request, no error)
- **How found:** live browser test of the admin: pressing "עדכן כרטיס" on `/admin/tickets/[id]/edit` sent no request.
- **Root cause:** `TicketForm` spread the database row into the form defaults. Empty columns arrive as `null`, but the Zod schema accepts only a string or `undefined`, so validation failed on fields that have no input (`venue`, `team_home`, …) and the error had nowhere to show. Older than the admin redesign.
- **Fix:** defaults are mapped field by field, `null` → `undefined` / `''`. `src/components/features/tickets/TicketForm.tsx`.
- **Verified:** on 3 real tickets with null columns the form now submits a PUT (request intercepted in the browser, nothing written). A real save was not performed.

## 2026-11-25 — Admin home counts disagreed with the lists (survey 18 vs 7, feedback 62 new vs 50 total)
- **How found:** live browser test of the admin hub and parents inbox.
- **Root cause:** the survey count in `/api/dashboard/admin-counts` counted soft-deleted rows and ignored the school filter that the list uses; the feedback list was capped at 50 rows while the count was not.
- **Fix:** the survey count uses the list's filters (`school_id`, `deleted_at is null`); the feedback panel loads up to 1000 rows (API cap raised from 100 to 1000, admin-only route).
- **Verified:** counts API survey 7 = list 7; feedback list 63 rows, 62 new = hub 62.
- **Files:** `src/app/api/dashboard/admin-counts/route.ts`, `src/app/api/feedback/route.ts`, `src/components/features/admin/inbox/FeedbackPanel.tsx`.

## 2026-11-25 — Admin events list silently stopped at 100 events
- **How found:** live browser test: the "past" count dropped by one when a draft was added.
- **Root cause:** `/api/events` caps every request at 100 rows, newest first, so the oldest past events fell off.
- **Fix:** a logged-in admin may load up to 1000; the public cap stays 100. The admin list asks for 1000.
- **Verified:** admin request returns 217 events, the same request without login returns 100.
- **Files:** `src/app/api/events/route.ts`, `src/app/[locale]/(admin)/admin/events/page.tsx`.

## 2026-11-25 — Russian tab labels were cut off in the admin
- **How found:** live browser test at 375px ("Предстоящи…").
- **Root cause:** `AdminSegmentedTabs` used `truncate` on each tab.
- **Fix:** labels wrap onto a second line instead. `src/components/features/admin/AdminSegmentedTabs.tsx`. Verified by screenshot in ru and he.

## 2026-11-24 — Admin redesign: four bugs found in the 375px browser sweep (he and ru)
Found by opening every admin route in `he` and `ru` at 375px during the redesign build.

### Async server pages under `(admin)` 404'd without `setRequestLocale`
- **Root cause:** async server pages that call `getTranslations()` need the request locale set; without `setRequestLocale(params.locale)` next-intl could not resolve it and the route 404'd in the build.
- **Fix:** call `setRequestLocale(params.locale)` first (or pass the locale to `getTranslations`). Files: `committees/page.tsx`, `vendors/page.tsx`, `vendors/[id]/page.tsx`, `tags/page.tsx` under `src/app/[locale]/(admin)/admin/`.

### Lucide icon components passed as props from server pages crashed the page
- **Root cause:** icon components are functions and cannot cross the server-to-client boundary as props.
- **Fix:** icons are rendered in the server page or mapped by key inside the client component. Same four files.

### Long unbroken URLs in urgent messages caused horizontal scroll at 375px
- **Root cause:** a message containing a long URL had no break opportunity, so the card grew wider than the viewport.
- **Fix:** `[overflow-wrap:anywhere]` on the message container in `urgent/page.tsx`. Checked by `tests/e2e/admin/frame.spec.ts` (no horizontal scroll, he and ru).

### Midnight-UTC imported events showed "02:00" instead of all-day in the admin events list
- **Root cause:** calendar imports store all-day events as midnight UTC with no end time; formatted in Asia/Jerusalem that is 02:00 (03:00 in summer), so the list showed a clock time.
- **Fix:** `events/page.tsx` treats a start at 00:00 UTC with no end time as all-day. Covered by `tests/e2e/admin/events-list.spec.ts`.

## 2026-10-25 — BackToHomeGuard rewrote the address bar to /he; refresh on any deep page loaded the home page
- **How found:** user reported that opening `https://beeri.online/he/kiss-and-ride` directly and pressing Back on an iPhone still left the app. An earlier "Back lands on /he" check was a false positive (the URL was already `/he` before Back). Tracing the History API calls on the live site showed the real sequence: `replaceState(/he/kiss-and-ride)` (Next) → `replaceState(/he)` (guard) → `pushState(…/he/kiss-and-ride)` (guard) → `replaceState(/he)` (Next). 12/12 fresh live visits ended with the address bar on `/he` while the deep page was on screen; reloading showed the home page. Locally it also intermittently rendered the home page content instead of the deep page (≈3 in 8 runs).
- **Root cause:** in Next 14.2 the App Router patches `window.history.pushState/replaceState` on the instance (`app-router.js`): plain state objects get Next's internals copied in (`__NA`) and every URL change is synced into the router's `canonicalUrl`. The guard's `replaceState({}, '', '/he')` therefore (a) did not create the plain `{}` entry its comment assumed, and (b) told the router the page was `/he`, so Next's own history updater overwrote the address bar back to `/he` after the guard's `pushState`.
- **Fix:** call the native `History.prototype.replaceState/pushState` (via `.call(window.history, …)`) so Next's patch never sees the guard's two history edits. Result: the URL stays on the deep page, a refresh stays there, Back ends on the home page.
- **Verified:** traced locally before/after; new `tests/e2e/navigation/back-to-home-guard.spec.ts` fails 6/7 on the original guard and passes 7/7 with the fix (Chromium). Direct link → Back reaches `/he` in Chromium, WebKit and Firefox under automation. **Not verified:** a real iPhone's Back button (Safari/Chrome on iOS skip history entries added by script without user interaction; automation does not exercise that UI path), and reload → Back in automated WebKit (the page crashes in Playwright's WebKit there, also on a path where the guard is not involved).
- **Files:** `src/components/layout/BackToHomeGuard.tsx`, `tests/e2e/navigation/back-to-home-guard.spec.ts`. Introduced by the commit "fix: phone Back button now returns to home instead of leaving the app".

## 2026-10-25 — Phone Back button left the app from deep pages
- **How found:** user report: on non-base screens, Back exits the app instead of returning to the base screen.
- **Root cause:** pages opened directly (WhatsApp link, home-screen shortcut) are the first history entry, so there was no in-app entry under them to go back to. Per-page `router.back()` buttons had the same hole.
- **Fix:** `BackToHomeGuard` (mounted in `[locale]/layout.tsx`) inserts the home entry under a landing page; Back (system and `router.back()` buttons) now ends on home. The inserted entry has plain `{}` state so Next's popstate handler hard-loads it.
- **Files:** `src/components/layout/BackToHomeGuard.tsx`, `src/app/[locale]/layout.tsx`.

## 2026-10-25 — Committee Corner homepage card kept rocking
- **How found:** user pointed at the homepage card inner content (`a > Card > CardContent`) rotating on `/he`.
- **Root cause:** `CommitteeCornerCard` used `animate-float-soft` on the card. Combined with the skewed shine sweep it read as a continuous tilt.
- **Fix:** removed `animate-float-soft` (and the hover pause). Shine sweep on the overlay/badge is unchanged.
- **Files:** `src/components/features/homepage/CommitteeCornerCard.tsx`.

## 2026-10-19 — Russian text rendered in Times New Roman on the gazette pages
- **How found:** an agent building `/ru/class-committee-bylaws` noticed it; confirmed on `/ru/regulations` with CDP `CSS.getPlatformFontsForNode` (Cyrillic glyphs → "Times New Roman", no Noto Serif file ever requested).
- **Root cause:** next/font emits, for each family, a generated `__Family_Fallback` face with `unicode-range: U+0-10FFFF` (local Times New Roman). It sits right after the real family in the `variable` stack and claims every codepoint, so Cyrillic never reached the Noto Serif face placed later in the chain.
- **Fix:** on ru pages put the Cyrillic face first (`.root.cyr` overrides `--serif-head/--serif-body/--label`); `GazetteStamp` now inherits `--label` instead of its own chain.
- **Files:** `regulations-gazette.module.css`, `RegulationsModalContent.tsx`, `GazetteStamp.tsx`, `class-bylaws-gazette.module.css`.

## 2026-10-19 — Page fonts silently fell back to Rubik
- **How found:** screenshots showed sans-serif headings; computed `font-family` was Rubik.
- **Root cause:** the CSS stacks referenced `var(--font-formal)`, which is not defined on the page; an undefined `var()` makes the whole custom property invalid at computed-value time, so the stack was empty and inherited Rubik.
- **Fix:** load every gazette font in the component and reference only `--font-gz-*` variables.

## 2026-10-19 — Dead white space under the site footer
- **How found:** user screenshot of `/he/class-committee-bylaws`.
- **Root cause:** `Footer` always had `pb-24 md:pb-0`, reserving room for the homepage-only `FloatingActionMenu` pill; every other page got ~96px of empty space on mobile.
- **Fix:** apply the padding only on the homepage (`/`, `/he`, `/ru`). `src/components/layout/Footer.tsx`.

## 2026-10-19 — Mobile index jump overshot its target
- **Root cause:** the open index list was in normal flow, so closing it on click shifted the page mid-scroll.
- **Fix:** the open list floats (`position: absolute`) over the page; toggling never changes layout.
