import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Committee fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הוועדה' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Committee GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הוועדה' },
      { status: 500 }
    )
  }
}