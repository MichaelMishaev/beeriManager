import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import type { ParentSkillResponse } from '@/types/parent-skills'
import { SKILL_NAMES_HE, CONTACT_PREF_NAMES_HE } from '@/types/parent-skills'

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

// Default school ID for single-tenant deployment
const DEFAULT_SCHOOL_ID = process.env.DEFAULT_SCHOOL_ID || 'c6268dee-1fcd-42bd-8da2-1d4ac34a03db'

// GET - Admin-only: export to CSV
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, message: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Fetch all responses for this school
    const { data, error } = await supabase
      .from('parent_skill_responses')
      .select('*')
      .eq('school_id', DEFAULT_SCHOOL_ID) // NEW: Filter by school
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching responses for export:', error)
      throw error
    }

    const responses = data as ParentSkillResponse[]

    // Generate CSV with UTF-8 BOM for Hebrew support
    const BOM = '\uFEFF'
    const headers = [
      'תאריך הגשה',
      'שם הורה',
      'טלפון',
      'אימייל',
      'מיומנויות',
      'אחר - פרטים',
      'אמצעי יצירת קשר מועדף',
      'הערות נוספות',
    ]

    const rows = responses.map((response) => {
      const skillsHe = response.skills.map((s) => SKILL_NAMES_HE[s] || s).join(', ')
      const contactPrefHe = CONTACT_PREF_NAMES_HE[response.preferred_contact] || response.preferred_contact
      const date = new Date(response.created_at).toLocaleDateString('he-IL')
      const otherSpecialty = response.skills.includes('other') ? (response.other_specialty || '') : ''

      return [
        date,
        response.parent_name || 'אנונימי',
        response.phone_number || '',
        response.email || '',
        `"${skillsHe}"`, // Quoted for CSV safety (commas in content)
        `"${otherSpecialty.replace(/"/g, '""')}"`, // Escape quotes and wrap
        contactPrefHe,
        `"${(response.additional_notes || '').replace(/"/g, '""')}"`, // Escape quotes and wrap
      ]
    })

    // Build CSV content
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const csvWithBOM = BOM + csvContent

    // Return as downloadable file
    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="parent-skills-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting skill responses:', error)
    return NextResponse.json(
      { success: false, message: 'שגיאה ביצוא הנתונים' },
      { status: 500 }
    )
  }
}
