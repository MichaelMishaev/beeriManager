import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { z } from 'zod'

// Ideas validation schema
const IdeaSchema = z.object({
  category: z.enum(['improvement', 'feature', 'process', 'other']),
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').max(100),
  description: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים'),
  submitter_name: z.string().optional().nullable().or(z.literal('')),
  contact_email: z.string().optional().nullable().or(z.literal('')),
  is_anonymous: z.boolean().default(true)
})

export async function GET(req: NextRequest) {
  try {
    // Only admins can view ideas
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('ideas')
      .select('*')

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Order by created date
    query = query
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Ideas query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הרעיונות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Ideas GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הרעיונות' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Anyone can submit ideas (no auth required)
    const body = await req.json()
    console.log('Idea submission body:', JSON.stringify(body, null, 2))

    const validation = IdeaSchema.safeParse(body)

    if (!validation.success) {
      console.error('Idea validation errors:', validation.error.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'נתונים לא תקינים',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      )
    }

    console.log('Idea validation passed:', validation.data)

    const supabase = createClient()

    // Prepare idea data
    const ideaData: any = {
      title: validation.data.title,
      description: validation.data.description,
      category: validation.data.category,
      is_anonymous: validation.data.is_anonymous ?? true,
    }

    // Add optional fields only if provided and not anonymous
    if (!validation.data.is_anonymous) {
      // Trim and check if not empty before adding
      const trimmedName = validation.data.submitter_name?.trim()
      const trimmedContact = validation.data.contact_email?.trim()

      if (trimmedName && trimmedName.length > 0) {
        ideaData.submitter_name = trimmedName
      }
      if (trimmedContact && trimmedContact.length > 0) {
        ideaData.contact_email = trimmedContact
      }
    }

    console.log('Inserting idea data:', JSON.stringify(ideaData, null, 2))

    // Create idea
    const { data, error } = await supabase
      .from('ideas')
      .insert([ideaData])
      .select()
      .single()

    if (error) {
      console.error('Idea creation error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { success: false, error: 'שגיאה בשליחת הרעיון', details: error.message },
        { status: 500 }
      )
    }

    console.log('Idea created successfully:', data)

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

export async function DELETE(req: NextRequest) {
  try {
    // Only admins can delete ideas
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Delete all ideas
    const { error } = await supabase
      .from('ideas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (error) {
      console.error('Ideas deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הרעיונות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'כל הרעיונות נמחקו בהצלחה'
    })

  } catch (error) {
    console.error('Ideas DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הרעיונות' },
      { status: 500 }
    )
  }
}
