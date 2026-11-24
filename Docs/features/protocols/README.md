# Protocols: admin add/edit and "Format with AI"

## What exists
- Public: `/[locale]/protocols` (list) and `/[locale]/protocols/[id]` (detail). The detail page renders `agenda`, `decisions` and `action_items` as **plain text** (`whitespace-pre-wrap`, with `@Title[task:id]` mentions turned into task badges). `extracted_text` is not shown publicly.
- Admin: `/admin/protocols/new` and `/admin/protocols/[id]` (reached from the "more" page row "add protocol"). Content fields: agenda, decisions, action items (task-mention textareas), plus file upload.
- No schema change was needed: the three text columns are `TEXT` (migration `scripts/migrations/010_add_protocols_content_fields.sql`).

## Format with AI
Each of the three content fields (agenda, decisions, action items), on both the add and edit pages, has a **"עיצוב עם AI" / "Оформить с помощью ИИ"** button next to it.

- Paste long raw text into the field, press the button. While running the button is disabled with a spinner.
- On success the field is replaced by the formatted text (still editable); an **undo** button restores the pre-format text (one step).
- On failure an inline translated error is shown and the text is left untouched.
- Disabled while the field has fewer than 20 characters.
- Nothing is saved until the admin presses the normal save button.

### Output format
Plain text, matching what the public page renders: short paragraphs separated by blank lines, `- ` bullets, `1. ` numbering. No HTML and no Markdown, so there is nothing to sanitize on the public page. Task mentions `@Title[task:id]` are swapped for `[[M1]]`-style placeholders before the model call and restored afterwards; if the model drops or duplicates one, the result is rejected (`ai_altered`).

### Server route
`POST /api/protocols/format` (admin only, `force-dynamic`)
- Auth: `auth-token` cookie, `verifyJWT`, role `admin`; otherwise 401 `{code:'unauthorized'}`.
- Body: `{ text: string }` (zod, trimmed, non-empty). Max **30,000 characters** (413 `{code:'too_long', maxChars}`).
- Success: `{ success: true, data: { text } }`. Failure: `{ success:false, code }` with code one of `invalid_input`, `too_long`, `ai_unavailable` (503), `ai_failed`, `ai_empty`, `ai_truncated`, `ai_altered` (502). The client maps codes to `admin.records.protocols.aiFormat.errors.*`.
- Model: `AI_CONFIG.model` (`gpt-6.1-terra`), `reasoning_effort: AI_CONFIG.reasoning_effort`, `max_completion_tokens: 16000`. The prompt forbids translating, inventing, merging or dropping content. A result shorter than half the input is rejected.
- Never writes to the database.

### Files
- `src/lib/ai/formatProtocolText.ts`, `src/app/api/protocols/format/route.ts`
- `src/components/features/admin/AiFormatButton.tsx`
- Translations: `admin.records.protocols.aiFormat` in `messages/he.json` and `messages/ru.json`
- Tests: `tests/e2e/admin/protocol-format.spec.ts` (route mocked; needs `ADMIN_PASSWORD` in the environment to log in)

### Known limits
- `src/lib/openai/formatText.ts` (HTML formatter for uploaded PDF/DOCX, `gpt-4o-mini`, 16k chars, silently truncates) is a different path and was not changed.
- The page's existing `sonner` toasts do not display, because only the shadcn `<Toaster />` is mounted in `src/app/[locale]/layout.tsx`. The new button therefore shows inline messages instead.
