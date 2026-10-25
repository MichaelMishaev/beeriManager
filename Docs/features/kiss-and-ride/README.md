# Kiss & Ride — נשק וסע (`/he/kiss-and-ride`, `/ru/kiss-and-ride`)

Public, read-only schedule for the drop-off project: parents of the **on-duty class** help children get out of the car so other parents stay in their cars and the road keeps flowing. Added 2026-10-25.

## What parents see
One question, one answer (simplified 2026-10-25 after "too confusing" feedback; pattern: single-select picker → one big result card, cf. Apple Maps transit line card, Whatnot / Uber Eats single-select sheets on Mobbin).
- Prussian-blue header: title, short purpose line, share button, and **"who is on duty at school"** (added 2026-10-25, owner: "must know who's next").
- "When is my class on duty?" — one native `<select>` (grouped by grade; on phones it opens the system picker). Choosing a class shows, in the same card: the date range (big), the partner class for shared shifts, and one line of timing ("starts in ~5 weeks" / "5 days left" / "finished — thanks!"). When the class is on duty right now the card turns yellow.
- The chosen class is kept in `localStorage` (`kissRide.myClass`, e.g. `ו1`, wrapped in try/catch).
- `?class=ד3` in the URL preselects that class (not saved to storage). The share button shares this link plus the class's dates once a class is chosen, so a parent can forward it to the class WhatsApp group.
- **Calendar** (`KissRideCalendar.tsx`) appears under the answer once a class is chosen (hidden before, to keep the first screen to one question). Styled like the home-page `MobileCalendar` (white rounded card, month header with arrows, Sunday-first 7-column grid, today ringed in yellow) but it is its own component: `MobileCalendar` is Hebrew-only, shows event dots only (no ranges) and is tied to home-page event data. The class's duty days are filled navy; **Saturdays are never filled** (no school; this is an assumption, ranges themselves include them). Opens on the shift's first month (or on the current month while the class is on duty, so today is in view); arrows stop at the first and last month of the schedule (Oct 2026 – Jun 2027). Cells outside the month are blank, so no day is shown twice. Pure ISO-string/UTC maths (no `Intl`/local timezone) so server and client render identically. Keys: `kissRide.calendar.*`.
- Two collapsed sections below: the full schedule (20 rows in date order, shared shifts written "ד׳3 וג׳3"; your class tinted, past rows greyed, the current row marked "now" and the next one "next" on a line of their own) and "How it works" (3 short steps).

## Now / next at school (`KissRideNowNext.tsx`)
One **live-status card** in the navy header (redesigned 2026-10-25 from two equal side-by-side tiles). Visible before any class is chosen.
- Layout: small eyebrow heading "בבית הספר עכשיו" / "В школе сейчас" with a sky-blue dot (grey when nobody is on duty) → the class on duty **big (28px)** → one line "תורנית עד 30 באוקטובר" / "дежурит до 30 октября" → a divider → one footer line "הבאה בתור: ו׳3 · מ־1 בנובמבר" / "Следующий: 6-3 · с 1 ноября". ICU plurals for shared shifts ("תורניות" / "дежурят", "הבאות בתור" / "Следующие").
- **Why it changed** (owner screenshot, 2026-10-25): the old panel had a tiny heading under a large purpose paragraph, a dim grey-blue "now" tile and an outline "next" tile of equal size, so the one thing that matters today was visually the weakest and a parent had to read label + date to get it. Now "now" carries the weight and "next" is secondary by size and position.
- Pattern: one primary item + a footer line under a divider — Flighty's live flight card ("Gate departure in…" footer), Transit's lock-screen live activity ("70 in 1 minute" big, arrival as a small line), Apple Sports' live card (small "Q1 · In progress" context line over the main content). Mobbin screens a315a3cc… (Flighty), b84f786b… (Transit), 1534f6e3… (Apple Sports). Earlier references (Transit tiles, Substack "Now playing", Brink "Up next") were for the old two-tile version.
- **Why in the header, not a banner:** an earlier yellow "on duty now" banner was mistaken for the parent's own class. The card sits with the page title, its heading says *school / now*, and it uses navy/sky-blue only — yellow is reserved for "your class" (the yellow answer card, and a yellow "הכיתה שלכם" pill on the card when the chosen class is the one now/next). The dot is static (no pulse): the page must stay calm.
- Cases (pure helpers `getCurrentShift(today)` / `getNextShift(today)` in the data file):
  - in a shift → big = that class(es), footer = the following shift (shared shifts show both classes);
  - gap with nobody on duty (e.g. 5–12 Dec 2026, 13 Apr–1 May 2027, any Saturday between shifts) → big "אין כיתה תורנית" (grey dot), footer = the next class and its start date;
  - before the first shift → "nobody", footer = ו׳1 from 4 Oct;
  - during the last shift → footer says "this is the last shift this year";
  - after the last shift → the card becomes one line "this year's shifts are over — thanks" (heading kept for screen readers only; nothing that looks like a future date).
  - No reason is given for gaps (holidays etc.): the data doesn't say, so we don't guess.
