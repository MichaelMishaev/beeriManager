import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt-edge'
import { z } from 'zod'
import { logger } from '@/lib/logger'

// Committee validation schema
const CommitteeSchema = z.object({
  name: z.string().min(2, 'שם הוועדה חייב להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'צבע חייב להיות בפורמט hex תקין').default('#3B82F6'),
  responsibilities: z.array(z.string()).default([]),
  members: z.array(z.string()).default([])
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)

    // Query parameters
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    let query = supabase
      .from('committees')
      .select('*')

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Order by name
    query = query
      .order('name', { ascending: true })
      .limit(Math.min(limit, 100))

    const { data, error } = await query

    if (error) {
      console.error('Committees query error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בטעינת הוועדות' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Committees GET error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הוועדות' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    logger.apiCall('POST', '/api/committees', {})

    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token) {
      logger.warning('Committee creation without auth token', { component: 'Committees' })
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token.value)
    if (!payload || payload.role !== 'admin') {
      logger.warning('Committee creation with invalid token', { component: 'Committees' })
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validation = CommitteeSchema.safeParse(body)

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

    const supabase = createClient()

    // Create committee
    const { data, error } = await supabase
      .from('committees')
      .insert([{
        ...validation.data,
        created_by: 'admin' // In a full system, this would come from JWT
      }])
      .select()
      .single()

    if (error) {
      logger.error('Committee creation error', { component: 'Committees', error })
      return NextResponse.json(
        { success: false, error: 'שגיאה ביצירת הוועדה' },
        { status: 500 }
      )
    }

    logger.success('Committee created successfully', {
      component: 'Committees',
      data: { id: data.id, name: data.name }
    })

    return NextResponse.json({
      success: true,
      data,
      message: 'הוועדה נוצרה בהצלחה'
    })

  } catch (error) {
    logger.error('Committees POST error', { component: 'Committees', error })
    return NextResponse.json(
      { success: false, error: 'שגיאה ביצירת הוועדה' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'מזהה וועדה חסר' },
        { status: 400 }
      )
    }

    const validation = CommitteeSchema.partial().safeParse(updateData)

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

    const supabase = createClient()

    // Update committee
    const { data, error } = await supabase
      .from('committees')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Committee update error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בעדכון הוועדה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'הוועדה עודכנה בהצלחה'
    })

  } catch (error) {
    console.error('Committees PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בעדכון הוועדה' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    const supabase = createClient()

    if (!id) {
      // Delete all committees if no ID provided
      const { data: allCommittees, error: fetchError } = await supabase
        .from('committees')
        .select('id')

      if (fetchError || !allCommittees || allCommittees.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'אין ועדות למחיקה'
        })
      }

      const { error } = await supabase
        .from('committees')
        .delete()
        .in('id', allCommittees.map(c => c.id))

      if (error) {
        console.error('Committees deletion error:', error)
        return NextResponse.json(
          { success: false, error: 'שגיאה במחיקת הוועדות' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'כל הוועדות נמחקו בהצלחה'
      })
    }

    // Delete single committee by ID
    const { error } = await supabase
      .from('committees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Committee deletion error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הוועדה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הוועדה נמחקה בהצלחה'
    })

  } catch (error) {
    console.error('Committees DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הוועדה' },
      { status: 500 }
    )
  }
}