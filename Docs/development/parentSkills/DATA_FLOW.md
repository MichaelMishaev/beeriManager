# Parent Skills Survey - Data Flow & Architecture

## Overview

This document maps the end-to-end data flow for both the public submission and admin consumption paths, including state management patterns and integration points.

---

## 1. Public Submission Flow

```
Parent clicks WhatsApp link
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Browser navigates to /he/surveys/skills                        │
│  Next.js resolves: [locale]/surveys/skills/page.tsx             │
│  Server renders: <SkillSurveyForm />                           │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Welcome Screen                                         │
│  ─────────────────────                                          │
│  State: currentStep = 'welcome'                                 │
│  Action: User clicks "Start" button                             │
│  Effect: setCurrentStep('skills')                               │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Skills Selection                                       │
│  ─────────────────────────                                      │
│  State: selectedSkills[], searchQuery                           │
│  Data: getSortedSkillCategories() -> sorted by Hebrew name      │
│  Filtering: useMemo -> filter by searchQuery match              │
│  Action: Toggle skill -> handleSkillToggle()                    │
│          Updates: selectedSkills + form.setValue('skills')       │
│  If "other" selected:                                           │
│    -> Auto-scroll to other_specialty input                      │
│    -> Require text before proceeding                            │
│  Action: handleSkillsNext() validates & setCurrentStep('grade') │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Grade Selection                                        │
│  ────────────────────────                                       │
│  Data: GRADE_LEVELS constant (12 Hebrew letters)                │
│  Action: Click grade -> form.setValue('student_grade', grade)   │
│  Action: Click "Continue" -> setCurrentStep('details')          │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Contact Details                                        │
│  ────────────────────────                                       │
│  Fields: phone_number, parent_name, email, additional_notes     │
│  Managed by: React Hook Form + Zod resolver                    │
│  Action: Submit -> handleSubmit(onSubmit)                       │
│          Zod validation runs:                                   │
│            - Israeli phone regex                                │
│            - Cross-field: phone OR email required                │
│            - Cross-field: other_specialty if "other" selected   │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼ (validation passes)
┌─────────────────────────────────────────────────────────────────┐
│  API Call                                                       │
│  ────────                                                       │
│  fetch('/api/surveys/skills', {                                 │
│    method: 'POST',                                              │
│    headers: { 'Content-Type': 'application/json' },             │
│    body: JSON.stringify(formData)                                │
│  })                                                             │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server: POST /api/surveys/skills                               │
│  ─────────────────────────────────                              │
│  1. Parse JSON body                                             │
│  2. Validate with skillSurveySchema.safeParse()                 │
│  3. Extract metadata:                                           │
│     - IP from x-forwarded-for / x-real-ip                       │
│     - User agent from user-agent header                         │
│     - Locale from accept-language header                        │
│  4. Supabase INSERT into parent_skill_responses:                │
│     - school_id = DEFAULT_SCHOOL_ID                             │
│     - All form fields + metadata fields                         │
│     - .select('id').single()                                    │
│  5. Return { success: true, response_id }                       │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase / PostgreSQL                                          │
│  ─────────────────────                                          │
│  RLS: "Anyone can submit" policy (INSERT, public, no auth)      │
│  Trigger: update_parent_skill_responses_updated_at()            │
│  Constraints: valid_phone, valid_skills checked                 │
│  Row created with auto-generated UUID and timestamps            │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Success Response -> Client                                     │
│  ──────────────────────────                                     │
│  { success: true, message: "...", response_id: "uuid" }         │
│  Client: setIsSubmitted(true) -> renders Success Screen         │
│  Success screen: animated checkmark, thank you, "Back to home"  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Admin Consumption Flow

```
Admin navigates to /he/admin/surveys/skills
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js Route: [locale]/(admin)/admin/surveys/skills/page.tsx  │
│  Middleware: verifies auth-token JWT cookie                      │
│  Renders: <SkillsAdminDashboard />                             │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Initial Data Load                                              │
│  ─────────────────                                              │
│  React Query: useQuery(['skill-responses', {}])                 │
│  fetch('/api/surveys/skills', {                                 │
│    credentials: 'include',  // Send auth-token cookie           │
│    headers: { 'Cache-Control': 'no-cache' }                     │
│  })                                                             │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server: GET /api/surveys/skills                                │
│  ─────────────────────────────                                  │
│  1. Verify JWT from auth-token cookie                           │
│  2. Parse & validate query params with Zod                      │
│  3. Build Supabase query:                                       │
│     - .from('parent_skill_responses')                           │
│     - .select('*', { count: 'exact' })                          │
│     - .eq('school_id', DEFAULT_SCHOOL_ID)                       │
│     - .is('deleted_at', null)                                   │
│     - .order('created_at', { ascending: false })                │
│     - Apply skill filter: .contains('skills', [skill])          │
│     - Apply contact filter: .eq('preferred_contact', pref)      │
│     - Apply search: .or('name.ilike, phone.ilike, notes.ilike') │
│  4. Calculate stats inline from returned data:                  │
│     - total_responses, skill_breakdown, contact_breakdown       │
│     - anonymous_count, recent_responses (7 days)                │
│  5. Return { data, stats, total }                               │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard Renders                                              │
│  ─────────────────                                              │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ SkillsStatsCards                                     │       │
│  │ [Total] [This Week] [WhatsApp Pref] [Top Skills]    │       │
│  └──────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ Filter Controls                                      │       │
│  │ [Search...] [Skill Dropdown] [Contact Dropdown]      │       │
│  └──────────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ SkillsResponsesTable                                 │       │
│  │ Name | Grade | Skills | Contact | Phone | Actions    │       │
│  │  ... expandable rows with full details ...           │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Filter/Search Data Flow

