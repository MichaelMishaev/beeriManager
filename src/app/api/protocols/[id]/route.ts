import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Protocol update validation schema
const ProtocolUpdateSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').optional(),
  protocol_date: z.string().optional(),
  year: z.number().optional(),
  categories: z.array(z.string()).optional(),
  attendees: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  extracted_text: z.string().optional(),
  agenda: z.string().optional(),
  decisions: z.string().optional(),
  action_items: z.string().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: protocol, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !protocol) {
      return NextResponse.json(
        { success: false, error: 'פרוטוקול לא נמצא' },
        { status: 404 }
      )
    }

    // Check if user is authenticated for non-public protocols
    const token = req.cookies.get('auth-token')
    if (!protocol.is_public && (!token || !verifyJWT(token.value))) {
      return NextResponse.json(
        { success: false, error: 'אין הרשאה לצפייה בפרוטוקול זה' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: protocol
    })
  } catch (error) {
    console.error('Protocol GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הפרוטוקול' },
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
    console.log('Updating protocol:', params.id, JSON.stringify(body, null, 2))

    const validation = ProtocolUpdateSchema.safeParse(body)

    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update protocol
    const { data, error } = await supabase
      .from('protocols')
      .update(validation.data)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Protocol update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הפרוטוקול' },
        { status: 500 }
      )
    }

    // Revalidate the protocols page to show updated data
    revalidatePath('/protocols')
    revalidatePath('/he/protocols')
    revalidatePath('/ru/protocols')
    revalidatePath(`/protocols/${params.id}`)
    revalidatePath(`/he/protocols/${params.id}`)
    revalidatePath(`/ru/protocols/${params.id}`)

    return NextResponse.json({
      success: true,
      data,
      message: 'הפרוטוקול עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Protocol PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הפרוטוקול' },
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

    const { error } = await supabase
      .from('protocols')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Protocol delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הפרוטוקול' },
        { status: 500 }
      )
    }

    // Revalidate the protocols page after deletion
    revalidatePath('/protocols')
    revalidatePath('/he/protocols')
    revalidatePath('/ru/protocols')

    return NextResponse.json({
      success: true,
      message: 'הפרוטוקול נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Protocol DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הפרוטוקול' },
      { status: 500 }
    )
  }
}
