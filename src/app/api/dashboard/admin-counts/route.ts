import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt-edge'
import type { AdminCounts } from '@/hooks/useAdminCounts'
import { startOfTodayIsrael } from '@/lib/utils/admin-events'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Must match the default in /api/surveys/skills
const DEFAULT_SCHOOL_ID = process.env.DEFAULT_SCHOOL_ID || 'c6268dee-1fcd-42bd-8da2-1d4ac34a03db'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }
    const payload = await verifyJWT(token.value)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const todayStart = new Date(startOfTodayIsrael(new Date())).toISOString()

    // Event tabs (spec): upcoming = published/ongoing starting today or later;
    // drafts = status draft. A start date before today is "past" whatever the status,
    // so past drafts are not counted. Cancelled never counts. Archived events are excluded.
    const [upcoming, drafts, highlights, tickets, feedback, ideas, survey] = await Promise.all([
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .is('archived_at', null)
        .in('status', ['published', 'ongoing'])
        .gte('start_datetime', todayStart),
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .is('archived_at', null)
        .eq('status', 'draft')
        .gte('start_datetime', todayStart),
      supabase
        .from('highlights')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('anonymous_feedback')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('ideas')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('parent_skill_responses')
        .select('id', { count: 'exact', head: true })
        // Same filters as the survey list (/api/surveys/skills), so the numbers agree
        .eq('school_id', DEFAULT_SCHOOL_ID)
        .is('deleted_at', null),
    ])

    const failed = [upcoming, drafts, highlights, tickets, feedback, ideas, survey].find(
      (r) => r.error
    )
    if (failed?.error) {
      // A wrong "0" would be worse than no number: let the client omit the status lines.
      console.error('Admin counts error:', failed.error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הנתונים' },
        { status: 500 }
      )
    }

    const data: AdminCounts = {
      events: { upcoming: upcoming.count ?? 0, drafts: drafts.count ?? 0 },
      highlights: { active: highlights.count ?? 0 },
      tickets: { active: tickets.count ?? 0 },
      inbox: {
        feedback: feedback.count ?? 0,
        ideas: ideas.count ?? 0,
        survey: survey.count ?? 0,
      },
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Admin counts error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הנתונים' },
      { status: 500 }
    )
  }
}
