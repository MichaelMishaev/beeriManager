import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const supabase = createClient()

    // Get all existing message IDs
    const { data: existing } = await supabase
      .from('urgent_messages')
      .select('id')

    const existingIds = new Set(existing?.map(m => m.id) || [])
    const incomingIds = new Set(messages.map(m => m.id))

    // Delete messages that are no longer in the incoming list
    const idsToDelete = Array.from(existingIds).filter(id => !incomingIds.has(id))
    if (idsToDelete.length > 0) {
      await supabase
        .from('urgent_messages')
        .delete()
        .in('id', idsToDelete)
    }

    // Upsert all incoming messages
    if (messages.length > 0) {
      const { error: upsertError } = await supabase
        .from('urgent_messages')
        .upsert(
          messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            title_he: msg.title_he,
            title_ru: msg.title_ru,
            description_he: msg.description_he || null,
            description_ru: msg.description_ru || null,
            share_text_he: msg.share_text_he || null,
            share_text_ru: msg.share_text_ru || null,
            icon: msg.icon || null,
            color: msg.color,
            is_active: msg.is_active,
            start_date: msg.start_date,
            end_date: msg.end_date,
            created_by: msg.created_by || 'admin',
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'id' }
        )

      if (upsertError) {
        console.error('Upsert error:', upsertError)
        throw upsertError
      }
    }

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
