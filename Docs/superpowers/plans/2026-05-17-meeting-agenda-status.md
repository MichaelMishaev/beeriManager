# Meeting Agenda — Discussion Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add discussion status (ממתין/נדון/הוחלט) to existing meeting ideas, redesign the public page to show a live agenda list, and let the admin update statuses during meetings.

**Architecture:** The `meetings` + `meeting_ideas` tables already exist. We add a `discussion_status` column, a PATCH endpoint for status changes, convert the public page to show the running agenda (form at top + live list), and add inline status buttons to the admin manage page.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase (PostgreSQL), Tailwind CSS, React Hook Form + Zod, Sonner toasts, shadcn/ui Badge + Button

---

## File Map

| Action | File |
|---|---|
| Create | `supabase/migrations/20260517000000_add_discussion_status_to_meeting_ideas.sql` |
| Modify | `src/types/index.ts` — add `discussion_status` to `MeetingIdea` |
| Modify | `src/app/api/meetings/[id]/ideas/[ideaId]/route.ts` — add PATCH handler |
| Rewrite | `src/app/[locale]/meetings/[id]/page.tsx` — server wrapper that checks admin |
| Create | `src/components/features/meetings/MeetingAgendaPage.tsx` — new client component |
| Modify | `src/app/[locale]/(admin)/admin/meetings/[id]/page.tsx` — add status buttons |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260517000000_add_discussion_status_to_meeting_ideas.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- Migration: Add discussion_status to meeting_ideas
-- Allows admin to track discussion progress during meetings

ALTER TABLE public.meeting_ideas
  ADD COLUMN IF NOT EXISTS discussion_status VARCHAR(20)
    NOT NULL DEFAULT 'pending'
    CHECK (discussion_status IN ('pending', 'discussed', 'decided'));

CREATE INDEX IF NOT EXISTS idx_meeting_ideas_discussion_status
  ON public.meeting_ideas(meeting_id, discussion_status);

-- Allow admins to update discussion status
-- (existing "Admins can delete ideas" policy covers UPDATE via service role key)
-- Add explicit UPDATE policy for the anon role (service role bypasses RLS)
CREATE POLICY "Admins can update idea status"
  ON public.meeting_ideas
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

- [ ] **Step 2: Apply the migration**

```bash
cd /Users/michaelmishayev/Desktop/Projects/beeriManager
npm run db:migrate
```

Expected: migration applies without error. If `npm run db:migrate` fails due to Supabase CLI not running locally, apply via Supabase dashboard SQL editor instead.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260517000000_add_discussion_status_to_meeting_ideas.sql
git commit -m "feat: add discussion_status column to meeting_ideas"
```

---

## Task 2: Update TypeScript Type

**Files:**
- Modify: `src/types/index.ts` lines ~631–649

- [ ] **Step 1: Add `discussion_status` to `MeetingIdea`**

In `src/types/index.ts`, change the `MeetingIdea` interface to:

```typescript
export interface MeetingIdea {
  id: string
  meeting_id: string

  // Content
  title: string
  description?: string

  // Submitter (optional - can be anonymous)
  submitter_name?: string
  is_anonymous: boolean

  // Discussion status (set by admin during meeting)
  discussion_status: 'pending' | 'discussed' | 'decided'

  // Locale
  submission_locale: string

  // Timestamps
  created_at: string
  updated_at: string
}
```

- [ ] **Step 2: Run type check to verify no breakage**

```bash
npm run type-check 2>&1 | head -30
```

Expected: no new type errors related to `MeetingIdea`.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add discussion_status to MeetingIdea type"
```

---

## Task 3: Add PATCH Endpoint for Status Updates

**Files:**
- Modify: `src/app/api/meetings/[id]/ideas/[ideaId]/route.ts`

- [ ] **Step 1: Add PATCH handler (admin only)**

Replace the full file content:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const UpdateIdeaStatusSchema = z.object({
  discussion_status: z.enum(['pending', 'discussed', 'decided'])
})

