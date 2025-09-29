import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token || !verifyJWT(token.value)) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'documents'
    const path = formData.get('path') as string || ''

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'לא נבחר קובץ' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'גודל הקובץ חורג מ-10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'סוג קובץ לא נתמך' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה בהעלאת הקובץ' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה בהעלאת הקובץ' },
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
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket') || 'documents'

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'נתיב קובץ חסר' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'שגיאה במחיקת הקובץ' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הקובץ נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הקובץ' },
      { status: 500 }
    )
  }
}