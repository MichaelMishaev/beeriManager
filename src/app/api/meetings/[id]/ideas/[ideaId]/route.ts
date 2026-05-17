import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const UpdateIdeaStatusSchema = z.object({
  discussion_status: z.enum(['pending', 'discussed', 'decided'])
})

interface RouteParams {
  params: Promise<{ id: string; ideaId: string }>
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id, ideaId } = await params
    const body = await req.json()
    const validation = UpdateIdeaStatusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'נתונים לא תקינים' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('meeting_ideas')
      .update({ discussion_status: validation.data.discussion_status })
      .eq('id', ideaId)
      .eq('meeting_id', id)
      .select()
      .single()

    if (error) {
      console.error('Idea status update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הסטטוס' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הסטטוס עודכן בהצלחה'
    })
  } catch (error) {
    console.error('Idea PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הסטטוס' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { id, ideaId } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('meeting_ideas')
      .delete()
      .eq('id', ideaId)
      .eq('meeting_id', id)

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
