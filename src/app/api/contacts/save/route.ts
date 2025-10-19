import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { verifyJWT } from '@/lib/auth/jwt-edge'
import { logger } from '@/lib/logger'
import type { Contact } from '@/types'

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token.value)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const { contacts } = await req.json() as { contacts: Contact[] }

    if (!Array.isArray(contacts)) {
      return NextResponse.json(
        { success: false, error: 'נתונים לא תקינים' },
        { status: 400 }
      )
    }

    // Write to JSON file
    const filePath = join(process.cwd(), 'src/data/contacts.json')
    await writeFile(filePath, JSON.stringify(contacts, null, 2), 'utf-8')

    logger.success('Contacts saved successfully', {
      component: 'Contacts Admin',
      count: contacts.length
    })

    return NextResponse.json({
      success: true,
      message: 'אנשי הקשר נשמרו בהצלחה',
      count: contacts.length
    })

  } catch (error) {
    logger.error('Contacts save error', { component: 'Contacts Admin', error })
    return NextResponse.json(
      { success: false, error: 'שגיאה בשמירת אנשי הקשר' },
      { status: 500 }
    )
  }
}
