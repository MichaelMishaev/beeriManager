import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import type { UrgentMessage } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const filePath = join(process.cwd(), 'src/data/urgent-messages.json')
    const fileContents = await readFile(filePath, 'utf-8')
    const messages: UrgentMessage[] = JSON.parse(fileContents)

    // Check if admin wants all messages (for admin panel)
    const showAll = req.nextUrl.searchParams.get('all') === 'true'

    if (showAll) {
      return NextResponse.json({
        success: true,
        data: messages
      })
    }

    // Filter only active messages within date range (for public view)
    const now = new Date()
    const activeMessages = messages.filter(msg => {
      if (!msg.is_active) return false
      const startDate = new Date(msg.start_date)
      const endDate = new Date(msg.end_date)
      return now >= startDate && now <= endDate
    })

    return NextResponse.json({
      success: true,
      data: activeMessages
    })
  } catch (error) {
    console.error('Failed to load urgent messages', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load urgent messages' },
      { status: 500 }
    )
  }
}
