# Parent Skills Survey - UI Components Architecture

## Overview

The feature uses 6 React components organized into public (form) and admin (dashboard) categories, plus 2 promotional/navigation components.

**Component Library:** shadcn/ui (Radix UI primitives) + Tailwind CSS
**Animations:** Framer Motion
**Icons:** Lucide React
**Form Management:** React Hook Form + Zod

---

## Component Tree

```
Public Form Flow:
  [locale]/surveys/skills/page.tsx
    └── SkillSurveyForm.tsx (4-step wizard)
        ├── Welcome Screen
        ├── Skills Selection (with search)
        ├── Grade Selection
        ├── Details Form
        └── Success Screen

Admin Dashboard:
  [locale]/(admin)/admin/surveys/skills/page.tsx
    └── SkillsAdminDashboard.tsx
        ├── SkillsStatsCards.tsx (4 stat cards)
        ├── Filter Controls (search, skill dropdown, contact dropdown)
        └── SkillsResponsesTable.tsx (expandable rows + delete)

Homepage Promotion:
  PublicHomepage.tsx
    └── SkillsSurveyCard.tsx (CTA card with share)

Mobile Navigation:
  FloatingActionMenu.tsx (scroll-triggered pill)
```

---

## 1. `SkillSurveyForm` - Multi-Step Form Wizard

**File:** `src/components/features/surveys/SkillSurveyForm.tsx`
**Type:** Client component (`'use client'`)
**Lines:** ~957

### State Management

| State Variable | Type | Purpose |
|----------------|------|---------|
| `currentStep` | `FormStep` | Current wizard step: `'welcome' \| 'skills' \| 'grade' \| 'details'` |
| `isSubmitted` | `boolean` | Shows success screen when true |
| `selectedSkills` | `string[]` | Currently selected skill categories |
| `searchQuery` | `string` | Filter text for skill search |
| `otherSpecialtyError` | `string \| null` | Custom validation error for "other" field |

### Form Setup (React Hook Form)

```typescript
const form = useForm<SkillSurveyFormData>({
  resolver: zodResolver(skillSurveySchema),
  defaultValues: {
    skills: [],
    student_grade: undefined,
    preferred_contact: 'whatsapp',  // Default: WhatsApp (most common in Israel)
  },
})
```

### Internal Data Structures

**`SKILL_ICONS`** - Maps each of 28 skill categories to a Lucide icon component:
```typescript
const SKILL_ICONS: Record<string, LucideIcon> = {
  legal: Scale,
  medical: Stethoscope,
  photography: Camera,
  // ... 25 more mappings
}
```

**`SKILL_COLORS`** - Maps each skill to a Tailwind gradient using the brand color palette:
```typescript
const SKILL_COLORS: Record<string, string> = {
  legal: 'from-[#003153] to-[#0D98BA]',
  medical: 'from-[#FF8200] to-[#FFBA00]',
  // ... uses: #87CEEB, #0D98BA, #003153, #FFBA00, #FF8200
}
```

### Step Screens

#### Welcome Screen
- Full-screen centered layout with gradient background
- Animated logo (spring animation with delay)
- Title, subtitle, description in styled card
- "Start" CTA button with gradient background
- Privacy note footer
- All text via `useTranslations('skillsSurvey')`

#### Skills Selection
- Search bar with clearable text input
- Skills displayed as 2-col (mobile) / 3-col (desktop) grid
- Each skill is a button with icon, gradient background, and check indicator
- Selected skills show ring + gradient fill + white checkmark
- "Other" selection reveals animated text input with validation
- Shows filtered count: `{filtered} of {total} skills`
- Custom validation: if "other" selected, specialty field required before proceeding

#### Grade Selection
- 3-col (mobile) / 6-col (desktop) grid of Hebrew letter buttons
- Single selection with visual feedback
- Large bold Hebrew letters with "Class" label below

#### Details Step
- Phone number (required, LTR direction, Israeli format)
- Name (optional, RTL)
- Email (optional, LTR)
- Additional notes (textarea, RTL)
- Submit button with loading spinner

#### Success Screen
- Animated checkmark circle (spring + rotate animation)
- Thank you message with green gradient theme
- "Back to home" button

### Key Behaviors

1. **Skill search:** `useMemo` filters `getSortedSkillCategories()` by Hebrew name or English key
2. **Auto-scroll:** When "other" is selected, auto-scrolls to specialty input and focuses it after animation completes (400ms + 300ms delays)
3. **Progress bar:** Animated horizontal bar showing `(currentStepIndex + 1) / 4 * 100%`
4. **Step transitions:** Framer Motion `AnimatePresence` with slide-in/out animations (x: 20 -> 0 -> -20)
5. **Form submission:** `fetch('/api/surveys/skills', { method: 'POST' })` with JSON body

