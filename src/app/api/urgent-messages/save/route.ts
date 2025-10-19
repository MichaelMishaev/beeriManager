import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { verifyJWT } from '@/lib/auth/jwt-edge'
import { logger } from '@/lib/logger'
import type { UrgentMessage } from '@/types'

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

    const { messages } = await req.json() as { messages: UrgentMessage[] }

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'נתונים לא תקינים' },
        { status: 400 }
      )
    }

    // Write to JSON file
    const filePath = join(process.cwd(), 'src/data/urgent-messages.json')
    await writeFile(filePath, JSON.stringify(messages, null, 2), 'utf-8')

    logger.success('Urgent messages saved successfully', {
      component: 'Urgent Messages Admin',
      count: messages.length
    })

    return NextResponse.json({
      success: true,
      message: 'הודעות דחופות נשמרו בהצלחה',
      count: messages.length
    })

  } catch (error) {
    logger.error('Urgent messages save error', { component: 'Urgent Messages Admin', error })
    return NextResponse.json(
      { success: false, error: 'שגיאה בשמירת הודעות דחופות' },
      { status: 500 }
    )
  }
}
