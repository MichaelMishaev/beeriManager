import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can delete feedback
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('anonymous_feedback')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Feedback deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת המשוב' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'המשוב נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Feedback DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת המשוב' },
      { status: 500 }
    )
  }
}
