# Meeting Agenda Feature — Design Spec
**Date:** 2026-05-17  
**Status:** Approved

## Problem

The parent committee meets every few months. Between meetings, topics accumulate but get forgotten. There is no shared place to collect agenda items before the meeting. The admin needs a way to share a link so any parent can submit topics, and the committee can track discussion status during the meeting itself.

---

## Solution

A new **Meeting Agenda** feature: the admin creates a meeting, shares a URL, parents submit topics without logging in. During the meeting, the admin updates each topic's status in real-time.

Follows the existing **token-based sharing pattern** (same as grocery lists — no auth required, access via URL token).

---

## Database Schema

### `meetings`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | TEXT NOT NULL | e.g. "ישיבת ועד — מאי 2026" |
| `meeting_date` | DATE | Optional scheduled date |
| `token` | TEXT UNIQUE NOT NULL | Random hex, used in shareable URL |
| `status` | TEXT NOT NULL | `active` or `archived`. Default: `active` |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto |

**Constraint:** Only one `active` meeting should exist at a time (enforced at API level, not DB constraint).

### `meeting_subjects`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `meeting_id` | UUID NOT NULL | FK → `meetings.id` ON DELETE CASCADE |
| `title` | TEXT NOT NULL | The topic/subject text |
| `submitter_name` | TEXT NOT NULL | Self-declared name of the parent |
| `status` | TEXT NOT NULL | `pending`, `discussed`, or `decided`. Default: `pending` |
| `created_at` | TIMESTAMPTZ | Auto (also used for ordering) |
| `updated_at` | TIMESTAMPTZ | Auto |

### RLS Policies
- `meetings`: Public SELECT, admin INSERT/UPDATE/DELETE
- `meeting_subjects`: Public SELECT + INSERT, admin UPDATE + DELETE

---

## API Routes

All under `/api/meetings/`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/meetings` | Admin | List all meetings (active first, then archived) |
| `POST` | `/api/meetings` | Admin | Create new meeting |
| `PATCH` | `/api/meetings/[id]` | Admin | Update title/date or archive |
| `DELETE` | `/api/meetings/[id]` | Admin | Delete meeting + all subjects |
| `GET` | `/api/meetings/[token]/subjects` | Public | Get all subjects for a meeting by token |
| `POST` | `/api/meetings/[token]/subjects` | Public | Submit a new subject |
| `PATCH` | `/api/meetings/subjects/[id]` | Admin | Change subject status |
| `DELETE` | `/api/meetings/subjects/[id]` | Admin | Delete a subject |

**Token validation:** If token does not match any meeting, return 404. If meeting is `archived`, `POST /subjects` returns 403 with Hebrew error message.

---

## Pages

### Public Page — `/he/meeting/[token]`
- **No authentication required**
- Layout (RTL, mobile-first):
  1. Header: meeting title + date + subject count
  2. Submission form (top): "מה הנושא?" field + "השם שלך" field + submit button
  3. Subject list (below form): each subject shows title, submitter name, and color-coded status badge
- **Status badge colors:** ממתין = yellow, נדון = blue, הוחלט = green
- **Admin view (when auth cookie present):** same page, but each subject shows inline status action buttons (ממתין / נדון / הוחלט). Current status is highlighted; clicking another triggers a PATCH. The page is NOT middleware-protected — it uses an optional server-side JWT check (`verifyJWT()`) to detect admin presence and pass `isAdmin: boolean` as a prop to the client component. Middleware is not involved.
- **Archived meeting:** form is hidden, read-only banner shown ("ישיבה זו הסתיימה")
- **Invalid token:** Next.js `notFound()` — standard 404 page
- **Real-time:** page polls every 15 seconds (or React Query refetch) so parents see new subjects appear without refreshing

### Admin Panel — `/he/admin`
- New **"ישיבות ועד"** card in the dashboard grid (alongside Tasks, Issues, Tickets)
- Card shows: active meeting name + subject count, or "אין ישיבה פעילה" if none
- Buttons: "צור ישיבה חדשה", "פתח ישיבה", "העתק קישור", "העבר לארכיון"
- Archived meetings shown in a collapsed list below the active meeting

---

## Component Structure

```
src/
├── app/
│   ├── [locale]/
│   │   └── meeting/
│   │       └── [token]/
│   │           └── page.tsx          # Public meeting page
│   └── api/
│       └── meetings/
│           ├── route.ts              # GET (list), POST (create)
│           ├── [id]/
│           │   └── route.ts          # PATCH (update/archive), DELETE
│           ├── [token]/
│           │   └── subjects/
│           │       └── route.ts      # GET (public), POST (public submit)
│           └── subjects/
│               └── [id]/
│                   └── route.ts      # PATCH (status), DELETE
├── components/
│   └── features/
│       └── meetings/
│           ├── MeetingPage.tsx       # Main public page component
│           ├── SubjectForm.tsx       # Submission form
│           ├── SubjectList.tsx       # List of subjects
│           ├── SubjectCard.tsx       # Single subject row with status
│           └── AdminMeetingCard.tsx  # Admin dashboard card
```

---

## Data Flow

**Parent submits a topic:**
1. Parent opens WhatsApp link → `/he/meeting/[token]`
2. Fills form → POST `/api/meetings/[token]/subjects`
3. API validates token (404 if invalid, 403 if archived), inserts row
4. React Query invalidates subject list → new topic appears for everyone

**Admin changes status during meeting:**
1. Admin is authenticated (has `auth-token` cookie)
2. Same public URL, but admin UI layer visible
3. Clicks status button → PATCH `/api/meetings/subjects/[id]`
4. API verifies admin auth, updates `status` field
5. React Query refetch updates all viewers

---

## Internationalization

New translation keys needed in `messages/he.json` and `messages/ru.json`:

```json
"Meetings": {
  "title": "ישיבות ועד",
  "noActiveMeeting": "אין ישיבה פעילה כרגע",
  "createNew": "צור ישיבה חדשה",
  "copyLink": "העתק קישור",
  "openMeeting": "פתח ישיבה",
  "archive": "העבר לארכיון",
  "archived": "ארכיון",
  "active": "פעילה",
  "subjectPlaceholder": "מה הנושא לדיון?",
  "submitterPlaceholder": "השם שלך",
  "submit": "הוסף נושא",
  "submitSuccess": "הנושא נוסף בהצלחה",
  "subjects": "נושאים",
  "archivedBanner": "ישיבה זו הסתיימה",
  "status": {
    "pending": "ממתין",
    "discussed": "נדון",
    "decided": "הוחלט"
  }
}
```

---

## Migration

New file: `supabase/migrations/20260517000000_create_meetings.sql`

Creates both tables, RLS policies, and a trigger for `updated_at`.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Invalid token | `notFound()` → 404 page |
| Archived meeting, trying to submit | 403 + Hebrew error message |
| Empty title or submitter name | Zod validation, inline error |
| Title > 300 chars | Zod validation, inline error |
| Admin tries to create second active meeting | API returns 409, UI shows error |
| Network error on submit | Toast error, form stays filled |

---

## Out of Scope

- Email/WhatsApp notifications when a subject is added
- Voting on subjects
- Editing or deleting your own submission (as a parent)
- Multiple language support for the meeting page (Hebrew only for now)
