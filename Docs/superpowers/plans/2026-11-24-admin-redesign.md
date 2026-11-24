# Admin Redesign Implementation Plan

> **For agentic workers:** each task below is given to one Sonnet subagent. Read this whole file
> and the spec before starting. You own only the files listed for your task.

**Goal:** Turn the admin side into a four-job hub with a shared frame, and restyle every admin
page to the same grouped-row look without changing what any page does.

**Architecture:** One set of small presentational components (`src/components/features/admin/`)
plus a bottom bar and header mounted from the admin layout. New pages (hub, events list, inbox,
more tools) are built on them; existing pages are re-laid-out with them. One admin-only counts
endpoint feeds the hub and the bar.

**Tech Stack:** Next.js 14 App Router, strict TypeScript, Tailwind (RTL), shadcn/ui, lucide-react,
next-intl, Supabase via API routes, Playwright.

**Spec:** `Docs/superpowers/specs/2026-11-24-admin-redesign-design.md`. The owner has since said
"implement all": both phases in the spec are built now, wave 2 covering them in parallel.

## Global Constraints

- **Admin side only.** No visible change on any public route. If a component you want to restyle
  is also imported by a non-admin route, do not change it; wrap it or leave it.
- **Behaviour is frozen.** Fields, validation, what is saved, which API is called, toasts,
  analytics calls and `data-testid` attributes stay exactly as they are. Only layout, styling and
  the source of text change. The one behavioural change allowed is listed in Task B.
- **No hard-coded UI text** in any file you touch: `useTranslations('admin.<area>')` /
  `getTranslations`. Hebrew and Russian both required. Existing Hebrew strings are moved
  verbatim; Russian is a faithful translation.
- **Translation files.** Only Task A edits `messages/he.json` and `messages/ru.json`. Every other
  task writes two part files instead and never opens the real ones for writing:
  `<I18N_DIR>/<area>.he.json` and `<I18N_DIR>/<area>.ru.json`, each a flat-or-nested JSON object
  that will be merged under `admin.<area>`. `<I18N_DIR>` =
  `/private/tmp/claude-501/-Users-michaelmishayev-Desktop-Projects-beeriManager/08c551f0-33d8-46f8-954b-da7382515d95/scratchpad/i18n`.
  Both files must have identical key sets. `<area>` names are fixed per task below.
- **RTL and LTR.** Logical classes only (`ms-`/`me-`/`ps-`/`pe-`/`text-start`/`text-end`), never
  `ml-`/`mr-`/`text-left`/`text-right` in new code. Chevrons use `rtl:rotate-180` on a
  `ChevronRight`... i.e. the chevron must point toward the reading-end side in both directions.
- **Mobile first** at 375px, touch targets at least 44x44px, content column `max-w-2xl mx-auto` on
  desktop (wider only where a table needs it).
- **Palette:** text/primary `#003153`, active accent `#0D98BA`, soft tints from `#87CEEB`,
  `#FFBA00`, `#FF8200`; "new" badge `#FF8200`. Page background `bg-[#f1f2f4]`, cards white,
  `rounded-2xl`, hairline dividers.
- **Icons:** lucide-react only, no emoji as icons.
- **Navigation imports:** `Link`, `usePathname`, `useRouter` from `@/i18n/navigation` in new code
  (paths without the locale prefix).
- **Data access:** client components fetch through API routes, never Supabase directly. API
  routes use `createClient` from `@/lib/supabase/server`. Uncached reads use `cache: 'no-store'`.
- **Strict TypeScript:** no `any`, no unused imports/locals.
- **Do not:** commit, stage, push, run migrations, modify or delete database rows, start the dev
  server, or run Playwright (several agents work at once; ports and the DB are shared). Run
  `npx tsc --noEmit` and `npx eslint <your files>` and fix every error in files you own; ignore
  errors in files owned by other tasks and say so in your report.
- **Files outside your task:** do not edit. If you believe a shared frame component needs a
  change, do not change it; describe the need in your report.