---

## 2. `SkillsAdminDashboard` - Admin Container

**File:** `src/components/features/surveys/admin/SkillsAdminDashboard.tsx`
**Type:** Client component (`'use client'`)

### State Management

| State Variable | Type | Purpose |
|----------------|------|---------|
| `filters` | `SkillResponseFilters` | Active filter state |
| `searchInput` | `string` | Raw search text input |
| `debouncedSearch` | `string` | Search text after 300ms debounce |

### Data Fetching

```typescript
const { data, isLoading, refetch } = useQuery<SkillResponsesListResponse>({
  queryKey: ['skill-responses', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    // ... append active filters
    const response = await fetch(`/api/surveys/skills?${params}`, {
      headers: { 'Cache-Control': 'no-cache' },
      credentials: 'include',
    })
    return response.json()
  },
})
```

React Query automatically refetches when `filters` object changes.

### Layout Structure

1. **Header:** Title + "Export to Excel" button
2. **Statistics Cards:** `<SkillsStatsCards stats={data.stats} />`
3. **Filter Card:**
   - Text search with debounce indicator
   - Skill category dropdown (sorted by Hebrew name)
   - Contact preference dropdown
4. **Results Table:** `<SkillsResponsesTable responses={data.data} />`

### Export Handler

```typescript
const handleExport = async () => {
  const response = await fetch('/api/surveys/skills/export', { credentials: 'include' })
  const blob = await response.blob()
  // Create temporary <a> element, click it, revoke URL
}
```

---

## 3. `SkillsResponsesTable` - Data Table with Expandable Rows

**File:** `src/components/features/surveys/admin/SkillsResponsesTable.tsx`
**Type:** Client component (`'use client'`)

### Props

```typescript
interface Props {
  responses: ParentSkillResponse[]
  isLoading: boolean
  onResponseDeleted?: () => void  // Callback to trigger refetch
}
```

### State

| State Variable | Type | Purpose |
|----------------|------|---------|
| `expandedRow` | `string \| null` | ID of currently expanded row |
| `deleteDialogOpen` | `boolean` | Delete confirmation dialog visibility |
| `responseToDelete` | `string \| null` | ID queued for deletion |
| `isDeleting` | `boolean` | Loading state during delete API call |

### Table Columns

| Column | Content |
|--------|---------|
| Name | `parent_name` or italic "Anonymous" |
| Grade | `student_grade` in outlined badge |
| Skills | First 3 skills as badges, then `+N` overflow badge |
| Contact | Hebrew label for preferred contact method |
| Phone | Monospace LTR phone number |
| Actions | Phone, WhatsApp, Email, Delete buttons |
| Expand | Chevron toggle button |

### Expanded Row Details

When a row is expanded, a full-width sub-row shows:
- All skills (complete badge list)
- Other specialty details (if "other" selected, yellow highlighted)
- Email address
- Additional notes
- Submission date and time

### Contact Buttons

| Button | Action | Style |
|--------|--------|-------|
| Phone | `tel:{phone}` link | Outline |
| WhatsApp | `wa.me/{972-formatted-number}` link | Green tint |
| Email | `mailto:{email}` link | Outline |
| Delete | Opens confirmation dialog | Red tint |

### WhatsApp Number Formatting

```typescript
const formatPhoneForWhatsApp = (phone: string | null): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) return '972' + cleaned.substring(1)
  return cleaned
}
```

### Soft Delete Flow

1. Click delete button -> sets `responseToDelete` and opens `AlertDialog`
2. Confirmation shows Hebrew message explaining soft delete
3. On confirm: `DELETE /api/surveys/skills/{id}`
4. On success: toast notification + `onResponseDeleted()` callback
5. On error: destructive toast with error message

---

## 4. `SkillsStatsCards` - Statistics Display

**File:** `src/components/features/surveys/admin/SkillsStatsCards.tsx`
**Type:** Client component (`'use client'`)

### Props

```typescript
interface Props {
  stats: SkillResponseStats
}
```

### Cards (4-column grid)

