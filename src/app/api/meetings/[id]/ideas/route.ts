import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const IdeaSchema = z.object({
  title: z.string().min(2, 'הכותרת חייבת להכיל לפחות 2 תווים').max(200),
  description: z.string().optional(),
  submitter_name: z.string().optional().nullable(),
  is_anonymous: z.boolean().default(true),
  submission_locale: z.string().default('he')
})

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // First verify meeting exists
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, meeting_date, description, is_open, status, ideas_count')
      .eq('id', params.id)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json(
        { success: false, error: 'הפגישה לא נמצאה' },
        { status: 404 }
      )
    }

    // Fetch all ideas for this meeting
    const { data: ideas, error: ideasError } = await supabase
      .from('meeting_ideas')
      .select('*')
      .eq('meeting_id', params.id)
      .order('created_at', { ascending: true })

    if (ideasError) {
      console.error('Ideas fetch error:', ideasError)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הרעיונות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        meeting,
        ideas: ideas || []
      },
      count: ideas?.length || 0
    })
  } catch (error) {
    console.error('Meeting ideas GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הרעיונות' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const validation = IdeaSchema.safeParse(body)

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

    // Verify meeting is open for submissions
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, is_open, status')
      .eq('id', params.id)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json(
        { success: false, error: 'הפגישה לא נמצאה' },
        { status: 404 }
      )
    }

    if (!meeting.is_open || meeting.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'הפגישה אינה פתוחה לשליחת רעיונות' },
        { status: 403 }
      )
    }

    // Create idea
    const ideaData = {
      meeting_id: params.id,
      title: validation.data.title,
      description: validation.data.description || null,
      submitter_name: validation.data.is_anonymous ? null : validation.data.submitter_name,
      is_anonymous: validation.data.is_anonymous,
      submission_locale: validation.data.submission_locale
    }

    const { data, error } = await supabase
      .from('meeting_ideas')
      .insert([ideaData])
      .select()
      .single()

    if (error) {
      console.error('Idea creation error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בשליחת הרעיון' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        created_at: data.created_at
      },
      message: 'הרעיון נשלח בהצלחה. תודה על השיתוף!'
    })
  } catch (error) {
    console.error('Idea POST error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בשליחת הרעיון' },
      { status: 500 }
    )
  }
}