- **Uncommitted work exists** in the tree (Kiss & Ride, `BackToHomeGuard.tsx`, `src/lib/ai/*`,
  `messages/*.json`). Leave it alone.

## Review Focus

- A count request fails or is slow: hub rows and the bar must still render and navigate.
- Russian (LTR): chevrons, back arrow and bar order must flip correctly; no clipped text.
- Long Hebrew titles in rows: truncate, never push the status pill or chevron off screen.
- Bottom bar must never cover the last row, a form's submit button, or a page's own sticky bar.
- A deep link to `/admin/feedback`, `/admin/ideas`, `/admin/surveys/skills` must land on the right
  inbox tab with query strings preserved.

---

## Task A: Shared frame, hub, more tools, counts (runs first, alone)

**Files**
- Create: `src/components/features/admin/AdminPageHeader.tsx`, `AdminGroup.tsx` (exports
  `AdminGroup`, `AdminRow`), `StatusPill.tsx`, `AdminSegmentedTabs.tsx`, `AdminEmptyState.tsx`,
  `AdminFormSection.tsx`, `AdminBottomBar.tsx`, `index.ts`
- Create: `src/hooks/useAdminCounts.ts`
- Create: `src/app/api/dashboard/admin-counts/route.ts`
- Create: `src/app/[locale]/(admin)/admin/more/page.tsx`
- Rewrite: `src/app/[locale]/(admin)/admin/page.tsx`
- Modify: `src/app/[locale]/(admin)/layout.tsx`,
  `src/components/features/ai-assistant/AIFloatingButton.tsx` (position only)
- Modify: `messages/he.json`, `messages/ru.json` (add top-level `admin` with `common`, `nav`,
  `hub`, `more`; touch nothing else in those files)
- Delete if unused afterwards: `src/components/features/dashboard/AdminSectionGroup.tsx`,
  `AdminSectionListItem.tsx`

**Produces (exact interfaces other tasks rely on)**

```ts
// all exported from '@/components/features/admin'
AdminPageHeader(props: {
  title: string
  backHref?: string        // default '/admin'; pass null-like via hideBack to hide
  hideBack?: boolean
  action?: React.ReactNode // e.g. a round "+" link
  subtitle?: string
})
AdminGroup(props: { title?: string; description?: string; children: React.ReactNode; className?: string })
AdminRow(props: {
  href?: string            // renders a Link row with trailing chevron
  onClick?: () => void     // renders a button row
  icon?: LucideIcon
  iconClassName?: string   // tile tint, e.g. 'bg-[#87CEEB]/30 text-[#003153]'
  leading?: React.ReactNode // replaces the icon tile (e.g. a date tile)
  title: string
  subtitle?: React.ReactNode
  badge?: number           // orange count, hidden when 0/undefined
  trailing?: React.ReactNode // pills/buttons before the chevron
  testId?: string
})
StatusPill(props: { tone: 'success' | 'neutral' | 'warning' | 'danger' | 'info'; children: React.ReactNode })
AdminSegmentedTabs<T extends string>(props: {
  tabs: { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
})
AdminEmptyState(props: { icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode })
AdminFormSection(props: { title?: string; description?: string; children: React.ReactNode }) // white card for a block of form fields
```

```ts
// GET /api/dashboard/admin-counts  (admin JWT cookie required, 401 otherwise; force-dynamic)
{ success: true, data: AdminCounts }
type AdminCounts = {
  events: { upcoming: number; drafts: number }   // rules: spec "Event tabs"
  highlights: { active: number }                 // is_active = true
  tickets: { active: number }                    // status = 'active'
  inbox: { feedback: number; ideas: number; survey: number } // feedback/ideas: status='new'; survey: total rows
}
// src/hooks/useAdminCounts.ts
useAdminCounts(): { counts: AdminCounts | null; isLoading: boolean }
```

`admin.common` keys available to everyone: `back`, `save`, `saving`, `cancel`, `delete`, `edit`,
`create`, `loading`, `error`, `retry`, `empty`, `confirmDeleteTitle`, `status.published`,
`status.draft`, `status.cancelled`, `status.active`, `status.new`, `status.done`.