interface RouteParams {
  params: Promise<{ id: string; ideaId: string }>
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id, ideaId } = await params
    const body = await req.json()
    const validation = UpdateIdeaStatusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'נתונים לא תקינים' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('meeting_ideas')
      .update({ discussion_status: validation.data.discussion_status })
      .eq('id', ideaId)
      .eq('meeting_id', id)
      .select()
      .single()

    if (error) {
      console.error('Idea status update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הסטטוס' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הסטטוס עודכן בהצלחה'
    })
  } catch (error) {
    console.error('Idea PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הסטטוס' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id, ideaId } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('meeting_ideas')
      .delete()
      .eq('id', ideaId)
      .eq('meeting_id', id)

    if (error) {
      console.error('Idea deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הרעיון' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הרעיון נמחק בהצלחה'
    })
  } catch (error) {
    console.error('Idea DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הרעיון' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/meetings/[id]/ideas/[ideaId]/route.ts
git commit -m "feat: add PATCH endpoint for meeting idea discussion status"
```

---

## Task 4: Create MeetingAgendaPage Client Component

**Files:**
- Create: `src/components/features/meetings/MeetingAgendaPage.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Calendar, Share2, Send, Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Meeting, MeetingIdea } from '@/types'

const STATUS_CONFIG = {
  pending:   { label: 'ממתין',  className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  discussed: { label: 'נדון',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  decided:   { label: 'הוחלט', className: 'bg-green-100 text-green-800 border-green-200' },
} as const

const ideaSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').max(200, 'מקסימום 200 תווים'),
  submitter_name: z.string().min(1, 'יש להזין שם').max(100)
})

type IdeaFormData = z.infer<typeof ideaSchema>

interface Props {
  meetingId: string
  isAdmin: boolean
}

export function MeetingAgendaPage({ meetingId, isAdmin }: Props) {
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [ideas, setIdeas] = useState<MeetingIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema)
  })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/ideas?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await res.json()
      if (data.success) {
        setMeeting(data.data.meeting)
        setIdeas(data.data.ideas)
      }
    } catch {
      toast.error('שגיאה בטעינת נושאי הישיבה')
    } finally {
      setIsLoading(false)
    }
  }, [meetingId])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function onSubmit(data: IdeaFormData) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          submitter_name: data.submitter_name,
          is_anonymous: false,
          submission_locale: 'he'
        })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('הנושא נוסף בהצלחה')
      reset()
      await fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספת הנושא')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateStatus(ideaId: string, status: 'pending' | 'discussed' | 'decided') {
    setUpdatingId(ideaId)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discussion_status: status })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, discussion_status: status } : i))
    } catch {
      toast.error('שגיאה בעדכון הסטטוס')
    } finally {
      setUpdatingId(null)
    }
  }

  function handleShare() {
    const url = window.location.href
    const text = encodeURIComponent(`היי! 📋\n\nהוסיפו נושאים לדיון בישיבת הועד:\n${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-[#0D98BA]" />
          <p className="text-gray-500 text-sm">טוען ישיבה...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <p className="text-red-500 font-medium">הישיבה לא נמצאה</p>
      </div>
    )
  }

  const isClosed = !meeting.is_open || meeting.status === 'closed' || meeting.status === 'completed'

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-[#003153] text-white px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-xl font-bold leading-tight">{meeting.title}</h1>
            <button onClick={handleShare} className="shrink-0 p-1.5 rounded-full hover:bg-white/10">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            {meeting.meeting_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(meeting.meeting_date), 'PP', { locale: he })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {ideas.length} נושאים
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Submission form */}
        {isClosed ? (
          <div className="bg-white rounded-xl border p-5 text-center text-gray-500">
            <p className="font-medium">ישיבה זו הסתיימה</p>
            <p className="text-sm mt-1">לא ניתן להוסיף נושאים חדשים</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 text-base">+ הוסף נושא לדיון</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">נושא <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="על מה תרצו לדבר בישיבה?"
                  className={`mt-1 ${errors.title ? 'border-red-400' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="submitter_name" className="text-sm font-medium">השם שלך <span className="text-red-500">*</span></Label>
                <Input
                  id="submitter_name"
                  {...register('submitter_name')}
                  placeholder="שמך"
                  className={`mt-1 ${errors.submitter_name ? 'border-red-400' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.submitter_name && <p className="text-xs text-red-500 mt-1">{errors.submitter_name.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-[#003153] hover:bg-[#002040]">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin ml-2" />שולח...</>
                ) : (
                  <><Send className="h-4 w-4 ml-2" />הוסף נושא</>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Ideas list */}
        <div className="space-y-2">
          {ideas.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">עדיין לא נוספו נושאים</p>
          ) : (
            ideas.map((idea, index) => {
              const statusCfg = STATUS_CONFIG[idea.discussion_status ?? 'pending']
              return (
                <div key={idea.id} className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-gray-400 font-mono">{index + 1}.</span>
                        <p className="font-medium text-gray-900 text-sm leading-snug">{idea.title}</p>
                      </div>
                      {idea.submitter_name && (
                        <p className="text-xs text-gray-400 mr-5">{idea.submitter_name}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={`text-xs border ${statusCfg.className}`}>
                        {statusCfg.label}
                      </Badge>
                      {isAdmin && (
                        <div className="flex gap-1">
                          {(['pending', 'discussed', 'decided'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(idea.id, s)}
                              disabled={updatingId === idea.id || idea.discussion_status === s}
                              className={`text-[10px] px-1.5 py-0.5 rounded border transition-all
                                ${idea.discussion_status === s
                                  ? STATUS_CONFIG[s].className + ' font-semibold'
                                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                                }
                                disabled:opacity-50`}
                            >
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/meetings/MeetingAgendaPage.tsx
git commit -m "feat: add MeetingAgendaPage component with live list and status badges"
```

---

## Task 5: Rewrite Public Meeting Page

**Files:**
- Rewrite: `src/app/[locale]/meetings/[id]/page.tsx`

- [ ] **Step 1: Convert to server component that passes isAdmin**

Replace the entire file:

```typescript
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { verifyJWT } from '@/lib/auth/jwt'
import { MeetingAgendaPage } from '@/components/features/meetings/MeetingAgendaPage'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function MeetingPage({ params }: PageProps) {
  const { id } = await params

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    notFound()
  }

  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth-token')
  const isAdmin = authToken ? !!(await verifyJWT(authToken.value)) : false

  return <MeetingAgendaPage meetingId={id} isAdmin={isAdmin} />
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/meetings/\[id\]/page.tsx
git commit -m "feat: rewrite public meeting page to show live agenda list"
```

---

## Task 6: Add Status Buttons to Admin Manage Page

**Files:**
- Modify: `src/app/[locale]/(admin)/admin/meetings/[id]/page.tsx`

- [ ] **Step 1: Add status update function and UI**

In `src/app/[locale]/(admin)/admin/meetings/[id]/page.tsx`:

a) Add `updatingId` state after `const [copied, setCopied] = useState(false)`:
```typescript
const [updatingId, setUpdatingId] = useState<string | null>(null)
```

b) Add this function after `copyLink()`:
```typescript
async function updateIdeaStatus(ideaId: string, status: 'pending' | 'discussed' | 'decided') {
  setUpdatingId(ideaId)
  try {
    const res = await fetch(`/api/meetings/${params.id}/ideas/${ideaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discussion_status: status })
    })
    const result = await res.json()
    if (result.success) {
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, discussion_status: status } : i))
    } else {
      toast.error('שגיאה בעדכון הסטטוס')
    }
  } catch {
    toast.error('שגיאה בעדכון הסטטוס')
  } finally {
    setUpdatingId(null)
  }
}
```

c) Add status badge + buttons inside each idea card. In the existing ideas map, after the submitter/date info block, add:

```tsx
{/* Status controls */}
<div className="flex items-center gap-2 mt-3 flex-wrap">
  <Badge
    className={
      idea.discussion_status === 'decided'
        ? 'bg-green-100 text-green-800 border border-green-200'
        : idea.discussion_status === 'discussed'
        ? 'bg-blue-100 text-blue-800 border border-blue-200'
        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    }
  >
    {idea.discussion_status === 'decided' ? 'הוחלט'
      : idea.discussion_status === 'discussed' ? 'נדון'
      : 'ממתין'}
  </Badge>
  <div className="flex gap-1">
    {(['pending', 'discussed', 'decided'] as const).map((s) => {
      const labels = { pending: 'ממתין', discussed: 'נדון', decided: 'הוחלט' }
      return (
        <Button
          key={s}
          variant="outline"
          size="sm"
          disabled={updatingId === idea.id || idea.discussion_status === s}
          onClick={() => updateIdeaStatus(idea.id, s)}
          className={`text-xs h-7 px-2 ${idea.discussion_status === s ? 'bg-primary/10' : ''}`}
        >
          {labels[s]}
        </Button>
      )
    })}
  </div>
