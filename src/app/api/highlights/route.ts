import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema for highlights
const HighlightSchema = z.object({
  type: z.enum(['achievement', 'sports', 'award', 'event', 'announcement']),
  icon: z.string().min(1, 'אייקון נדרש'),
  title_he: z.string().min(2, 'כותרת בעברית חייבת להכיל לפחות 2 תווים'),
  title_ru: z.string().optional().default(''),
  description_he: z.string().min(10, 'תיאור בעברית חייב להכיל לפחות 10 תווים'),
  description_ru: z.string().optional().default(''),
  category_he: z.string().min(2, 'קטגוריה בעברית חייבת להכיל לפחות 2 תווים'),
  category_ru: z.string().optional().default(''),
  event_date: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  image_placeholder: z.string().optional().nullable(),
  cta_text_he: z.string().optional().nullable(),
  cta_text_ru: z.string().optional().nullable(),
  cta_link: z.string().optional().nullable(),
  badge_color: z.string().default('bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900'),
  is_active: z.boolean().default(true),
  display_order: z.number().default(0),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  share_text_he: z.string().optional().nullable(),
  share_text_ru: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Check if admin wants all highlights
    const showAll = searchParams.get('all') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    let query = supabase
      .from('highlights')
      .select('*')

    if (!showAll) {
      // Public view: only active highlights within date range
      const now = new Date().toISOString()

      query = query
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
    }

    // Order by display_order (ascending) then created_at (descending)
    query = query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 50))

    const { data, error } = await query

    if (error) {
      console.error('[Highlights GET] ❌ Query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת ההדגשות' },
        { status: 500 }
      )
    }

    console.log('[Highlights GET] ✅ Returning', data?.length || 0, 'highlights')
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('[Highlights GET] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת ההדגשות' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only admins can create highlights
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('[Highlights POST] Request body:', JSON.stringify(body, null, 2))

    const validation = HighlightSchema.safeParse(body)

    if (!validation.success) {
      console.error('[Highlights POST] ❌ Validation errors:', validation.error.errors)

      // Create user-friendly error messages in Hebrew
      const fieldNames: Record<string, string> = {
        'icon': 'אייקון',
        'title_he': 'כותרת בעברית',
        'description_he': 'תיאור בעברית',
        'category_he': 'קטגוריה בעברית',
        'type': 'סוג הדגשה',
      }

      const errors = validation.error.errors.map(err => {
        const field = err.path[0] as string
        const hebrewName = fieldNames[field] || field
        return `${hebrewName}: ${err.message}`
      })

      return NextResponse.json(
        {
          success: false,
          error: 'יש למלא את כל השדות החובה',
          details: errors
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert highlight
    const { data, error } = await supabase
      .from('highlights')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      console.error('[Highlights POST] ❌ Insert error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הדגשה', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Highlights POST] ✅ Highlight created:', data.id)
    return NextResponse.json({
      success: true,
      data,
      message: 'הדגשה נוצרה בהצלחה'
    })

  } catch (error) {
    console.error('[Highlights POST] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הדגשה' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Only admins can delete highlights
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Delete all highlights
    const { error } = await supabase
      .from('highlights')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (error) {
      console.error('[Highlights DELETE] ❌ Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת ההדגשות' },
        { status: 500 }
      )
    }

    console.log('[Highlights DELETE] ✅ All highlights deleted')
    return NextResponse.json({
      success: true,
      message: 'כל ההדגשות נמחקו בהצלחה'
    })

  } catch (error) {
    console.error('[Highlights DELETE] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת ההדגשות' },
      { status: 500 }
    )
  }
}
