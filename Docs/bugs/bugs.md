# Bugs found + fixed

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
