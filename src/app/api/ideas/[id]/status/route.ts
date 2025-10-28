import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

const StatusUpdateSchema = z.object({
  status: z.enum(['new', 'reviewed', 'approved', 'implemented', 'rejected']),
  response: z.string().optional().nullable(),
  admin_notes: z.string().optional().nullable()
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admins can update idea status
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

    // Prepare update data
    const updateData: any = {
      status: validation.data.status
    }

    // Add response if provided
    if (validation.data.response !== undefined) {
      updateData.response = validation.data.response
      // Set responded_at timestamp if response is being added
      if (validation.data.response) {
        updateData.responded_at = new Date().toISOString()
      }
    }

    // Add admin_notes if provided
    if (validation.data.admin_notes !== undefined) {
      updateData.admin_notes = validation.data.admin_notes
    }

    const { data, error } = await supabase
      .from('ideas')
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
