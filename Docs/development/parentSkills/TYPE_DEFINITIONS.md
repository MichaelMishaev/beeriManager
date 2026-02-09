# Parent Skills Survey - TypeScript Types & Validation

## Overview

All types, constants, and validation schemas are organized across three files:
- **Types & Constants:** `src/types/parent-skills.ts`
- **Validation Schemas:** `src/lib/validations/parent-skills.ts`
- **Sorting Utilities:** `src/lib/utils/skills-sorting.ts`

---

## Constants

### `SKILL_CATEGORIES` (28 values)

```typescript
export const SKILL_CATEGORIES = [
  // Professional Services
  'legal', 'medical', 'accounting', 'it_technology',

  // Education & Tutoring
  'teaching_tutoring', 'language_tutoring', 'science_stem', 'library_support',

  // Creative & Media
  'photography', 'graphic_design', 'video_editing', 'arts', 'music', 'writing_editing',

  // Event & Communication
  'event_planning', 'cooking_catering', 'social_media', 'translation',

  // Practical Skills
  'handyman', 'sewing_fashion', 'driving_transport', 'gardening',

  // School Support
  'sports_coaching', 'childcare', 'fundraising', 'office_admin',

  'other',
] as const
```

> **Note:** The DB enum also has `'cleaning'` which is NOT in this array. It was kept in the DB for backwards compatibility.

### `CONTACT_PREFERENCES` (4 values)

```typescript
export const CONTACT_PREFERENCES = ['phone', 'email', 'whatsapp', 'any'] as const
```

### `GRADE_LEVELS` (12 values)

```typescript
export const GRADE_LEVELS = [
  'aleph', 'bet', 'gimel', 'dalet', 'he', 'vav',   // Elementary 1-6
  'zayin', 'chet', 'tet',                            // Middle 7-9
  'yud', 'yud-aleph', 'yud-bet'                      // High 10-12
] as const
```

> These are Hebrew letters representing Israeli school grades (1 through 12).

---

## Hebrew Label Maps

### `SKILL_NAMES_HE` (for display)

```typescript
export const SKILL_NAMES_HE: Record<SkillCategory, string> = {
  legal: 'legal (Hebrew)',
  medical: 'medical (Hebrew)',
  accounting: 'accounting (Hebrew)',
  it_technology: 'IT and technology (Hebrew)',
  teaching_tutoring: 'teaching and tutoring (Hebrew)',
  language_tutoring: 'language tutoring (Hebrew)',
  science_stem: 'science STEM (Hebrew)',
  library_support: 'library support (Hebrew)',
  photography: 'photography (Hebrew)',
  graphic_design: 'graphic design (Hebrew)',
  video_editing: 'video editing (Hebrew)',
  arts: 'art and painting (Hebrew)',
  music: 'music (Hebrew)',
  writing_editing: 'writing and editing (Hebrew)',
  event_planning: 'event planning (Hebrew)',
  cooking_catering: 'cooking and catering (Hebrew)',
  social_media: 'social media management (Hebrew)',
  translation: 'translation (Hebrew)',
  handyman: 'repairs and fixes (Hebrew)',
  sewing_fashion: 'sewing and fashion (Hebrew)',
  driving_transport: 'driving and transport (Hebrew)',
  gardening: 'gardening (Hebrew)',
  sports_coaching: 'sports coaching (Hebrew)',
  childcare: 'babysitting (Hebrew)',
  fundraising: 'fundraising (Hebrew)',
  office_admin: 'office administration (Hebrew)',
  other: 'other (Hebrew)',
}
```

### `CONTACT_PREF_NAMES_HE` (for display)

```typescript
export const CONTACT_PREF_NAMES_HE: Record<ContactPreference, string> = {
  phone: 'phone (Hebrew)',
  email: 'email (Hebrew)',
  whatsapp: 'WhatsApp',
  any: 'any method (Hebrew)',
}
```

---

## Interfaces

### `ParentSkillResponse` (Database Row)

```typescript
export interface ParentSkillResponse {
  id: string
  school_id: string
  parent_name: string | null
  phone_number: string
  email: string | null
  skills: SkillCategory[]
  student_grade: GradeLevel | null
  preferred_contact: ContactPreference
  additional_notes: string | null
  other_specialty: string | null
  submitted_locale: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
}
```

### `SkillSurveyFormData` (Form Submission)

```typescript
export interface SkillSurveyFormData {
  parent_name?: string
  phone_number?: string
  email?: string
  skills: SkillCategory[]
  student_grade: GradeLevel
  preferred_contact: ContactPreference
  additional_notes?: string
  other_specialty?: string
}
```

