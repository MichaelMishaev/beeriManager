import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    // Validate phone format
    if (!phone || !/^05\d{8}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'מספר טלפון לא תקין' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('grocery_events')
      .select('*')
      .eq('creator_phone', phone)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Grocery lookup error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בחיפוש רשימות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Grocery my-lists error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בחיפוש רשימות' },
      { status: 500 }
    )
  }
}
