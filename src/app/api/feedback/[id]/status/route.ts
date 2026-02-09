import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const StatusUpdateSchema = z.object({
  status: z.enum(['new', 'read', 'responded', 'done', 'in_progress', 'other']),
  status_comment: z.string().optional().nullable()
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can update feedback status
    const token = req.cookies.get('auth-token')
    if (!token || !(await verifyJWT(token.value))) {
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

    const supabase = await createClient()

    // Prepare update data
    const updateData: any = { status: validation.data.status }

    // Add status_comment if provided, or clear it if status is not 'other'
    if (validation.data.status === 'other' && validation.data.status_comment) {
      updateData.status_comment = validation.data.status_comment
    } else if (validation.data.status !== 'other') {
      updateData.status_comment = null
    }

    const { data, error } = await supabase
      .from('anonymous_feedback')
      .update(updateData)
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
