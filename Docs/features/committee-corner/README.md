# Committee corner (`/he/committee-corner`, `/ru/committee-corner`)

Hub page for the parent committee's rules and contacts. Redesigned 2026-10-20 as an **authority ladder** (design board "D", class-reps sheet from board "C").

## Structure
- `src/app/[locale]/committee-corner/page.tsx` — metadata + passes `regulationsStatus.isApproved` (server side, so the regulations text is not shipped to the client).
- `CommitteeCornerContent.tsx` — compact Prussian-blue header (title, one-line purpose, share button, status legend).
- `CommitteeLadder.tsx` — ordered list of 4 numbered levels on a connecting line, labelled by **issuer/scope**, not legal rank (the page must not imply one document overrides another):
  1. ארצי · משרד החינוך → `/mankal-circular` (chip: בתוקף)
  2. עירוני · עיריית נתניה → `/municipal-bylaws` (chip: בתוקף)
  3. בית ספרי · ועד ההורים של בארי → `/regulations` (chip from `regulationsStatus`: בתוקף / ממתין לאישור) and `/protocols`
  4. כיתתי · ועדי הכיתות → `/class-committee-bylaws` (dashed card + `proposalBadge` chip)
- `ClassRepsSheet.tsx` — sticky bottom button "נציג/ת הכיתה שלי" (safe-area aware) opening a Radix Dialog styled as a bottom sheet (focus trap, Esc, 44px close button). Grade chips א׳–ו׳ come from `getMembersByGradeLevel()` (`src/lib/data/committee-members.ts`); rows show name + `tel:` button, or "אין מספר זמין" when no phone is listed. The last chosen grade is kept in `localStorage` (`committeeCorner.lastGrade`, wrapped in try/catch) and preselected when the sheet reopens.

## Data
Class reps are static in `src/lib/data/committee-members.ts` (21 entries as of 2026-10-20, 7 without a phone). Update that file when reps change.

## i18n
Keys under `committeeCorner.*` in `messages/he.json` / `messages/ru.json`: `purpose`, `legend.*`, `status.*`, `ladder.*`, `myRepCta`, `sheet.*`. Grade letters inside messages are wrapped in Unicode isolates (U+2068/U+2069) so Hebrew letters render correctly inside Russian text. `members.*` keys belong to the removed accordion and are currently unused. Home-card keys (`homeCardTitle`, `homeCardSubtitle`) are unchanged.

## Tests
`tests/e2e/committee-corner/ladder.spec.ts` (375px, he).
