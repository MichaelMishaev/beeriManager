import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { skillSurveySchema, skillResponseFiltersSchema } from '@/lib/validations/parent-skills'
import type {
  ParentSkillResponse,
  SkillResponseStats,
  SkillCategory,
  ContactPreference,
} from '@/types/parent-skills'

// Default school ID for single-tenant deployment
// In future multi-tenant setup, this will come from user session or subdomain
const DEFAULT_SCHOOL_ID = process.env.DEFAULT_SCHOOL_ID || 'c6268dee-1fcd-42bd-8da2-1d4ac34a03db'

// POST - Public submission (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = skillSurveySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'נתונים לא תקינים',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Optional: Get IP and user agent for duplicate detection
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    // Get locale from headers or default to 'he'
    const locale = request.headers.get('accept-language')?.split(',')[0]?.substring(0, 2) || 'he'

    const supabase = await createClient()

    // Insert into database
    const { data: response, error } = await supabase
      .from('parent_skill_responses')
      .insert({
        school_id: DEFAULT_SCHOOL_ID, // NEW: Associate with default school
        parent_name: data.parent_name || null,
        phone_number: data.phone_number || null,
        email: data.email || null,
        skills: data.skills,
        student_grade: data.student_grade, // Student's current grade
        preferred_contact: data.preferred_contact,
        additional_notes: data.additional_notes || null,
        other_specialty: data.other_specialty || null,
        submitted_locale: locale,
        ip_address: ip,
        user_agent: userAgent,
        // created_at: auto-generated timestamp (tracks submission year)
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error submitting skill survey:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'תודה! התשובות נשמרו בהצלחה',
      response_id: response.id,
    })
  } catch (error) {
    console.error('Error in skill survey submission:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'שגיאה בשמירת התשובות. אנא נסה שוב מאוחר יותר',
      },
      { status: 500 }
    )
  }
}

// GET - Admin-only: fetch all responses with filters
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, message: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse and validate filters
    const filters = {
      skill: searchParams.get('skill') || undefined,
      contact_preference: searchParams.get('contact_preference') || undefined,
      search: searchParams.get('search') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    }

    const filtersResult = skillResponseFiltersSchema.safeParse(filters)

    if (!filtersResult.success) {
      return NextResponse.json(
        { success: false, message: 'פרמטרי חיפוש לא תקינים' },
        { status: 400 }
      )
    }

    const validFilters = filtersResult.data

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('parent_skill_responses')
      .select('*', { count: 'exact' })
      .eq('school_id', DEFAULT_SCHOOL_ID) // NEW: Filter by school
      .is('deleted_at', null) // Exclude soft-deleted responses
      .order('created_at', { ascending: false })

    // Apply filters
    if (validFilters.skill) {
      query = query.contains('skills', [validFilters.skill])
    }

    if (validFilters.contact_preference) {
      query = query.eq('preferred_contact', validFilters.contact_preference)
    }

    if (validFilters.search) {
      query = query.or(
        `parent_name.ilike.%${validFilters.search}%,phone_number.ilike.%${validFilters.search}%,additional_notes.ilike.%${validFilters.search}%,other_specialty.ilike.%${validFilters.search}%`
      )
    }

    if (validFilters.date_from) {
      query = query.gte('created_at', validFilters.date_from)
    }

    if (validFilters.date_to) {
      query = query.lte('created_at', validFilters.date_to)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching skill responses:', error)
      throw error
    }

    // Calculate statistics
    const stats = calculateStats(data as ParentSkillResponse[])

    return NextResponse.json({
      success: true,
      data: data as ParentSkillResponse[],
      stats,
      total: count || 0,
    })
  } catch (error) {
    console.error('Error fetching skill responses:', error)
    return NextResponse.json(
      { success: false, message: 'שגיאה בטעינת התשובות' },
      { status: 500 }
    )
  }
}

// Helper function to calculate statistics
function calculateStats(responses: ParentSkillResponse[]): SkillResponseStats {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const stats: SkillResponseStats = {
    total_responses: responses.length,
    skill_breakdown: {} as Record<SkillCategory, number>,
    contact_breakdown: {} as Record<ContactPreference, number>,
    anonymous_count: 0,
    recent_responses: 0,
  }

  responses.forEach((response) => {
    // Count anonymous responses
    if (!response.parent_name) {
      stats.anonymous_count++
    }

    // Count recent responses
    if (new Date(response.created_at) > sevenDaysAgo) {
      stats.recent_responses++
    }

    // Count skills
    response.skills.forEach((skill) => {
      stats.skill_breakdown[skill] = (stats.skill_breakdown[skill] || 0) + 1
    })

    // Count contact preferences
    stats.contact_breakdown[response.preferred_contact] =
      (stats.contact_breakdown[response.preferred_contact] || 0) + 1
  })

  return stats
}
