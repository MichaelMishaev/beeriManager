import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Prom event update validation schema
const PromEventUpdateSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').optional(),
  title_ru: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  description_ru: z.string().optional().nullable(),
  event_date: z.string().optional().nullable(),
  event_time: z.string().optional().nullable(),
  venue_name: z.string().optional().nullable(),
  venue_address: z.string().optional().nullable(),
  total_budget: z.number().min(0).optional(),
  student_count: z.number().min(0).optional(),
  status: z.enum(['planning', 'voting', 'confirmed', 'completed', 'cancelled']).optional(),
  voting_enabled: z.boolean().optional(),
  voting_start_date: z.string().optional().nullable(),
  voting_end_date: z.string().optional().nullable(),
  selected_quote_id: z.string().uuid().optional().nullable()
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch prom event with quotes count and vote stats
    const { data: promEvent, error } = await supabase
      .from('prom_events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Prom event fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'אירוע לא נמצא' },
        { status: 404 }
      )
    }

    // Get quotes count
    const { count: quotesCount } = await supabase
      .from('prom_vendor_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('prom_id', id)

    // Get votes count
    const { count: votesCount } = await supabase
      .from('prom_votes')
      .select('*', { count: 'exact', head: true })
      .eq('prom_id', id)

    // Get budget items
    const { data: budgetItems } = await supabase
      .from('prom_budget_items')
      .select('*')
      .eq('prom_id', id)

    // Calculate total spent
    const totalSpent = budgetItems?.reduce((sum, item) => sum + (item.spent_amount || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        ...promEvent,
        quotes_count: quotesCount || 0,
        votes_count: votesCount || 0,
        budget_items: budgetItems || [],
        total_spent: totalSpent
      }
    })

  } catch (error) {
    console.error('Prom event GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת האירוע' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()

    // Clean up empty strings to null
    const cleanedBody = {
      ...body,
      title_ru: body.title_ru === '' ? null : body.title_ru,
      description: body.description === '' ? null : body.description,
      description_ru: body.description_ru === '' ? null : body.description_ru,
      event_date: body.event_date === '' ? null : body.event_date,
      event_time: body.event_time === '' ? null : body.event_time,
      venue_name: body.venue_name === '' ? null : body.venue_name,
      venue_address: body.venue_address === '' ? null : body.venue_address,
      total_budget: body.total_budget !== undefined ? parseFloat(body.total_budget) : undefined,
      student_count: body.student_count !== undefined ? parseInt(body.student_count) : undefined,
      voting_start_date: body.voting_start_date === '' ? null : body.voting_start_date,
      voting_end_date: body.voting_end_date === '' ? null : body.voting_end_date,
      selected_quote_id: body.selected_quote_id === '' ? null : body.selected_quote_id
    }

    const validation = PromEventUpdateSchema.safeParse(cleanedBody)

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

    const supabase = await createClient()

    // Update prom event
    const { data, error } = await supabase
      .from('prom_events')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Prom event update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון האירוע' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'האירוע עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Prom event PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון האירוע' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can delete
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('prom_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Prom event deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת האירוע' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'האירוע נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Prom event DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת האירוע' },
      { status: 500 }
    )
  }
}