**Requirements**
- Layout: grey page background, existing admin banner kept, children in the centred column with
  bottom padding for the bar, `<AdminBottomBar />` mounted, AI button raised above the bar.
- Bottom bar: items `/admin` (LayoutGrid), `/admin/events` (Calendar), `/admin/highlights`
  (Sparkles), `/admin/inbox` (MessageSquare, dot when feedback+ideas > 0), `/admin/tickets`
  (Ticket). Active = pathname equals `/admin` for the first, `startsWith` for the rest.
  `data-testid="admin-bottom-bar"`, each item `data-testid="admin-bar-<key>"` with `aria-label`
  and `aria-current="page"` when active. Returns `null` when pathname matches
  `/admin/prom/<id>/quotes`. Safe-area padding.
- Hub: `AdminPageHeader` (no back button; title from `admin.hub.title`), group "ניהול תוכן" with
  events / carousel / tickets rows, group "מה הורים שלחו" with the inbox row, then a lone "more
  tools" row. `data-testid`s: `hub-row-events`, `hub-row-highlights`, `hub-row-tickets`,
  `hub-row-inbox`, `hub-row-more`. Subtitles from `useAdminCounts`, skeleton while loading,
  omitted on failure.
- More tools: rows for urgent messages, push notifications, tasks, add protocol, meetings,
  committees, contacts, vendors, prom, issues (new) and issue statistics, expenses, calendar,
  settings, tags. Verify each target page file exists before listing it.
- Remove from the hub: Supabase client import, stats, quick actions, help dialog.

**Verify:** `npx tsc --noEmit` clean for these files; `npx eslint` on them clean; both message
files parse as JSON and have identical key sets under `admin`.

---

## Wave 2: one agent per task, all in parallel after Task A

Every wave-2 task follows the same **restyle recipe** for each page it owns:
1. Read the page fully and list every user-visible string and every `data-testid`.
2. Replace the page's own `<h1>`/header block with `AdminPageHeader` (keep any primary action as
   its `action`).
3. Lists: `AdminGroup` + `AdminRow` (or cards kept inside an `AdminGroup` when a row cannot hold
   the content), statuses as `StatusPill`, filters as `AdminSegmentedTabs` where there are 2-4
   mutually exclusive options, `AdminEmptyState` for empty lists.
4. Forms: same fields in the same order, grouped in `AdminFormSection`s, one primary submit
   button, secondary actions as outline buttons.
5. Move all strings to `admin.<area>` via the part files.
6. `npx tsc --noEmit`, `npx eslint <files>`; fix your own errors.
7. Report: files changed, any behaviour you could not preserve, any string you were unsure how
   to translate, anything a later reviewer should look at.

| Task | `<area>` | Owns (under `src/app/[locale]/(admin)/admin/` unless noted) |
|---|---|---|
| **B Events** | `events` | create `events/page.tsx`; restyle `events/new/page.tsx`, `events/[id]/edit/page.tsx` |
| **C Carousel** | `highlights` | restyle `highlights/page.tsx` |
| **D Tickets** | `tickets` | restyle `tickets/page.tsx`, `tickets/new/page.tsx`, `tickets/[id]/edit/page.tsx`, `src/components/features/tickets/TicketForm.tsx` |
| **E Inbox** | `inbox` | create `inbox/page.tsx`, `src/components/features/admin/inbox/FeedbackPanel.tsx`, `IdeasPanel.tsx`; turn `feedback/page.tsx`, `ideas/page.tsx`, `surveys/skills/page.tsx` into redirects; restyle `src/components/features/surveys/admin/*`; update links in `src/components/layout/NotificationBell.tsx` |
| **F Tasks & settings** | `tasks` | `tasks/page.tsx`, `tasks/new`, `tasks/[id]/edit`, `tags/page.tsx`, `settings/page.tsx` |
| **G Messages & contacts** | `messaging` | `urgent/page.tsx`, `notifications/page.tsx`, `contacts/page.tsx` |
| **H Meetings & records** | `records` | `meetings/page.tsx`, `meetings/new`, `meetings/[id]`, `protocols/new`, `protocols/[id]`, `issues/new`, `issues/stats`, `calendar/page.tsx` |
| **I People & money** | `org` | `committees/page.tsx`, `committees/new`, `committees/[id]/edit`, `vendors/page.tsx`, `vendors/new`, `vendors/[id]`, `expenses/page.tsx`, `expenses/new` |
| **J Prom** | `prom` | `prom/page.tsx`, `prom/new`, `prom/[id]`, `prom/[id]/budget`, `prom/[id]/quotes` |