</div>
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(admin)/admin/meetings/[id]/page.tsx"
git commit -m "feat: add discussion status controls to admin meeting manage page"
```

---

## Task 7: Verify End-to-End

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Wait for "Ready" on port 4500.

- [ ] **Step 2: Create a test meeting (admin)**

1. Open http://localhost:4500/he/admin/meetings/new
2. Fill in title "בדיקת סטטוס" and today's date
3. Click "צור פגישה" — should redirect to meetings list
4. Click "צפה בדף" on the new meeting → should open the public page

- [ ] **Step 3: Test public submission (no auth)**

1. Open the public meeting page in an incognito window
2. Fill form: topic + name
3. Click submit — should stay on page and see the item appear in the list with "ממתין" badge
4. Verify no status buttons appear (not admin)

- [ ] **Step 4: Test admin status controls**

1. Open the same meeting URL in a logged-in browser (has auth-token cookie)
2. Verify status buttons appear under each idea
3. Click "נדון" on one idea — badge should change to blue "נדון" immediately
4. Click "הוחלט" on another — badge should change to green "הוחלט"
5. Refresh the page — statuses should persist

- [ ] **Step 5: Test admin manage page status controls**

1. Go to http://localhost:4500/he/admin/meetings/[id]
2. Should see status badge + ממתין/נדון/הוחלט buttons on each idea
3. Click a status button — badge should update immediately

- [ ] **Step 6: Verify type-check and lint pass**

```bash
npm run type-check && npm run lint
```

Expected: no errors.