### `SkillResponseFilters` (Admin Search)

```typescript
export interface SkillResponseFilters {
  skill?: SkillCategory
  contact_preference?: ContactPreference
  search?: string       // Search in parent_name and additional_notes
  date_from?: string
  date_to?: string
}
```

### `SkillResponseStats` (Dashboard Statistics)

```typescript
export interface SkillResponseStats {
  total_responses: number
  skill_breakdown: Record<SkillCategory, number>
  contact_breakdown: Record<ContactPreference, number>
  anonymous_count: number
  recent_responses: number  // Last 7 days
}
```

### `School` (Multi-Tenancy)

```typescript
export interface School {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}
```

### API Response Types

```typescript
export interface SkillSurveySubmitResponse {
  success: boolean
  message: string
  response_id?: string
  errors?: Record<string, string[]>
}

export interface SkillResponsesListResponse {
  success: boolean
  data: ParentSkillResponse[]
  stats: SkillResponseStats
  total: number
  message?: string
}
```

---

## Type Aliases

```typescript
export type SkillCategory = (typeof SKILL_CATEGORIES)[number]
export type ContactPreference = (typeof CONTACT_PREFERENCES)[number]
export type GradeLevel = (typeof GRADE_LEVELS)[number]
```

---

## Zod Validation Schemas

### `skillSurveySchema` (Form Submission)

**Source:** `src/lib/validations/parent-skills.ts`

```typescript
const israeliPhoneRegex = /^(\+972|972|0)?[2-9]\d{7,8}$/

export const skillSurveySchema = z.object({
  parent_name: z.string().trim().min(2).optional().or(z.literal('')),
  phone_number: z.string().trim().regex(israeliPhoneRegex).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  skills: z.array(z.enum([...SKILL_CATEGORIES])).min(1).max(10),
  student_grade: z.enum([...GRADE_LEVELS]),
  preferred_contact: z.enum([...CONTACT_PREFERENCES]),
  additional_notes: z.string().trim().max(1000).optional().or(z.literal('')),
  other_specialty: z.string().trim().max(200).optional().or(z.literal('')),
})
.refine(
  (data) => data.phone_number || data.email,
  { message: 'Must provide phone or email', path: ['phone_number'] }
)
.refine(
  (data) => {
    if (data.skills.includes('other')) {
      return data.other_specialty && data.other_specialty.trim().length > 0
    }
    return true
  },
  { message: 'Must specify other specialty', path: ['other_specialty'] }
)
```

**Cross-field validation rules:**
1. At least one contact method (phone OR email) must be provided
2. If `"other"` is in skills array, `other_specialty` must be non-empty

**Phone validation:** Accepts Israeli formats:
- `050-1234567`
- `0501234567`
- `+972501234567`
- `972501234567`

### `skillResponseFiltersSchema` (Admin Filters)

```typescript
export const skillResponseFiltersSchema = z.object({
  skill: z.enum([...SKILL_CATEGORIES]).optional(),
  contact_preference: z.enum([...CONTACT_PREFERENCES]).optional(),
  search: z.string().trim().max(100).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
})
```

---

## Utility Functions

### `getSortedSkillCategories()`

**Source:** `src/lib/utils/skills-sorting.ts`

Returns all skill categories sorted alphabetically by their Hebrew names using `localeCompare` with Hebrew locale.

```typescript
export function getSortedSkillCategories(): readonly SkillCategory[] {
  return [...SKILL_CATEGORIES].sort((a, b) => {
    const nameA = SKILL_NAMES_HE[a]
    const nameB = SKILL_NAMES_HE[b]
    return nameA.localeCompare(nameB, 'he')
  })
}
```

### `getSortedSkillsWithNames()`

Returns skill categories with Hebrew labels, sorted alphabetically. Used for admin filter dropdowns.

```typescript
export function getSortedSkillsWithNames(): Array<{ value: SkillCategory; label: string }> {
  return getSortedSkillCategories().map((skill) => ({
    value: skill,
    label: SKILL_NAMES_HE[skill],
  }))
}
```

---

## WhatsApp Share Formatter

**Source:** `src/lib/utils/share-formatters.ts`

```typescript
export function formatSkillsSurveyShareData(locale: 'he' | 'ru' = 'he'): ShareData {
  const url = `https://beeri.online/${locale}/surveys/skills`
  // Returns { title, text, url } with locale-appropriate messaging
  // Hebrew version: warm, personal invitation tone
  // Russian version: structured, informational tone
}
```

The share data includes:
- Emotionally engaging title
- Description of the initiative
- Three benefit bullet points
- Direct link to the survey
- Portal link for general updates
