# Parent Skills Survey - Feature Overview & Business Purpose

## What Is This?

The **Parent Skills Survey** is a production feature within BeeriManager that allows school parents to voluntarily register their professional skills and expertise. It creates a searchable volunteer directory that school administrators can use to find parent volunteers with specific skills when the need arises.

**Live URL:** `https://beeri.online/he/surveys/skills`

---

## Business Problem

Schools frequently need help from parents with specific expertise:
- A **lawyer** for legal advice on committee matters
- A **photographer** for school events
- An **IT professional** to help with tech issues
- A **caterer** for school celebrations
- A **graphic designer** for flyers and invitations

Without a structured system, administrators rely on word-of-mouth, which is slow, incomplete, and biased toward parents they already know. Many willing volunteers go unnoticed simply because nobody thought to ask them.

---

## Solution

A two-part system:

1. **Public Survey Form** - A beautiful, mobile-optimized 4-step wizard that parents fill out in 2-3 minutes. Distributed via WhatsApp link sharing.
2. **Admin Dashboard** - A searchable, filterable interface where administrators can find parents by skill, contact them directly, and export data to CSV.

---

## Key Value Propositions

| For Parents | For Administrators |
|---|---|
| No commitment pressure - volunteering is always optional | Instantly find parents with specific skills |
| Only contacted for targeted, relevant requests | Filter by skill category, contact preference, grade |
| Takes only 2-3 minutes to fill | Direct contact buttons (phone, WhatsApp, email) |
| Anonymous option available | Export to CSV for Excel/Google Sheets |
| No account creation required | Statistics dashboard with trends |

---

## User Personas

### 1. Public Parent (Form Filler)
- **Goal:** Register their skills to help the school when appropriate
- **Access:** Via WhatsApp shared link, homepage card, or floating action menu
- **Auth:** None required (public form)
- **Journey:** Welcome screen -> Select skills -> Select grade -> Enter contact details -> Submit

### 2. School Administrator (Dashboard User)
- **Goal:** Find and contact parent volunteers for specific needs
- **Access:** Admin panel at `/admin/surveys/skills`
- **Auth:** JWT-authenticated (global admin password)
- **Journey:** View stats -> Search/filter responses -> Expand details -> Contact via phone/WhatsApp/email -> Export CSV

---

## User Flows

### Public Form Submission Flow (4 Steps)

```
1. WELCOME SCREEN
   - Logo, title, description
   - "No commitment" messaging
   - "Start" CTA button

2. SKILLS SELECTION
   - 28 skill categories displayed as visual cards
   - Search/filter skills by name
   - Multi-select (1-10 skills)
   - "Other" option with required text field
   - Hebrew alphabetical sorting

3. GRADE SELECTION
   - 12 grades (aleph through yud-bet)
   - Single selection grid

4. CONTACT DETAILS
   - Phone number (required, Israeli format validation)
   - Name (optional, allows anonymous)
   - Email (optional)
   - Additional notes (optional)
   - Submit button

5. SUCCESS SCREEN
   - Animated checkmark
   - Thank you message
   - "Back to home" button
```

### Admin Search/Filter/Contact Flow

```
1. DASHBOARD LOAD
   - 4 statistics cards (total, recent, WhatsApp preferred, top skills)
   - All responses loaded with React Query

2. SEARCH & FILTER
   - Free text search (debounced 300ms) across name, phone, notes
   - Dropdown: filter by specific skill category
   - Dropdown: filter by contact preference

3. BROWSE RESULTS
   - Table view with expandable rows
   - Shows: name, grade, skills (badges), preferred contact, phone
   - Expand for: all skills, other specialty details, email, notes, timestamp

4. CONTACT
   - Phone call button (tel: link)
   - WhatsApp button (wa.me link with Israeli number formatting)
   - Email button (mailto: link)

5. MANAGE
   - Soft delete with confirmation dialog
   - Export all to CSV (UTF-8 BOM for Hebrew support)
```

---

## Distribution Model

The survey is distributed through three channels:

1. **WhatsApp Link Sharing** - Primary distribution. `formatSkillsSurveyShareData()` generates a rich-text WhatsApp message with the survey URL, description, and portal link. Parents share with each other in grade-level WhatsApp groups.

2. **Homepage Promotional Card** - `SkillsSurveyCard` component displayed on the public homepage with a CTA button and share button. Includes benefit list and time estimate.

3. **Floating Action Menu** - Mobile-only floating pill that appears after scrolling 500px on the homepage. Contains a "Survey" shortcut button that scrolls to the survey card section.

---

## Multi-Tenancy Preparation

The system is currently **single-tenant** (one school) but is architecturally prepared for SaaS expansion:

- `schools` table exists with `id`, `name`, `slug` fields
- Every `parent_skill_responses` row has a `school_id` foreign key
- API routes filter by `DEFAULT_SCHOOL_ID` (env variable or hardcoded UUID)
- RLS policies are commented to show future school-aware filtering
- The school_id is set automatically on insert

**To convert to multi-tenant SaaS:**
1. Create a school registration/onboarding flow
2. Replace `DEFAULT_SCHOOL_ID` with session-based school resolution (subdomain or user profile)
3. Update RLS policies to match `user.school_id = row.school_id`
4. Add school branding (logo, colors, name) to the form

---

## Technical Quick Reference

| Aspect | Details |
|---|---|
| **Frontend Framework** | Next.js 14+ App Router with TypeScript |
| **Styling** | Tailwind CSS with RTL support |
| **Form Management** | React Hook Form + Zod validation |
| **Animations** | Framer Motion |
| **Data Fetching** | TanStack React Query |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | JWT + bcrypt (admin only) |
| **i18n** | next-intl (Hebrew default, Russian secondary) |
| **Distribution** | WhatsApp Web Share API |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/types/parent-skills.ts` | All types, constants, Hebrew label maps |
| `src/lib/validations/parent-skills.ts` | Zod validation schemas |
| `src/lib/utils/skills-sorting.ts` | Hebrew alphabetical sorting utilities |
| `src/lib/utils/share-formatters.ts` | WhatsApp share link formatter |
| `src/app/api/surveys/skills/route.ts` | POST (submit) + GET (list) API |
| `src/app/api/surveys/skills/[id]/route.ts` | DELETE (soft delete) API |
| `src/app/api/surveys/skills/export/route.ts` | CSV export API |
| `src/app/[locale]/surveys/skills/page.tsx` | Public form page |
| `src/app/[locale]/(admin)/admin/surveys/skills/page.tsx` | Admin dashboard page |
| `src/components/features/surveys/SkillSurveyForm.tsx` | Multi-step form component |
| `src/components/features/surveys/admin/SkillsAdminDashboard.tsx` | Admin dashboard |
| `src/components/features/surveys/admin/SkillsResponsesTable.tsx` | Responses table |
| `src/components/features/surveys/admin/SkillsStatsCards.tsx` | Statistics cards |
| `src/components/features/homepage/SkillsSurveyCard.tsx` | Homepage card |
| `src/components/ui/FloatingActionMenu.tsx` | Mobile floating action menu |
| `messages/he.json` (skillsSurvey namespace) | Hebrew translations |
| `messages/ru.json` (skillsSurvey namespace) | Russian translations |

---

## Related Documentation

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Complete database architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - All 4 API endpoints
- [TYPE_DEFINITIONS.md](./TYPE_DEFINITIONS.md) - TypeScript types & validation
- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Frontend component architecture
- [DATA_FLOW.md](./DATA_FLOW.md) - End-to-end data flow diagrams
