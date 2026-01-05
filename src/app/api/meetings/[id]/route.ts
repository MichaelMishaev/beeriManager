import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const UpdateMeetingSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  meeting_date: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'completed']).optional(),
  is_open: z.boolean().optional()
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'הפגישה לא נמצאה' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Meeting GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הפגישה' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await req.json()
    const validation = UpdateMeetingSchema.safeParse(body)

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

    const updateData: any = { ...validation.data }

    // If closing meeting, set closed_at timestamp
    if (validation.data.is_open === false || validation.data.status === 'closed') {
      updateData.closed_at = new Date().toISOString()
      updateData.is_open = false
      updateData.status = 'closed'
    }

    const { data, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Meeting update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הפגישה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הפגישה עודכנה בהצלחה'
    })
  } catch (error) {
    console.error('Meeting PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הפגישה' },
      { status: 500 }
    )
  }
}
