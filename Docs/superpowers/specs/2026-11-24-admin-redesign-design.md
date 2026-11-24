# Admin redesign: a four-job hub

Date: 2026-11-24
Status: awaiting approval
Mockup: `.superpowers/brainstorm/25388-1795527441/content/admin-hub.html` (gitignored, local only)

## Intent

The admin home (`src/app/[locale]/(admin)/admin/page.tsx`) lists 16 sections in 5 collapsible
groups, plus a stats row, a quick-actions bar and a long help dialog. Seven of its links lead to
pages that do not exist. The owner gets lost in it.

In practice the owner does four things in admin:

1. Set events.
2. Set the homepage highlights carousel.
3. Read what parents sent: complaints/feedback, ideas, and skills-survey answers.
4. Set tickets (soccer games, shows).

The admin should make those four obvious and one tap away, and keep everything else out of sight
but still reachable.

## Scope boundary

**Admin side only.** Nothing under the public site changes: not the homepage, not `/events`, not
the feedback/ideas/survey forms, not `/tickets`. The owner was explicit about this.

## Goals

- Admin home shows only the four jobs, each with a live status line.
- One place to read everything parents sent.
- Events can be listed, created, edited from inside admin.
- On any admin page it is obvious where you are, and the four jobs are one tap away.
- No dead links anywhere in the new screens.
- All text on new and changed screens comes from `messages/he.json` and `messages/ru.json`.

## Scope: the whole admin side, in two phases

The owner asked for every admin page to get the new look, not only the hub. That is about 39
pages, so it is built in two phases, each usable on its own:

**Phase 1 — the four jobs, complete.** Everything in "The screens" below, plus restyling the
pages behind the four jobs so they match: the events new/edit forms, the highlights page (list and
editor), the tickets list and new/edit forms, and the three inbox tabs (feedback, ideas, survey).

**Phase 2 — everything behind "more tools".** Urgent messages, push notifications, tasks (list,
new, edit), protocols (new, detail), meetings (list, new, detail), committees (list, new, edit),
contacts, vendors (list, new, detail), prom (list, new, detail, budget, quotes), issues (new,
stats), expenses (list, new), calendar, settings, tags. Planned and built after phase 1 is
approved in use, one area at a time.

**What "restyle" means for an existing page:**
- It uses the shared page header and sits above the bottom bar.
- Lists become grouped white cards with rows: title, grey subtitle, status pill, chevron.
- Forms keep the same fields, validation and save behaviour, regrouped into white cards with a
  section title, with one primary button.
- Its user-visible text moves to `he.json` / `ru.json` (the `admin` namespace), since the page is
  being touched anyway and the project rules forbid hard-coded text.
- No change to what the page does, what it saves, or which API it calls.

## Non-goals

- Changing what any admin page does: fields, validation, save behaviour and API calls stay as
  they are. Only layout, styling and text source change.
- Building the seven missing pages (registrations, task assignment, protocol upload, feedback
  stats, feedback export, broadcast, reports). Their links are simply removed.
- Deleting any admin page or any data.
- The legacy non-localized tree `src/app/(admin)/` is left alone.
- Database or API schema changes.

## Anti-goals

- Any visible change on the public side.
- Losing access to a tool that works today (urgent messages / white-shirt reminders, push
  notifications, tasks, protocols, meetings, committees, contacts, vendors, prom, settings, tags).
- A second navigation system that fights the existing top `Navigation` bar.

## Approaches considered

1. **Hub only.** Rewrite just the admin home. Smallest, but parents' messages stay split over three
   pages and editing an event still sends you to the public site.
2. **Hub + close the two gaps (chosen).** Hub, one parents inbox with three tabs, an admin events
   list, and a shared header and bottom bar on every admin page. Fixes the "lost" feeling without
   rewriting working editors.
3. **Full restyle of every admin page (chosen).** Most consistent, several times the work, highest
   risk of breaking working screens.

The owner first leaned to 2 after seeing the mockups, then asked for the whole admin side to be
restyled. To contain the risk of 3, it is split into the two phases above and restyling is limited
to layout, styling and text source, never behaviour.

## Visual reference

Shopify iOS settings screens (Mobbin), adapted to this app's palette and mirrored for RTL:

- Light grey page, white rounded group cards, one row per item: icon tile, title, grey subtitle
  carrying the current value, chevron. ([Market settings](https://mobbin.com/screens/eeff36fc-9cf3-4959-ab19-d384e0cceb1c))
- Section title with a one-line grey explanation above a card. ([General](https://mobbin.com/screens/f92ef9f8-0a97-4e2d-af46-c6f077a39ecc))
- Floating pill bar at the bottom of every screen, round back button and centred title at the top,
  small status pills. ([Domains](https://mobbin.com/screens/fd1b3f89-85f7-45f0-a1bd-3d4b3db4c489))

Palette: Prussian Blue `#003153` for text and primary buttons, Blue-Green `#0D98BA` for the active
bar item, Sky Blue `#87CEEB` / Selective Yellow `#FFBA00` / UT Orange `#FF8200` as soft icon-tile
tints, UT Orange for the "new" badge. Icons are the app's existing lucide line icons, not emoji.

## The screens

### 1. Admin home — `/admin`

Replaces the current page entirely.

```
  (→)          ניהול

 ניהול תוכן
 ┌──────────────────────────────┐
 │ ‹  אירועים      3 קרובים · 1 טיוטה │
 │ ‹  קרוסלה       5 הדגשות פעילות    │
 │ ‹  כרטיסים      2 פעילים           │
 └──────────────────────────────┘
 מה הורים שלחו
 ┌──────────────────────────────┐
 │ ‹  תיבת הורים  (3)  משוב 2 · רעיונות 1 │
 └──────────────────────────────┘
 ┌──────────────────────────────┐
 │ ‹  כלים נוספים                │
 └──────────────────────────────┘
```

- Rows link to `/admin/events`, `/admin/highlights`, `/admin/tickets`, `/admin/inbox`, `/admin/more`.
- Status lines:
  - Events: count of upcoming published events, and drafts if any.
  - Carousel: count of active highlights.
  - Tickets: count of tickets with status `active`.
  - Inbox: feedback with status `new` + ideas with status `new`; the orange badge shows the sum
    and is hidden at zero.
- While counts load, the subtitle shows a skeleton; if a count fails, the row still works and the
  subtitle is simply omitted.
- Removed: stats row, quick-actions card, help dialog, `AdminSectionGroup` usage on this page.

### 2. Events list — `/admin/events` (new)

- Header with a "+" button linking to the existing `/admin/events/new`.
- Three tabs: upcoming, drafts, past. Upcoming is the default.
- Row: date tile, title, time and location, status pill, chevron. Tapping a row opens the existing
  `/admin/events/[id]/edit`.
- No delete on the list; deleting stays inside the edit screen so a stray tap cannot remove an
  event.
- Empty state per tab with a "create event" button.

### 3. Parents inbox — `/admin/inbox` (new)

- Three tabs: feedback, ideas, survey. The tab is kept in the URL (`?tab=ideas`) so links and the
  back button work.
- Each tab renders the screen that exists today, moved out of its page file into a component:
  the body of `admin/feedback/page.tsx`, the body of `admin/ideas/page.tsx`, and the existing
  `SkillsAdminDashboard`. Behaviour inside each tab is unchanged; the look is restyled to the
  row/card pattern as part of phase 1.
- Tab labels show the "new" count for feedback and ideas.
- `/admin/feedback`, `/admin/ideas` and `/admin/surveys/skills` redirect to the matching inbox tab
  so old bookmarks and the `NotificationBell` links keep working; the bell's links are updated to
  the new URLs.

### 4. More tools — `/admin/more` (new)

A plain grouped list of the areas that left the hub, each linking to its existing page: urgent
messages, push notifications, tasks, protocols, meetings, committees, contacts, vendors, prom,
settings, tags. Only links whose target page exists are listed.

### Shared frame — `(admin)/layout.tsx`

- **Bottom bar** on every admin page: admin home (grid icon), events, carousel, inbox, tickets.
  The current section is highlighted; the inbox item shows a dot when there is something new.
  Fixed to the bottom, respects the iOS safe area, 44px minimum targets, each item has an
  accessible label.
- **Page header** component for the new pages: round back button (to `/admin`, or browser-back on
  deeper pages), centred title, optional action button.
- The existing top `Navigation` bar and its `NotificationBell` stay as they are.
- The "admin mode" banner in the current layout stays.
- Page content gets bottom padding so the bar never covers the last row.

## Constraints

- Next.js App Router, strict TypeScript, Tailwind, shadcn/ui, lucide icons, next-intl.
- Hebrew is RTL and default; Russian is LTR. Use logical spacing so both directions work; chevrons
  flip with direction.
- Mobile first at 375px; on desktop the content is a centred column of comfortable width and the
  bar stays a centred pill.
- Server reads go through API routes with the server Supabase client; no direct Supabase calls
  from new client components (the current hub does this for stats and it goes away).
- Admin counts must not be cached (`force-dynamic`, `no-store`).
- New text lives in a new `admin` namespace in both `he.json` and `ru.json`.

## How it gets built

The owner asked for the build to be done by several Sonnet agents in parallel.

- The shared frame (header, bottom bar, row/card/pill components, the `admin` translation
  namespace skeleton) is built first by one agent, because every page depends on it.
- After that, pages are restyled in parallel, one agent per area, each touching only its own
  page files.
- `messages/he.json` and `messages/ru.json` are shared by every agent and already have
  uncommitted changes in the working tree. Agents must not edit them concurrently: each agent
  returns its new keys, and one step merges them into both files.
- Each agent's work is reviewed, and type-check, lint and the admin Playwright specs are run on
  the combined result, before anything is reported as done.

## Decided by the owner

- Only the four jobs on the hub; the rest tucked behind "more tools".
- The whole admin side is restyled (size 3), not only the hub, inbox and events list.
- Shopify settings look.
- Admin side only.
- The hub section heading is "ניהול תוכן" and the bar's first item is a grid icon meaning admin
  home, so neither reads as the public homepage.

## My calls (not yet confirmed by the owner)

- **Two phases, four jobs first.** The owner asked for everything; the split and its order are
  mine.
- **Restyling moves each touched page's text to the translation files**, in Hebrew and Russian.
- **Survey has no "new" state.** The mockup showed "סקר 1" as new. The survey table has no
  read/unread status, so the survey tab shows total responses and does not add to the orange
  badge.
- **The floating AI assistant button** currently sits at the bottom of every admin page and would
  collide with the bar. It moves up to sit just above the bar.
- **Old feedback/ideas/survey URLs redirect** to the inbox rather than staying as duplicate pages.
- **"Past" events tab** shows the most recent past events first, limited to a sensible page size.
- **Counts come from one small admin-only endpoint** (extending or sitting beside
  `/api/notifications/counts`) so the hub makes one request.
- **Dead code:** `AdminSectionGroup` / `AdminSectionListItem` are deleted if nothing else uses
  them after the rewrite.
- **More tools also lists** issues (report a problem → `/admin/issues/new`, statistics →
  `/admin/issues/stats`), expenses (`/admin/expenses`) and the admin calendar (`/admin/calendar`),
  because they work today and must stay reachable. There is no `/admin/protocols` index page, so
  the protocols row is "add protocol" → `/admin/protocols/new`.
- **After creating or saving an event the owner lands on `/admin/events`**, not the public event
  page. Today both `events/new/page.tsx` and `events/[id]/edit/page.tsx` redirect to the public
  page; only that redirect changes, the forms do not.
- **Event tabs:** "drafts" = status `draft`. "Upcoming" = status `published` or `ongoing` with a
  start date today or later. "Past" = start date before today, or status `completed`, whatever
  the status. Cancelled events stay in the tab their date puts them in and carry a "בוטל" pill, so
  they can still be opened and reopened. The hub's status line counts the same way and does not
  count cancelled events as upcoming.
- **Pages with their own fixed bottom bar** (currently only the prom quotes page,
  `MobileBottomBar`) hide the admin bar, so the two never overlap and the prom page is not edited.

## Left to the builder

- Exact component split and file names.
- Whether the events list reuses `/api/events?status=all` or needs a parameter added.
- Whether the existing event edit page already offers delete; if it does not, add a delete button
  with confirmation there.
- How to trim the duplicate page titles inside the three inbox tabs.
- Spacing, shadows and exact tints, staying close to the mockup.

## Testing

- Playwright specs go in `tests/e2e/admin/` (subfolder, not the tests root).
- Cover: hub shows exactly the five rows and each navigates correctly; bottom bar is present on
  hub, events, highlights, inbox, tickets and highlights the right item; inbox tabs switch and
  survive reload; old URLs redirect; events tabs filter correctly; no link on the new screens
  returns 404; RTL (he) and LTR (ru) both render; 375px and desktop viewports.
- Existing specs that click through the old hub need updating: `03-admin.spec.ts`,
  `admin-panel-automation.spec.ts`, `admin-cards-creation.spec.ts`, `07-complaint-flow.spec.ts`,
  `12-highlights-admin.spec.ts`, `08-vendors.spec.ts` (clicks the vendors link on `/admin`) and
  `09-urgent-messages.spec.ts` (clicks the urgent card on `/he/admin`).
- Any test data created is removed with `cleanupTestData()` in `afterAll()`.

## Documentation

- `docs/features/admin/README.md` describes the new hub, inbox, events list and frame. The project
  rules also ask for a `features.json`, but no such file exists anywhere in the repo, so none is
  created here; that is the owner's call.