| Card | Icon | Main Value | Subtitle |
|------|------|------------|----------|
| Total Responses | Users (blue) | `stats.total_responses` | `{anonymous_count} anonymous` |
| This Week | TrendingUp (green) | `stats.recent_responses` | "Last 7 days" |
| WhatsApp Preferred | Phone (orange) | `stats.contact_breakdown.whatsapp` | `{phone_count} prefer phone` |
| Popular Skills | Award (purple) | Top 3 skills ranked | Skill name + count |

### Top Skills Calculation

```typescript
const topSkills = Object.entries(stats.skill_breakdown)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3)
```

---

## 5. `SkillsSurveyCard` - Homepage Promotional Card

**File:** `src/components/features/homepage/SkillsSurveyCard.tsx`
**Type:** Client component (`'use client'`)

### Features

- Gradient accent bar (top border) using brand colors
- GraduationCap icon with hover animation (scale 110%)
- Title + subtitle from translations
- Description paragraph
- Three benefit items with emoji icons (no commitment, targeted requests, 2-3 minutes)
- Share button generating WhatsApp share data via `formatSkillsSurveyShareData()`
- Full-width CTA button linking to `/{locale}/surveys/skills`
- Time estimate badge at bottom

### Dependencies

- `useTranslations('skillsSurvey')` for all text
- `useParams()` for locale detection
- `formatSkillsSurveyShareData(locale)` for WhatsApp share data
- `ShareButton` component for native share / WhatsApp fallback

---

## 6. `FloatingActionMenu` - Mobile Scroll-Triggered Menu

**File:** `src/components/ui/FloatingActionMenu.tsx`
**Type:** Client component (`'use client'`)

### Behavior

- **Visibility:** Hidden by default, appears after scrolling past 500px
- **Position:** Fixed bottom-center, hidden on desktop (`md:hidden`)
- **Animation:** Slides up/down with opacity transition (300ms ease-out)
- **Layout:** Pill-shaped container with 3 action buttons

### Buttons

| Button | Color | Action | Icon |
|--------|-------|--------|------|
| Events | Blue | Scroll to `#events-section` | Calendar |
| WhatsApp | Green | Scroll to `#whatsapp-section` | MessageCircle |
| Survey | Purple | Scroll to `#survey-section` | GraduationCap |

All buttons use smooth scroll with 80px offset for sticky header.

---

## Shared UI Components Used

The feature relies on these shadcn/ui components from `src/components/ui/`:

| Component | Usage |
|-----------|-------|
| `Button` | CTAs, navigation, actions |
| `Card` / `CardContent` / `CardHeader` / `CardTitle` | Layout containers |
| `Input` | Text fields, search bars |
| `Textarea` | Notes field |
| `Label` | Form labels |
| `Select` / `SelectContent` / `SelectItem` / `SelectTrigger` | Filter dropdowns |
| `Table` / `TableBody` / `TableCell` / `TableHead` / `TableHeader` / `TableRow` | Admin data table |
| `Badge` | Skill tags, grade display |
| `AlertDialog` (+ Action, Cancel, Content, Description, Footer, Header, Title) | Delete confirmation |
| `ShareButton` | WhatsApp/native share |

---

## Custom Hooks Used

| Hook | Source | Usage |
|------|--------|-------|
| `useDebounce` | `@/hooks/useDebounce` | 300ms debounced search in admin dashboard |
| `useToast` | `@/hooks/use-toast` | Success/error notifications after delete |
| `useTranslations` | `next-intl` | All user-facing text |
| `useQuery` | `@tanstack/react-query` | Data fetching with caching |
| `useForm` | `react-hook-form` | Form state management |
| `useParams` | `next/navigation` | Locale detection |

---

## Translation Namespace

All text is under the `skillsSurvey` namespace in `messages/he.json` and `messages/ru.json`.

Key translation keys:
- `title`, `subtitle`, `description` - Homepage card text
- `welcomeTitle`, `welcomeSubtitle`, `welcomeDescription` - Welcome screen
- `skillsTitle`, `skillsSubtitle`, `searchPlaceholder` - Skills step
- `gradeTitle`, `gradeSubtitle`, `gradeLabel` - Grade step
- `detailsTitle`, `detailsSubtitle` - Details step
- `phoneLabel`, `nameLabel`, `emailLabel`, `notesLabel` - Form fields
- `submitButton`, `submitting` - Submit action
- `successTitle`, `successMessage`, `successDescription` - Success screen
- `benefit1`, `benefit2`, `benefit3` - Homepage card benefits
- `ctaButton`, `timeEstimate` - Homepage card CTA
- `step`, `of`, `back`, `continue` - Navigation
- `errorSaving`, `errorSavingRetry` - Error messages
