import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Tag validation schema
const TagSchema = z.object({
  name: z.string()
    .min(2, 'שם התגית חייב להכיל לפחות 2 תווים')
    .regex(/^[a-z0-9_-]+$/, 'שם התגית יכול להכיל רק אותיות באנגלית, מספרים, מקף ומקף תחתון'),
  name_he: z.string().min(2, 'שם עברי חייב להכיל לפחות 2 תווים'),
  emoji: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'צבע חייב להיות בפורמט HEX').default('#0D98BA'),
  description: z.string().optional().nullable(),
  display_order: z.number().int().min(0).default(0),
  is_system: z.boolean().default(false),
  is_active: z.boolean().default(true)
})

/**
 * GET /api/tags
 * Get all tags with optional filtering
 * Query params:
 * - active: 'true' | 'false' (default: true)
 * - system: 'true' | 'false' (optional)
 * - sort: 'name' | 'usage' | 'order' (default: order)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const activeOnly = searchParams.get('active') !== 'false' // Default to true
    const systemOnly = searchParams.get('system')
    const sortBy = searchParams.get('sort') || 'order'

    let query = supabase
      .from('tags')
      .select('*')

    // Apply filters
    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (systemOnly !== null) {
      query = query.eq('is_system', systemOnly === 'true')
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        query = query.order('name_he', { ascending: true })
        break
      case 'usage':
        query = query.order('task_count', { ascending: false })
        break
      case 'order':
      default:
        query = query.order('display_order', { ascending: true })
        query = query.order('name_he', { ascending: true })
    }

    const { data, error } = await query

    if (error) {
      console.error('Tags query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת התגיות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Tags GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת התגיות' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tags
 * Create a new tag (admin only)
 */
export async function POST(req: NextRequest) {
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
    const validation = TagSchema.safeParse(body)

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

    // Check if tag with same name already exists
    const { data: existing } = await supabase
      .from('tags')
      .select('id, name')
      .eq('name', validation.data.name)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'תגית עם שם זה כבר קיימת' },
        { status: 400 }
      )
    }

    // Create tag
    const { data, error } = await supabase
      .from('tags')
      .insert([{
        ...validation.data,
        task_count: 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Tag creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת התגית', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate relevant pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')

    return NextResponse.json({
      success: true,
      data,
      message: 'התגית נוצרה בהצלחה'
    })

  } catch (error) {
    console.error('Tags POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת התגית' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tags
 * Delete all non-system tags (admin only) - used for cleanup
 */
export async function DELETE(req: NextRequest) {
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

    // Only delete non-system tags
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('is_system', false)

    if (error) {
      console.error('Tags delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת התגיות' },
        { status: 500 }
      )
    }

    // Revalidate pages
    revalidatePath('/admin/tasks')
    revalidatePath('/tasks')

    return NextResponse.json({
      success: true,
      message: 'תגיות מותאמות אישית נמחקו בהצלחה'
    })

  } catch (error) {
    console.error('Tags DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת התגיות' },
      { status: 500 }
    )
  }
}
