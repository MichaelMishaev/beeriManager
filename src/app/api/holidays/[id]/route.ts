import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: holiday, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching holiday:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch holiday' },
        { status: 500 }
      )
    }

    if (!holiday) {
      return NextResponse.json(
        { success: false, error: 'Holiday not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: holiday })
  } catch (error) {
    console.error('Error in holiday API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
