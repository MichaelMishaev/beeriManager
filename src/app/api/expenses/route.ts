import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Expense validation schema
const ExpenseSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  amount: z.number().positive('סכום חייב להיות חיובי'),
  expense_type: z.enum(['income', 'expense']),
  category: z.enum([
    'events', 'maintenance', 'equipment', 'refreshments',
    'transportation', 'donations', 'fundraising', 'other'
  ]),
  payment_method: z.enum(['cash', 'check', 'transfer', 'credit_card', 'other']),
  expense_date: z.string(),
  vendor_name: z.string().optional(),
  receipt_url: z.string().url().optional(),
  event_id: z.string().optional().nullable(),
  approved: z.boolean().default(false),
  approved_by: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const approved = searchParams.get('approved')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const eventId = searchParams.get('event_id')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    let query = supabase
      .from('expenses')
      .select('*')

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('expense_type', type)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (approved === 'true') {
      query = query.eq('approved', true)
    } else if (approved === 'false') {
      query = query.eq('approved', false)
    }

    if (startDate) {
      query = query.gte('expense_date', startDate)
    }

    if (endDate) {
      query = query.lte('expense_date', endDate)
    }

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    // Order by date
    query = query
      .order('expense_date', { ascending: false })
      .limit(Math.min(limit, 200))

    const { data, error } = await query

    if (error) {
      console.error('Expenses query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת ההוצאות' },
        { status: 500 }
      )
    }

    // Calculate totals
    const totals = {
      income: data?.filter(e => e.expense_type === 'income')
        .reduce((sum, e) => sum + e.amount, 0) || 0,
      expenses: data?.filter(e => e.expense_type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0) || 0,
      balance: 0
    }
    totals.balance = totals.income - totals.expenses

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      totals
    })

  } catch (error) {
    console.error('Expenses GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת ההוצאות' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = ExpenseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create expense
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        ...validation.data,
        created_by: 'admin', // In a full system, this would come from JWT
        event_id: validation.data.event_id || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Expense creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת ההוצאה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `ה${validation.data.expense_type === 'income' ? 'הכנסה' : 'הוצאה'} נוצרה בהצלחה`
    })

  } catch (error) {
    console.error('Expenses POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת ההוצאה' },
      { status: 500 }
    )
  }
}