```
User types in search box
        │
        ▼
searchInput state updates (immediate)
        │
        ▼
useDebounce(searchInput, 300) ──── 300ms delay ────┐
        │                                           │
        ▼                                           │
(Loading indicator shown if                         │
 debouncedSearch !== searchInput)                    │
                                                    │
                              debouncedSearch updates ◄┘
                                        │
                                        ▼
                              useEffect: setFilters({
                                ...prev,
                                search: debouncedSearch || undefined
                              })
                                        │
                                        ▼
                              React Query detects filters change
                              (queryKey: ['skill-responses', filters])
                                        │
                                        ▼
                              Auto-refetch from API with new params
                                        │
                                        ▼
                              Table and stats re-render with results
```

### Dropdown Filter Flow

```
User selects skill from dropdown
        │
        ▼
setFilters({ ...filters, skill: value === 'all' ? undefined : value })
        │
        ▼
React Query auto-refetches (filters in queryKey)
        │
        ▼
API returns filtered results + recalculated stats
```

---

## 4. Delete Flow

```
Admin clicks trash icon on row
        │
        ▼
setResponseToDelete(id)
setDeleteDialogOpen(true)
        │
        ▼
┌─────────────────────────────────────┐
│  AlertDialog: "Delete this response?"│
│  [Cancel]  [Delete]                  │
└─────────────────────────────────────┘
        │
        ▼ (User clicks Delete)
handleDeleteConfirm()
setIsDeleting(true)
        │
        ▼
fetch(`/api/surveys/skills/${id}`, { method: 'DELETE' })
        │
        ▼
Server: UPDATE parent_skill_responses
        SET deleted_at = NOW()
        WHERE id = $id AND deleted_at IS NULL
        │
        ▼
Response: { success: true }
        │
        ▼
toast("Response deleted successfully")
setDeleteDialogOpen(false)
onResponseDeleted() -> parent calls refetch()
        │
        ▼
React Query refetches -> table re-renders without deleted row
```

---

## 5. CSV Export Flow

