import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'הרשומה לא נמצאה' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Expense GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הרשומה' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const supabase = await createClient()

    // Update expense
    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Expense update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הרשומה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הרשומה עודכנה בהצלחה'
    })

  } catch (error) {
    console.error('Expense PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הרשומה' },
      { status: 500 }
    )
  }
}

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

    const supabase = await createClient()

    // Soft delete - mark as archived
    const { error } = await supabase
      .from('expenses')
      .update({
        archived_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Expense delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הרשומה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הרשומה נמחקה בהצלחה'
    })

  } catch (error) {
    console.error('Expense DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הרשומה' },
      { status: 500 }
    )
  }
}