Each task may also restyle feature components that are imported **only** by its own pages.

**Task B specifics**
- `/admin/events`: header with a round "+" action to `/admin/events/new`
  (`data-testid="admin-events-new"`); `AdminSegmentedTabs` upcoming / drafts / past with counts,
  default upcoming, tab kept in `?tab=`; rows with a date tile as `leading`, title, time ·
  location, `StatusPill`, linking to `/admin/events/<id>/edit`; row
  `data-testid="admin-event-row"`.
- Data: `GET /api/events?status=all&limit=100`, classified client-side by the spec's "Event tabs"
  rules into a pure function `classifyEvent(event, now): 'upcoming' | 'drafts' | 'past'` in
  `src/lib/utils/admin-events.ts`; past sorted newest first, upcoming soonest first. Cancelled
  events keep their date-based tab and show a danger pill.
- Allowed behaviour change: after a successful create or save, redirect to `/admin/events`
  instead of the public event page. Nothing else in the two forms changes.

**Task C specifics**
- The list becomes rows (title, type/date subtitle, active/inactive pill, edit and delete
  controls as `trailing`), the inline editor becomes `AdminFormSection`s. Keep ordering controls,
  the translate button, analytics calls and every existing `data-testid`
  (`tests/e2e/12-highlights-admin.spec.ts` and `tests/highlights-*.spec.ts` depend on them).

**Task D specifics**
- Check whether `TicketForm` is imported by any non-admin route before touching it. Keep the
  "finish event" confirmation flow intact.

**Task E specifics**
- `/admin/inbox?tab=feedback|ideas|survey` (default feedback), tabs via `AdminSegmentedTabs` with
  new-counts from `useAdminCounts` for feedback and ideas and the total for survey.
- `FeedbackPanel` / `IdeasPanel` are the current page bodies moved verbatim, then restyled by the
  recipe; they render no page header of their own.
- Old routes use `redirect` from `next/navigation` to `/<locale>/admin/inbox?tab=...`.
- `NotificationBell`: only the two hrefs change (`/admin/inbox?tab=ideas`,
  `/admin/inbox?tab=feedback`).

**Task J specifics**
- `prom/[id]/quotes` keeps its own `MobileBottomBar` untouched; the admin bar hides itself there.

---

## Wave 3 (after all of wave 2 has reported)

**Task K: merge and verify (orchestrator)**
- Merge every `<I18N_DIR>/<area>.{he,ru}.json` into `messages/{he,ru}.json` under
  `admin.<area>`; fail on key-set mismatch between languages or on an area overwriting another.
- `npm run type-check`, `npm run lint`; grep the admin tree for leftover Hebrew literals,
  `text-left|text-right|ml-|mr-`, and direct `supabase` client imports.
- Start the dev server, open every admin route at 375px in `he` and `ru`, screenshot, fix.

**Task L: tests and docs (one agent)**
- `tests/e2e/admin/hub.spec.ts`, `frame.spec.ts`, `events-list.spec.ts`, `inbox.spec.ts` covering
  the spec's Testing section and the Review Focus list; unit-style test of `classifyEvent`.
- Update the stale hub-dependent specs named in the spec.
- `Docs/features/admin/README.md`; entry in `Docs/bugs/bugs.md` only for real bugs found.
