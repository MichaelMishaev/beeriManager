import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

// DELETE - Admin-only: soft delete a response
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, message: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'מזהה תשובה לא תקין' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Soft delete by setting deleted_at timestamp
    const { data, error } = await supabase
      .from('parent_skill_responses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null) // Only delete if not already deleted
      .select('id')
      .single()

    if (error) {
      console.error('Error soft deleting skill response:', error)

      // Check if response was not found or already deleted
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'התשובה לא נמצאה או כבר נמחקה' },
          { status: 404 }
        )
      }

      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'התשובה נמחקה בהצלחה',
      id: data.id,
    })
  } catch (error) {
    console.error('Error in skill response deletion:', error)
    return NextResponse.json(
      { success: false, message: 'שגיאה במחיקת התשובה' },
      { status: 500 }
    )
  }
}
