# Development Rules — BeeriManager

> **Stack.** Next.js 14+ · TypeScript strict · Supabase · Tailwind · shadcn/ui · next-intl · Playwright · Vercel
>
> **Enforcement.** `[auto]` = ESLint/TypeScript catches it (zero dev cost). `[review]` = catch it in code review. `[test]` = Playwright CI.
>
> **Scope.** Rules here prevent bugs that have happened or would be catastrophic. Obvious best practices, tech-choice opinions, and anything already in `CLAUDE.md` are not repeated.

---

## 1. TypeScript — all auto, zero cost

**R-1 [auto]** `tsconfig.json` strict mode is on and must stay on. No `// @ts-nocheck`. `// @ts-expect-error` needs a comment explaining why.

**R-2 [auto]** No raw `any`. Use `z.infer<>` or explicit types. Wrap third-party `any` in a typed helper in `lib/`.

**R-3 [auto]** No non-null `!` assertions in feature code. Handle `null | undefined` explicitly.

**R-4 [auto]** No floating promises. Every `Promise` is `await`-ed or `.catch()`-ed. `void` only with a comment.

---

## 2. Supabase & API — critical correctness

**R-5 [review] — Two clients, never mixed.**
- `createClient()` from `@/lib/supabase/server` → API routes & server components only (service role key, bypasses RLS)
- `supabase` from `@/lib/supabase/client` → browser code only (anon key, RLS enforced)

Swapping these is a security hole or a permission error. The distinction is the most common source of bugs in this codebase.

**R-6 [review] — force-dynamic on real-time routes.** Any route that must never be CDN-cached (urgent messages, admin data) must export:
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```
Forgetting this caused stale data bugs in production.

**R-7 [review] — Consistent response envelope.**
```typescript
{ data: T, success: true }          // success
{ error: string, success: false }   // error — message in Hebrew
```
Never return bare objects or raw Supabase errors to the client.

**R-8 [review] — Auth check before any write.** Admin routes call `verifyJWT()` before touching the DB. No exceptions, no trust-the-client patterns.

**R-9 [review] — RLS on every new table.** New migrations must include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and at least one `CREATE POLICY`.

**R-10 [review] — Additive migrations only.** New columns are nullable or have a default. Never drop a column still referenced in code. Never add NOT NULL without a backfill default on a populated table.

**R-11 [review] — Parameterised queries.** Supabase `.eq()` / `.filter()` API only — no string interpolation into query fragments.

---

## 3. Security — absolute rules

**R-12 [review]** JWT lives in an `httpOnly, Secure, SameSite=Lax` cookie named `auth-token`. Never `localStorage`, never `sessionStorage`, never in a JS-accessible variable.

**R-13 [auto]** No secrets in git. `SUPABASE_SERVICE_ROLE_KEY` is server-only — never in a `NEXT_PUBLIC_` var. `.env*` files are git-ignored.

**R-14 [review]** Never delete production DB data without explicit user confirmation. Destructive migrations need a backup step first.

---

## 4. i18n & RTL — required for the product to work

**R-15 [review]** No hard-coded user-facing strings. Every string goes through `useTranslations()` / `getTranslations()` with a key in `messages/he.json` and `messages/ru.json`.

**R-16 [review]** Both locale files updated in the same commit. A key missing in either file is a runtime crash, not a warning.

**R-17 [review]** RTL layout via Tailwind logical properties: `ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`. Never `pl-`, `pr-`, `text-left`, `text-right` in component code — they silently break Hebrew layout.

---

## 5. Mobile-first — core to the product

**R-18 [review]** Build and verify at 375×812 first. A feature that breaks on mobile is broken, regardless of desktop.

**R-19 [review]** Touch targets ≥ 44×44 CSS px. No 20px tap zones.

**R-20 [review]** No hover-only interactions. Anything on `:hover` must also be accessible on tap.

**R-21 [test]** Playwright E2E defaults to `{ width: 375, height: 812 }`. Desktop assertions are additive.

---

## 6. Error handling — don't hide failures

**R-22 [review]** API routes are wrapped in try/catch. Errors return `{ error: 'Hebrew message', success: false }` with the appropriate HTTP status. Raw error objects never leave the server.

**R-23 [review]** Never swallow errors silently. Catch only to rethrow, return an error response, or degrade with a visible user message.

---

## 7. Git — per CLAUDE.md, restated once

**R-24 [review]** Never `git add .` or `git add -A`. Stage explicit file paths only.

**R-25 [review]** Never push without explicit user instruction.

**R-26 [review]** No force-push to `main`.

**R-27 [review]** Conventional commit types: `feat` / `fix` / `refactor` / `chore` / `docs` / `i18n` / `style` / `test`.

---

## Change process

Rules change when a real bug or incident reveals a gap. Adding a rule requires updating this file with the trigger. Retired rules move to `## Retired` with date and reason so old `// per R-N` comments stay decodable.

---

## See Also

- `CLAUDE.md` — takes precedence over this file
- `supabase/migrations/` — migration history
- `tests/` — Playwright E2E suites