- In relation to the chosen class: only "**your class is next**" (prefixed to the timing line in the answer card). A "N shifts away" count was considered and dropped: shifts are ~2 weeks, so the existing "starts in ~5 weeks" is what a parent actually plans with.
- Hydration / no layout shift: before mount (`today === null`) the card renders at full height with only its heading, then fills in. Heights are fixed — top 104px + footer 56px = 160px, and the year-over box is 160px too — so nothing moves, including the worst case (Russian at 320px, a shared "next" shift that is the parent's class, where the footer wraps to two lines). Measured pre-mount vs. after-mount height in every state × {no class, ו2, א4, ד3} × 320/375/430 × he/ru: no change. A Playwright test asserts the card has the same height across states.
- Not a live region on purpose: it is filled once after mount, and announcing it would be noise.

## Mobile
Checked in Chromium emulation at 320/360/375/390/430 wide, 667×375 landscape and 1440 desktop, he + ru: no horizontal scroll; select is 18px (no iOS focus-zoom); all controls ≥44px (calendar arrows 44, summaries 52, list rows ≥44); calendar cells 40px at 320. Content column is `max-w-md` (448px) so desktop stays phone-shaped and centred. `min-h-dvh`, bottom padding respects `env(safe-area-inset-bottom)`, `:active` feedback and focus rings on summaries/arrows, transitions off under `prefers-reduced-motion`. The page's content wrapper is a `<div>` (the app layout already provides `<main>`). The picker's bottom edge is at ~437px (he) / ~457px (ru) on a 667px-tall phone, ~55% on 812+; in landscape phones it needs a scroll — the now/next tiles are what's visible there.

No parent names are stored or shown — the committees' lists are per class only.

## Data
`src/lib/data/kiss-and-ride.ts` — `kissRideShifts` (20 entries, school year 2026-27, ISO dates, inclusive). Two shifts cover two classes at once: ד׳3+ג׳3 (29/11–4/12) and ב׳3+א׳3 (30/05–4/06). Years were inferred from weekdays: every range starts on a Sunday only if dates run Oct 2026 → Jun 2027.
**To change the schedule, edit this file and deploy.** If changes become frequent, move it to a table with an admin editor.

"Today" is computed in `Asia/Jerusalem` after mount (`todayInIsrael()`), so server and client render the same first paint. Date ranges are built from translated month names (`kissRide.monthInRange.*`, `rangeSameMonth`, `rangeCrossMonth`), not `Intl`, because Node's and the browser's ICU produced different text and caused a hydration error on `/ru`. Helpers: `parseClassKey()`, `daysBetween()`, `getCurrentShift()`, `getNextShift()`. Single dates ("30 באוקטובר") use `kissRide.dayMonth`; shared-shift names use `kissRide.classPair`.

## i18n
Keys under `kissRide.*` in `messages/he.json` / `messages/ru.json`. `gradeName` maps the Hebrew grade letter to a display label (he: `ו׳`, ru: `6`); `classLabel` joins grade and number (he: `ו׳1`, ru: `6-1`).

## Entry points
Home-page card (`src/components/features/homepage/KissAndRideCard.tsx`, rendered next to the Committee Corner card) and the direct URL, which is what gets shared on WhatsApp.

## Tests
`tests/e2e/kiss-and-ride/schedule.spec.ts` (375px; he + ru; clock pinned — default 2026-10-25 Israel, plus gap day 8 Dec, shared shift 1 Dec, before the year 20 Sep, last shift 28 Jun, after the year 10 Jul 2027; the card-height test also uses 5 Jul 2027 and ru at 320px on 25 Nov 2026 with `?class=ד3`). Note: pinning the browser clock to 2027 makes the global Footer's year differ from the server's (a React hydration warning in dev) — a test artefact, not a page bug.
