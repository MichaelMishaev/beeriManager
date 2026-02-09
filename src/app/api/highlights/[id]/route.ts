import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Partial schema for updates - Russian fields are optional
const HighlightUpdateSchema = z.object({
  type: z.enum(['achievement', 'sports', 'award', 'event', 'announcement']).optional(),
  icon: z.string().min(1, 'אייקון נדרש').optional(),
  title_he: z.string().min(2, 'כותרת בעברית חייבת להכיל לפחות 2 תווים').optional(),
  title_ru: z.string().optional(),
  description_he: z.string().min(10, 'תיאור בעברית חייב להכיל לפחות 10 תווים').optional(),
  description_ru: z.string().optional(),
  category_he: z.string().min(2, 'קטגוריה בעברית חייבת להכיל לפחות 2 תווים').optional(),
  category_ru: z.string().optional(),
  event_date: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  image_placeholder: z.string().optional().nullable(),
  cta_text_he: z.string().optional().nullable(),
  cta_text_ru: z.string().optional().nullable(),
  cta_link: z.string().optional().nullable(),
  badge_color: z.string().optional(),
  is_active: z.boolean().optional(),
  display_order: z.number().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  share_text_he: z.string().optional().nullable(),
  share_text_ru: z.string().optional().nullable(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('[Highlights GET by ID] ❌ Query error:', error)
      return NextResponse.json(
        { success: false, error: 'הדגשה לא נמצאה' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('[Highlights GET by ID] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת ההדגשה' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can update highlights
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('[Highlights PATCH] Update body:', JSON.stringify(body, null, 2))

    const validation = HighlightUpdateSchema.safeParse(body)

    if (!validation.success) {
      console.error('[Highlights PATCH] ❌ Validation errors:', validation.error.errors)

      // Create user-friendly error messages
      const fieldNames: Record<string, string> = {
        'icon': 'אייקון',
        'title_he': 'כותרת בעברית',
        'description_he': 'תיאור בעברית',
        'category_he': 'קטגוריה בעברית',
      }

      const errors = validation.error.errors.map(err => {
        const field = err.path[0] as string
        const hebrewName = fieldNames[field] || field
        return `${hebrewName}: ${err.message}`
      })

      return NextResponse.json(
        {
          success: false,
          error: 'יש לתקן את השדות הבאים',
          details: errors
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update highlight
    const { data, error } = await supabase
      .from('highlights')
      .update(validation.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[Highlights PATCH] ❌ Update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון ההדגשה', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Highlights PATCH] ✅ Highlight updated:', params.id)
    return NextResponse.json({
      success: true,
      data,
      message: 'הדגשה עודכנה בהצלחה'
    })

  } catch (error) {
    console.error('[Highlights PATCH] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון ההדגשה' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can delete highlights
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Delete the highlight
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[Highlights DELETE by ID] ❌ Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת ההדגשה' },
        { status: 500 }
      )
    }

    console.log('[Highlights DELETE by ID] ✅ Highlight deleted:', params.id)
    return NextResponse.json({
      success: true,
      message: 'הדגשה נמחקה בהצלחה'
    })

  } catch (error) {
    console.error('[Highlights DELETE by ID] ❌ Exception:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת ההדגשה' },
      { status: 500 }
    )
  }
}
