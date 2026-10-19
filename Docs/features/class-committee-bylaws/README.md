# Class Committee Bylaws (proposal) — `/[locale]/class-committee-bylaws`

Proposed bylaws for class committees (ועדי כיתות). **Status: proposal, not approved** — the page must never
present it as approved.

## Files
- Page: `src/app/[locale]/class-committee-bylaws/page.tsx`
- Component: `src/components/features/committee-corner/ClassCommitteeBylawsContent.tsx`
- Styles: shared gazette theme `src/components/features/protocols/regulations-gazette.module.css`
  + bylaws-only layer `src/components/features/committee-corner/class-bylaws-gazette.module.css`
- Stamp: `src/components/features/protocols/GazetteStamp.tsx` (`ink="red"`, proposal wording)
- Content (he + ru): `src/lib/data/class-committee-bylaws.ts`
- UI strings: `classBylawsPage.*` in `messages/he.json` and `messages/ru.json`
- Linked from: `CommitteeCornerContent.tsx` (`committeeCorner.classBylaws`)

## Design ("Official Gazette", formal instrument)
Letterhead with document type/status, double-ruled title block with preamble, red "proposal" stamp + dashed
status badge, the data `footer` shown verbatim in a red notice box, framed articles with strict
`N.M` clause numbering, and an approval block with **empty** labelled signature lines (chair, class-committee
representative: name / signature / date). No document numbers, dates or names are shown — none exist yet.

## Behaviour
- Back button: `router.back()` if the referrer is same-origin, otherwise `router.push('/')`; plus a link to the
  committee corner.
- Sticky index (mobile bar with disclosure, desktop side panel) with active-section tracking, reading-progress
  ruler, skip link, PDF export (hidden print layout incl. notice + blank signature lines), share.
- he = RTL, ru = LTR. For ru the Cyrillic face (Noto Serif) is put first in the font stacks, because next/font's
  metric fallbacks (Arial/Times) contain Cyrillic and would otherwise win over Noto Serif.

## When the proposal is approved
Update the data file (title/footer), switch the stamp to `ink="blue"` with approved wording, change the status
strings, and fill the signature block from real data — do not hard-code names.
