import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Partial tag update schema
const TagUpdateSchema = z.object({
  name: z.string()
    .min(2, 'שם התגית חייב להכיל לפחות 2 תווים')
    .regex(/^[a-z0-9_-]+$/, 'שם התגית יכול להכיל רק אותיות באנגלית, מספרים, מקף ומקף תחתון')
    .optional(),
  name_he: z.string().min(2, 'שם עברי חייב להכיל לפחות 2 תווים').optional(),
  emoji: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'צבע חייב להיות בפורמט HEX').optional(),
  description: z.string().optional().nullable(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional()
})

/**
 * GET /api/tags/[id]
 * Get a specific tag by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'תגית לא נמצאה' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Tag GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת התגית' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tags/[id]
 * Update a specific tag (admin only)
 * System tags can be updated but not deactivated or have name changed
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')

    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = TagUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if tag exists and get system status
    const { data: existing, error: fetchError } = await supabase
      .from('tags')
      .select('id, name, is_system')
      .eq('id', params.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'תגית לא נמצאה' },
        { status: 404 }
      )
    }

    // Prevent changing system tag name or deactivating it
    if (existing.is_system) {
      if (validation.data.name && validation.data.name !== existing.name) {
        return NextResponse.json(
          { success: false, error: 'לא ניתן לשנות את שם תגית מערכת' },
          { status: 403 }
        )
      }
      if (validation.data.is_active === false) {
        return NextResponse.json(
          { success: false, error: 'לא ניתן לבטל תגית מערכת' },
          { status: 403 }
        )
      }
    }

    // If changing name, check if new name already exists
    if (validation.data.name && validation.data.name !== existing.name) {
      const { data: duplicate } = await supabase
        .from('tags')
        .select('id')
        .eq('name', validation.data.name)
        .neq('id', params.id)
        .single()

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'תגית עם שם זה כבר קיימת' },
          { status: 400 }
        )
      }
    }

    // Update tag
    const { data, error } = await supabase
      .from('tags')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Tag update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון התגית', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')

    return NextResponse.json({
      success: true,
      data,
      message: 'התגית עודכנה בהצלחה'
    })

  } catch (error) {
    console.error('Tag PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון התגית' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tags/[id]
 * Delete a specific tag (admin only)
 * Cannot delete system tags
 * CASCADE will remove all task_tags relationships
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')

    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Check if tag exists and is system tag
    const { data: existing, error: fetchError } = await supabase
      .from('tags')
      .select('id, name_he, is_system, task_count')
      .eq('id', params.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'תגית לא נמצאה' },
        { status: 404 }
      )
    }

    if (existing.is_system) {
      return NextResponse.json(
        { success: false, error: 'לא ניתן למחוק תגית מערכת' },
        { status: 403 }
      )
    }

    // Delete tag (CASCADE will remove task_tags relationships)
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Tag delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת התגית', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')

    return NextResponse.json({
      success: true,
      message: `התגית "${existing.name_he}" נמחקה בהצלחה${existing.task_count > 0 ? ` (הוסרה מ-${existing.task_count} משימות)` : ''}`
    })

  } catch (error) {
    console.error('Tag DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת התגית' },
      { status: 500 }
    )
  }
}
