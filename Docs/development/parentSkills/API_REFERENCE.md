# Parent Skills Survey - API Reference

## Overview

The Parent Skills Survey exposes 4 API endpoints: one public (form submission) and three admin-only (list, delete, export).

**Base URL:** `/api/surveys/skills`

**Authentication Pattern:**
- Public endpoints: No auth required
- Admin endpoints: JWT token in `auth-token` cookie, verified via `verifyJWT()`

**Response Format:**
```typescript
// Success
{ success: true, data?: T, message?: string }

// Error
{ success: false, message: string, errors?: Record<string, string[]> }
```

---

## 1. POST `/api/surveys/skills` - Submit Survey Response

**Auth:** None (public endpoint)

**Purpose:** Submit a new parent skill survey response.

### Request

```typescript
// Headers
Content-Type: application/json

// Body (SkillSurveyFormData)
{
  "parent_name"?: string,       // Optional (min 2 chars if provided)
  "phone_number"?: string,      // Israeli format: 050-1234567, +972501234567, etc.
  "email"?: string,             // Valid email format
  "skills": SkillCategory[],    // Required, 1-10 items
  "student_grade": GradeLevel,  // Required: "aleph" through "yud-bet" (Hebrew letters)
  "preferred_contact": ContactPreference, // "phone" | "email" | "whatsapp" | "any"
  "additional_notes"?: string,  // Max 1000 chars
  "other_specialty"?: string    // Required if skills includes "other", max 200 chars
}
```

### Validation Rules (Zod)

1. `phone_number` or `email` must be provided (cross-field validation)
2. If `skills` includes `"other"`, `other_specialty` must be non-empty
3. Israeli phone regex: `/^(\+972|972|0)?[2-9]\d{7,8}$/`
4. Skills array: min 1, max 10

### Response

**201 Success:**
```json
{
  "success": true,
  "message": "thanks message in Hebrew",
  "response_id": "uuid-string"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "message": "invalid data message in Hebrew",
  "errors": {
    "phone_number": ["Israeli phone number invalid"],
    "skills": ["Must select at least one skill"]
  }
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "error saving message in Hebrew"
}
```

### Implementation Details

- IP address captured from `x-forwarded-for` or `x-real-ip` headers
- User agent captured from `user-agent` header
- Locale detected from `accept-language` header (defaults to `"he"`)
- `school_id` set to `DEFAULT_SCHOOL_ID` (env or hardcoded UUID)
- Database INSERT uses `.select('id').single()` to return the new row's ID

**Source:** `src/app/api/surveys/skills/route.ts` (POST handler)

---

## 2. GET `/api/surveys/skills` - List Responses with Filters

**Auth:** Required (JWT in `auth-token` cookie)

**Purpose:** Fetch all survey responses with optional filtering, plus inline statistics.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `skill` | `SkillCategory` | No | Filter by specific skill (uses `@>` array contains) |
| `contact_preference` | `ContactPreference` | No | Filter by preferred contact method |
| `search` | `string` | No | Free text search across `parent_name`, `phone_number`, `additional_notes`, `other_specialty` (uses `ilike`) |
| `date_from` | `ISO datetime` | No | Filter responses created after this date |
| `date_to` | `ISO datetime` | No | Filter responses created before this date |

### Response

**200 Success:**
```typescript
{
  "success": true,
  "data": ParentSkillResponse[],  // Array of all matching responses
  "stats": {
    "total_responses": number,
    "skill_breakdown": Record<SkillCategory, number>,  // Count per skill
    "contact_breakdown": Record<ContactPreference, number>,  // Count per preference
    "anonymous_count": number,  // Responses without parent_name
    "recent_responses": number  // Responses from last 7 days
  },
  "total": number  // Exact count from Supabase
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "admin permission required (Hebrew)"
}
```

### Implementation Details

- Filters validated with `skillResponseFiltersSchema` (Zod)
- Query always filters: `school_id = DEFAULT_SCHOOL_ID` and `deleted_at IS NULL`
- Results ordered by `created_at DESC` (newest first)
- Statistics calculated inline in `calculateStats()` function (not a separate DB query)
- Search uses Supabase `.or()` with `ilike` across 4 columns
- Skill filter uses `.contains('skills', [skill])` (PostgreSQL `@>` operator via GIN index)
- Uses `{ count: 'exact' }` for total count

