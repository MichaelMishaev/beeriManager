import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'
import crypto from 'crypto'

// Vote validation schema
const VoteSchema = z.object({
  quote_id: z.string().uuid(),
  voter_identifier: z.string().min(1, 'נדרש מזהה מצביע'),
  voter_name: z.string().optional().nullable(),
  vote_type: z.enum(['prefer', 'neutral', 'oppose']),
  comment: z.string().optional().nullable()
})

// Hash voter identifier for privacy
function hashVoterIdentifier(identifier: string): string {
  return crypto.createHash('sha256').update(identifier.toLowerCase().trim()).digest('hex')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promId } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    // Check if user is admin
    const token = req.cookies.get('auth-token')
    const isAdmin = token && await verifyJWT(token.value)

    const quoteId = searchParams.get('quote_id')

    // Build query
    let query = supabase
      .from('prom_votes')
      .select('*')
      .eq('prom_id', promId)

    if (quoteId) {
      query = query.eq('quote_id', quoteId)
    }

    const { data: votes, error } = await query

    if (error) {
      console.error('Votes query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת ההצבעות' },
        { status: 500 }
      )
    }

    // Calculate vote statistics per quote
    const voteStats: Record<string, { prefer: number; neutral: number; oppose: number; total: number }> = {}

    votes?.forEach(vote => {
      if (!voteStats[vote.quote_id]) {
        voteStats[vote.quote_id] = { prefer: 0, neutral: 0, oppose: 0, total: 0 }
      }
      voteStats[vote.quote_id][vote.vote_type as 'prefer' | 'neutral' | 'oppose']++
      voteStats[vote.quote_id].total++
    })

    // For non-admin, only return statistics, not individual votes
    if (!isAdmin) {
      return NextResponse.json({
        success: true,
        data: {
          stats: voteStats,
          total_voters: new Set(votes?.map(v => v.voter_identifier)).size
        }
      })
    }

    // Admin gets full data
    return NextResponse.json({
      success: true,
      data: {
        votes: votes || [],
        stats: voteStats,
        total_voters: new Set(votes?.map(v => v.voter_identifier)).size
      }
    })

  } catch (error) {
    console.error('Votes GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת ההצבעות' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promId } = await params
    const body = await req.json()

    // Clean up data
    const cleanedBody = {
      ...body,
      voter_name: body.voter_name === '' ? null : body.voter_name,
      comment: body.comment === '' ? null : body.comment
    }

    const validation = VoteSchema.safeParse(cleanedBody)

    if (!validation.success) {
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

    // Check if prom has voting enabled
    const { data: promEvent } = await supabase
      .from('prom_events')
      .select('voting_enabled, voting_start_date, voting_end_date')
      .eq('id', promId)
      .single()

    if (!promEvent?.voting_enabled) {
      return NextResponse.json(
        { success: false, error: 'ההצבעה לא פעילה כרגע' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (promEvent.voting_start_date && new Date(promEvent.voting_start_date) > now) {
      return NextResponse.json(
        { success: false, error: 'ההצבעה עדיין לא התחילה' },
        { status: 400 }
      )
    }

    if (promEvent.voting_end_date && new Date(promEvent.voting_end_date) < now) {
      return NextResponse.json(
        { success: false, error: 'ההצבעה הסתיימה' },
        { status: 400 }
      )
    }

    // Check if quote is a finalist
    const { data: quote } = await supabase
      .from('prom_vendor_quotes')
      .select('is_finalist')
      .eq('id', validation.data.quote_id)
      .eq('prom_id', promId)
      .single()

    if (!quote?.is_finalist) {
      return NextResponse.json(
        { success: false, error: 'לא ניתן להצביע על אפשרות זו' },
        { status: 400 }
      )
    }

    // Hash the voter identifier for privacy
    const hashedIdentifier = hashVoterIdentifier(validation.data.voter_identifier)

    // Upsert vote (update if exists, insert if not)
    const { data, error } = await supabase
      .from('prom_votes')
      .upsert(
        {
          prom_id: promId,
          quote_id: validation.data.quote_id,
          voter_identifier: hashedIdentifier,
          voter_name: validation.data.voter_name,
          vote_type: validation.data.vote_type,
          comment: validation.data.comment
        },
        {
          onConflict: 'prom_id,quote_id,voter_identifier'
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Vote creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בשמירת ההצבעה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'ההצבעה נשמרה בהצלחה'
    })

  } catch (error) {
    console.error('Votes POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בשמירת ההצבעה' },
      { status: 500 }
    )
  }
}

