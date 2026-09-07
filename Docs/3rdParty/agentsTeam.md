# BeeriManager Agent Teams

This file is updated at the start of each dev-team session by the `beerimanager-dev-team` skill.
For the team skill, run `/beerimanager-dev-team` and describe the mission.

---

## Quick Reference — Team Configs

### Config A — Simple (1 area changes)
Use when: only API routes, only UI, or only a migration.

| Agent | File Zone | Role |
|---|---|---|
| `dev` | one zone: `src/app/api/` OR `src/components/` + `src/app/[locale]/` | implement |
| `qa` | reads all, writes `Docs/development/bugs.md` | acceptance gate + Playwright sub-agent |

### Config B — Cross-cutting (API + UI both change)
Use when: new feature that touches both API routes and components.

| Agent | File Zone | Role |
|---|---|---|
| `dev-api` | `src/app/api/` + `supabase/migrations/` | API + DB |
| `dev-ui` | `src/components/` + `src/app/[locale]/` + `messages/` | UI + i18n |
| `qa` | reads all, writes `Docs/development/bugs.md` | acceptance gate + Playwright sub-agent |

### Add `e2e` to either config when new Playwright tests are needed.
File zone: `tests/` only.

---

## Dev Commands

```bash
npm run dev          # dev server on :4500
npm run type-check   # TypeScript strict
npm run lint         # ESLint
npm test             # Playwright (all)
npm run test:mobile  # Playwright mobile viewport
```

---

## QA Sub-Agent

When QA runs Playwright tests it spawns a sub-agent so it doesn't block:

```
Agent({
  description: "Run Playwright E2E tests",
  prompt: "Run `npm test` in the BeeriManager project root. Report: PASS (N tests) or FAIL
           (list failing test names + first error each). Nothing else."
})
```

---

## Session Log

| Date | Mission | Config | Outcome |
|---|---|---|---|
| — | — | — | — |

*(Updated each session)*

---

## Key Rules for All Agents

- TypeScript strict — `npm run type-check` must stay green
- All strings via `useTranslations()` — no hard-coded Hebrew/Russian
- Supabase server client (`createClient`) in API routes only; anon client in browser only
- RTL spacing: `ps-`/`pe-`/`ms-`/`text-start` — never `pl-`/`pr-`/`text-left`
- Test at 375px mobile width
- Never push without lead's explicit instruction

Full rules: `Docs/3rdParty/devRules.md`
