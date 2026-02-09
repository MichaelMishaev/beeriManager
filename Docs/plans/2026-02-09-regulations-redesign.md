# Regulations Page Redesign

## Date: 2026-02-09

## Goal
Modernize the regulations page (`/he/regulations`) from a wall-of-text document into a clean, collapsible, Apple/Notion-style document viewer. Must work in both standalone page and footer modal contexts. RTL-first.

## Design Decisions

### Header
- Clean white background replaces navy gradient
- Slim gold top bar (4px) for official feel
- Title in large bold navy text
- Metadata as subtle dot-separated chips on one line
- Approval badge as slim inline green pill
- Share + PDF buttons with text labels in toolbar row
- Target height: ~180px mobile (down from ~300px)

### Collapsible Sections
- Each section is a tappable card using native `<details>`/`<summary>`
- First section expanded on load, rest collapsed
- Whole row is tappable, not just chevron
- Chevron on left (end in RTL), number circle on right (start in RTL)
- Multiple sections can be open simultaneously
- Expanded state: faint blue-gray background, right border (RTL)
- Subsections render as indented content (not nested collapsibles)
- Bullet lists use proper `<ul>`/`<li>` elements
- Appendix: same pattern with gold right-border

### Bottom Navigation
- Floating progress pill at bottom center: shows `3 / 9`
- Tap to open quick-jump overlay (mini TOC)
- Appears only after scrolling past header
- Semi-transparent with backdrop blur
- 2px gold scroll progress bar at top of viewport (fills right-to-left in RTL)
- Smooth scroll + auto-expand when jumping to section

### RTL
- All positioning uses logical properties: `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`
- Borders use `border-e-` / `border-s-`
- Gradients flip with `rtl:` variants
- Chevron mirrors correctly

### Accessibility
- `<main>` landmark wrapping content
- Native `<details>`/`<summary>` for keyboard + screen reader support
- Skip-to-content link
- WCAG AA contrast (4.5:1 minimum)
- `aria-current` on active section in quick-jump
- Semantic `<ul>`/`<li>` for all lists

### Responsive
- Mobile (< 768px): Full-width cards, floating pill, compact header ~160px
- Desktop (768px+): max-w-3xl centered, larger type, decorative divider
- Modal (standalone=false): More compact header, no logo, ScrollArea wraps content, no floating pill

## Files to Change
- `src/components/features/protocols/RegulationsModalContent.tsx` — Full rewrite
- `src/app/[locale]/regulations/page.tsx` — Remove wrapper padding

## Files Unchanged
- `src/lib/regulations/content-data.ts` — Data structure works as-is
- `src/components/features/protocols/regulations-content.ts` — Re-exports unchanged

## Component Architecture
All sub-components are local to RegulationsModalContent.tsx:
- `RegulationsHeader` — Compact white header
- `CollapsibleSection` — `<details>`/`<summary>` wrapper
- `FloatingProgressPill` — Fixed pill with quick-jump
- `ScrollProgressBar` — 2px gold progress bar

## State Management
- `useRef` for scroll container tracking
- `IntersectionObserver` for detecting visible section
- No Zustand, no React Query (static content page)
