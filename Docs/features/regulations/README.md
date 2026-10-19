# Regulations page (`/he/regulations`, `/ru/regulations`)

Official parent-committee regulations, restyled as a retro-paper **Official Gazette** (mock "B", approved 2026-10-19).

## What it is
- `src/app/[locale]/regulations/page.tsx` → `RegulationsModalContent` (`standalone`).
- The same component renders in the footer/modal (`standalone={false}`) in a compact variant: no index, progress ruler, back button or seal.
- Content comes from `src/lib/regulations/content-data.ts` (he + ru). Content is a flat `string[]` per section: blank strings are spacers, `•` lines are bullets belonging to the paragraph above. `groupContent()` turns that into numbered clauses (`1.1`, `1.2`…) with lettered sub-lists.

## Design pieces
| Piece | Where |
|---|---|
| Paper, rules, masthead, index, articles | `regulations-gazette.module.css` (scoped CSS module) |
| Animated ink stamp (plays once on scroll into view; reduced-motion → static) | `GazetteStamp.tsx` + `gazette-stamp.module.css` |
| Fonts | next/font in the component: Frank Ruhl Libre (`--font-gz-head`), David Libre (body), Secular One (labels), Noto Serif (Cyrillic) |
| Index | sticky bar on mobile (floats over content, never shifts layout), side panel ≥ 980px |
| Back button | flat document-style control; history-back only if the referrer is same-origin, else `/` (the page is mostly opened from WhatsApp links) |

## Approval state
`regulationsStatus` in `content-data.ts`:
- `isApproved: false` (current) → dashed draft badge ("ממתין לאישור"), **red** "pending approval" stamp, and the content's "this regulation was approved and entered into force" footer line is hidden (it would contradict the page).
- `isApproved: true` + `approvalDate: 'YYYY-MM'` → blue "approved" stamp, badge shows `MM.YYYY`; on `he` it also shows the Hebrew-calendar range (a Gregorian month usually spans two Hebrew months, e.g. תשרי–חשוון תשפ״ז). The Hebrew part is computed after mount because Intl's Hebrew output differs between engines (WebKit spells it "חשון").

## i18n
New UI strings are under `regulations.*` in `messages/he.json` / `messages/ru.json`.

## Gotchas
- **Cyrillic:** next/font generates a per-family *fallback* face that claims every codepoint (→ Times New Roman). On ru pages the `.cyr` modifier puts Noto Serif first in the font stacks. `GazetteStamp` inherits the page's `--label` stack for the same reason.
- `--font-formal` from the locale layout is **not** reliably defined — don't depend on it.
- Sticky offsets assume the 64px site nav (`--nav-offset`).

## Tests
`tests/e2e/regulations/regulations-gazette.spec.ts`
