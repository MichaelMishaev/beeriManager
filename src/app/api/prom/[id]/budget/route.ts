import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Budget item validation schema
const BudgetItemSchema = z.object({
  category: z.enum(['venue', 'catering', 'dj', 'photography', 'decorations', 'transportation', 'entertainment', 'other']),
  allocated_amount: z.number().min(0).default(0),
  spent_amount: z.number().min(0).default(0),
  notes: z.string().optional().nullable()
})

// Category labels in Hebrew
const categoryLabels: Record<string, string> = {
  venue: 'אולם/מקום',
  catering: 'קייטרינג',
  dj: 'DJ/מוזיקה',
  photography: 'צילום',
  decorations: 'קישוטים',
  transportation: 'הסעות',
  entertainment: 'בידור',
  other: 'אחר'
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promId } = await params
    const supabase = await createClient()

    // Get prom event for total budget
    const { data: promEvent, error: promError } = await supabase
      .from('prom_events')
      .select('total_budget, student_count')
      .eq('id', promId)
      .single()

    if (promError) {
      console.error('Prom event fetch error:', promError)
      return NextResponse.json(
        { success: false, error: 'אירוע לא נמצא' },
        { status: 404 }
      )
    }

    // Get budget items
    const { data: budgetItems, error: budgetError } = await supabase
      .from('prom_budget_items')
      .select('*')
      .eq('prom_id', promId)
      .order('category', { ascending: true })

    if (budgetError) {
      console.error('Budget items fetch error:', budgetError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת התקציב' },
        { status: 500 }
      )
    }

    // Calculate totals
    const totalAllocated = budgetItems?.reduce((sum, item) => sum + (item.allocated_amount || 0), 0) || 0
    const totalSpent = budgetItems?.reduce((sum, item) => sum + (item.spent_amount || 0), 0) || 0
    const totalBudget = promEvent.total_budget || 0
    const remaining = totalBudget - totalSpent
    const studentCount = promEvent.student_count || 0
    const perStudent = studentCount > 0 ? Math.round(totalSpent / studentCount) : 0

    // Add Hebrew labels to items
    const itemsWithLabels = budgetItems?.map(item => ({
      ...item,
      category_label: categoryLabels[item.category] || item.category
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: itemsWithLabels || [],
        summary: {
          total_budget: totalBudget,
          total_allocated: totalAllocated,
          total_spent: totalSpent,
          remaining,
          student_count: studentCount,
          per_student: perStudent,
          usage_percentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
        }
      }
    })

  } catch (error) {
    console.error('Budget GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת התקציב' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: promId } = await params
    const body = await req.json()

    // Clean up data
    const cleanedBody = {
      ...body,
      allocated_amount: body.allocated_amount ? parseFloat(body.allocated_amount) : 0,
      spent_amount: body.spent_amount ? parseFloat(body.spent_amount) : 0,
      notes: body.notes === '' ? null : body.notes
    }

    const validation = BudgetItemSchema.safeParse(cleanedBody)

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

    // Upsert budget item (update if exists for this category)
    const { data, error } = await supabase
      .from('prom_budget_items')
      .upsert(
        {
          prom_id: promId,
          ...validation.data
        },
        {
          onConflict: 'prom_id,category'
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Budget item creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בשמירת סעיף התקציב' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        category_label: categoryLabels[data.category] || data.category
      },
      message: 'סעיף התקציב נשמר בהצלחה'
    })

  } catch (error) {
    console.error('Budget POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בשמירת סעיף התקציב' },
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
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id: promId } = await params
    const body = await req.json()

    // Expect an array of budget items to update
    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, error: 'נדרש מערך של סעיפי תקציב' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const results = []

    for (const item of body.items) {
      const cleanedItem = {
        category: item.category,
        allocated_amount: item.allocated_amount ? parseFloat(item.allocated_amount) : 0,
        spent_amount: item.spent_amount ? parseFloat(item.spent_amount) : 0,
        notes: item.notes === '' ? null : item.notes
      }

      const validation = BudgetItemSchema.safeParse(cleanedItem)

      if (validation.success) {
        const { data, error } = await supabase
          .from('prom_budget_items')
          .upsert(
            {
              prom_id: promId,
              ...validation.data
            },
            {
              onConflict: 'prom_id,category'
            }
          )
          .select()
          .single()

        if (!error && data) {
          results.push({
            ...data,
            category_label: categoryLabels[data.category] || data.category
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'התקציב עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Budget PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון התקציב' },
      { status: 500 }
    )
  }
}

