import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const StatusUpdateSchema = z.object({
  status: z.enum(['new', 'read', 'responded'])
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can update feedback status
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = StatusUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'נתונים לא תקינים' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('anonymous_feedback')
      .update({ status: validation.data.status })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Status update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הסטטוס' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הסטטוס' },
      { status: 500 }
    )
  }
}