```
Admin clicks "Export to Excel" button
        │
        ▼
handleExport()
        │
        ▼
fetch('/api/surveys/skills/export', { credentials: 'include' })
        │
        ▼
Server: Fetches ALL non-deleted responses
        Maps skills -> Hebrew names (SKILL_NAMES_HE)
        Maps contact prefs -> Hebrew (CONTACT_PREF_NAMES_HE)
        Builds CSV with Hebrew headers
        Prepends UTF-8 BOM (\uFEFF)
        Returns as text/csv attachment
        │
        ▼
Client receives blob
        │
        ▼
Creates temporary <a> element
Sets href = URL.createObjectURL(blob)
Sets download = "parent-skills-{timestamp}.csv"
Triggers click
Revokes object URL
        │
        ▼
Browser downloads CSV file
(Opens correctly in Excel with Hebrew characters)
```

---

## 6. WhatsApp Share Flow

```
User clicks ShareButton on SkillsSurveyCard
        │
        ▼
formatSkillsSurveyShareData(locale)
  Returns: { title, text, url }
  text includes: emotionally engaging Hebrew/Russian message
  url: https://beeri.online/{locale}/surveys/skills
        │
        ▼
ShareButton component:
  If Web Share API available:
    navigator.share({ title, text, url })
  Else (fallback):
    Open WhatsApp web: wa.me/?text={encoded message}
        │
        ▼
Recipient receives WhatsApp message with survey link
  Clicks link -> opens survey in browser
  (Flow returns to Public Submission Flow above)
```

---

## 7. State Management Strategy

| Layer | Tool | Purpose |
|-------|------|---------|
| **Form State** | React Hook Form | Field values, validation, errors, submission |
| **Server State** | TanStack React Query | API data fetching, caching, refetching |
| **UI State** | React useState | Step navigation, expanded rows, dialogs, search input |
| **Debounced State** | useDebounce hook | 300ms delay on search input |
| **Derived State** | useMemo | Filtered skills list based on search query |

### React Query Cache Strategy

```typescript
queryKey: ['skill-responses', filters]
```

- **Cache invalidation:** Automatic when `filters` object reference changes
- **Stale time:** Default (0ms, always refetch on mount)
- **Refetch trigger:** Filter change, manual `refetch()` after delete
- **No cache:** `Cache-Control: no-cache` header prevents HTTP caching

---

## 8. Integration Points with BeeriManager

| Integration | How | File |
|-------------|-----|------|
| **Homepage** | `SkillsSurveyCard` rendered in `PublicHomepage.tsx` | `src/components/features/homepage/SkillsSurveyCard.tsx` |
| **Floating Menu** | "Survey" button scrolls to `#survey-section` | `src/components/ui/FloatingActionMenu.tsx` |
| **Admin Nav** | Link in admin sidebar/navigation | Admin layout |
| **WhatsApp** | `formatSkillsSurveyShareData()` generates share text | `src/lib/utils/share-formatters.ts` |
| **Auth** | JWT cookie checked by admin API routes | `src/lib/auth/jwt.ts` |
| **i18n** | `next-intl` translations under `skillsSurvey` namespace | `messages/he.json`, `messages/ru.json` |
| **Database** | Supabase client from `@/lib/supabase/server` | `src/lib/supabase/server.ts` |

---

## 9. For Standalone Product Extraction

To extract this feature into a standalone product, these are the key dependencies to replicate:

1. **Database:** PostgreSQL with the consolidated schema from `DATABASE_SCHEMA.md`
2. **Auth:** Any JWT-based auth system (replace `verifyJWT()`)
3. **API Framework:** Next.js API routes (or adapt to Express/Fastify)
4. **Frontend:** React with the component tree above
5. **UI Library:** shadcn/ui + Tailwind CSS + Framer Motion
6. **Form Management:** React Hook Form + Zod
7. **Data Fetching:** TanStack React Query
8. **i18n:** next-intl (or any i18n library)
9. **Share Integration:** Web Share API + WhatsApp `wa.me` fallback
10. **Multi-tenancy:** `school_id` column already prepared for SaaS