**Source:** `src/app/api/surveys/skills/route.ts` (GET handler)

---

## 3. DELETE `/api/surveys/skills/[id]` - Soft Delete Response

**Auth:** Required (JWT in `auth-token` cookie)

**Purpose:** Soft-delete a survey response by setting `deleted_at` timestamp.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `UUID` | Yes | The response ID to delete |

### Response

**200 Success:**
```json
{
  "success": true,
  "message": "response deleted successfully (Hebrew)",
  "id": "uuid-string"
}
```

**400 Bad Request (missing ID):**
```json
{
  "success": false,
  "message": "invalid response ID (Hebrew)"
}
```

**404 Not Found / Already Deleted:**
```json
{
  "success": false,
  "message": "response not found or already deleted (Hebrew)"
}
```

### Implementation Details

- Uses Supabase `.update({ deleted_at: new Date().toISOString() })`
- Guards against double-delete with `.is('deleted_at', null)`
- Detects "not found" via Supabase error code `PGRST116`
- The response data is NOT actually removed from the database
- Route has `export const dynamic = 'force-dynamic'` for cookie-based auth

**Source:** `src/app/api/surveys/skills/[id]/route.ts`

---

## 4. GET `/api/surveys/skills/export` - CSV Export

**Auth:** Required (JWT in `auth-token` cookie)

**Purpose:** Export all non-deleted responses as a downloadable CSV file.

### Response

**200 Success:**
Returns a CSV file download with:
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="parent-skills-{timestamp}.csv"`
- UTF-8 BOM (`\uFEFF`) prepended for Hebrew character support in Excel

**CSV Columns (Hebrew headers):**

| Column | Hebrew Header | Source |
|--------|---------------|--------|
| Submission Date | `date of submission (Hebrew)` | `created_at` formatted as `he-IL` |
| Parent Name | `parent name (Hebrew)` | `parent_name` or "anonymous (Hebrew)" |
| Phone | `phone (Hebrew)` | `phone_number` |
| Email | `email (Hebrew)` | `email` |
| Skills | `skills (Hebrew)` | Skills array mapped through `SKILL_NAMES_HE`, comma-separated, quoted |
| Other Details | `other details (Hebrew)` | `other_specialty` (only if "other" in skills), quoted + escaped |
| Preferred Contact | `preferred contact (Hebrew)` | `preferred_contact` mapped through `CONTACT_PREF_NAMES_HE` |
| Additional Notes | `additional notes (Hebrew)` | `additional_notes`, quoted + escaped |

### Implementation Details

- Fetches ALL non-deleted responses for the school (no pagination)
- Skills are translated to Hebrew names via `SKILL_NAMES_HE` lookup
- Contact preference translated via `CONTACT_PREF_NAMES_HE`
- CSV values with commas are wrapped in double quotes
- Internal double quotes are escaped as `""` (CSV standard)
- `other_specialty` only populated when `skills` includes `"other"`
- Route has `export const dynamic = 'force-dynamic'`

**Source:** `src/app/api/surveys/skills/export/route.ts`

---

## Authentication Flow

All admin endpoints follow this pattern:

```typescript
// 1. Extract token from cookie
const token = request.cookies.get('auth-token')

// 2. Verify JWT
if (!token || !verifyJWT(token.value)) {
  return NextResponse.json(
    { success: false, message: 'admin permission required' },
    { status: 401 }
  )
}

// 3. Proceed with operation...
```

The `verifyJWT()` function is imported from `@/lib/auth/jwt` and validates the JWT signature against the `JWT_SECRET` environment variable.

---

## Error Handling Pattern

All endpoints use try/catch with consistent error responses:

```typescript
try {
  // ... operation
} catch (error) {
  console.error('Error description:', error)
  return NextResponse.json(
    { success: false, message: 'Hebrew error message' },
    { status: 500 }
  )
}
```

All user-facing error messages are in Hebrew.
