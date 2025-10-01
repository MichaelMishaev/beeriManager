import { NextRequest, NextResponse } from 'next/server'
import { performSearch, SearchType } from '@/lib/search'

// Mark as dynamic route to prevent static rendering
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const types = searchParams.get('types')?.split(',') as SearchType[] | undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters'
      }, { status: 400 })
    }

    const results = await performSearch({
      query,
      types,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}