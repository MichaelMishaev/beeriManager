import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '626283'

// GET - Fetch all settings
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .single()

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: null,
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || null,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'שגיאה בטעינת ההגדרות',
      },
      { status: 500 }
    )
  }
}

// PUT - Update settings (requires admin password)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin password
    const password = request.headers.get('X-Admin-Password')
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: 'סיסמה שגויה',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const supabase = await createClient()

    // Check if settings exist
    const { data: existing } = await supabase
      .from('app_settings')
      .select('id')
      .single()

    let result

    if (existing) {
      // Update existing settings
      result = await supabase
        .from('app_settings')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Insert new settings
      result = await supabase
        .from('app_settings')
        .insert({
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'שגיאה בשמירת ההגדרות',
      },
      { status: 500 }
    )
  }
}
