import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; ideaId: string } }
) {
  try {
    // Admin only
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('meeting_ideas')
      .delete()
      .eq('id', params.ideaId)
      .eq('meeting_id', params.id)

    if (error) {
      console.error('Idea deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הרעיון' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הרעיון נמחק בהצלחה'
    })
  } catch (error) {
    console.error('Idea DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הרעיון' },
      { status: 500 }
    )
  }
}
