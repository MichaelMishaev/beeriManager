import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const supabase = await createClient()

    // Approve expense
    const { data, error } = await supabase
      .from('expenses')
      .update({
        approved: true,
        approved_by: 'admin', // In a full system, this would come from JWT
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Expense approval error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה באישור הרשומה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הרשומה אושרה בהצלחה'
    })

  } catch (error) {
    console.error('Expense approval error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה באישור הרשומה' },
      { status: 500 }
    )
  }
}