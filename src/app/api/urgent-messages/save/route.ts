import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { logger } from '@/lib/logger'
import type { UrgentMessage } from '@/types'

// Force dynamic rendering - critical for production to prevent Vercel caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get('auth-token')
    if (!token) {
      console.error('[Urgent Save] No auth token found')
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token.value)
    if (!payload || payload.role !== 'admin') {
      console.error('[Urgent Save] JWT verification failed', { payload })
      return NextResponse.json(
        { success: false, error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      )
    }

    console.log('[Urgent Save] Auth successful, parsing body...')
    const body = await req.json()
    console.log('[Urgent Save] Received body:', JSON.stringify(body, null, 2))

    const { messages } = body as { messages: UrgentMessage[] }

    if (!Array.isArray(messages)) {
      console.error('[Urgent Save] Messages is not an array:', { messages, type: typeof messages })
      return NextResponse.json(
        { success: false, error: 'נתונים לא תקינים - messages must be an array' },
        { status: 400 }
      )
    }

    console.log('[Urgent Save] Processing', messages.length, 'messages')

    const supabase = await createClient()

    // Get all existing message IDs
    const { data: existing, error: fetchError } = await supabase
      .from('urgent_messages')
      .select('id')

    if (fetchError) {
      console.error('[Urgent Save] Error fetching existing messages:', fetchError)
      throw fetchError
    }

    console.log('[Urgent Save] Existing messages in DB:', existing?.length || 0)
    const existingIds = new Set(existing?.map(m => m.id) || [])
    // Only include real UUIDs in incoming IDs set (not temporary numeric IDs)
    const incomingIds = new Set(
      messages
        .filter(m => m.id && !/^\d+$/.test(m.id)) // Only keep UUID format IDs
        .map(m => m.id)
    )

    console.log('[Urgent Save] Delete check:', {
      existingCount: existingIds.size,
      incomingUuidCount: incomingIds.size,
      totalIncoming: messages.length
    })

    // Delete messages that are no longer in the incoming list
    const idsToDelete = Array.from(existingIds).filter(id => !incomingIds.has(id))

    // Determine if we should delete:
    // 1. If incoming has ALL numeric IDs (all new) → skip delete (preserve existing)
    // 2. If incoming has at least one UUID → delete missing ones
    // 3. If incoming is empty → delete all (user deleted everything)
    const hasOnlyNumericIds = messages.length > 0 && messages.every(m => /^\d+$/.test(m.id || ''))

    if (idsToDelete.length > 0 && !hasOnlyNumericIds) {
      console.log('[Urgent Save] Deleting', idsToDelete.length, 'messages:', idsToDelete)
      const { error: deleteError } = await supabase
        .from('urgent_messages')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        console.error('[Urgent Save] Delete error:', deleteError)
        throw deleteError
      }
      console.log('[Urgent Save] ✅ Deleted successfully')
    } else if (idsToDelete.length > 0) {
      console.log('[Urgent Save] ⏭️  Skipping delete - all incoming messages are new (numeric IDs)')
    }

    // Separate new messages (with numeric IDs) from existing ones (with UUID)
    const newMessages = messages.filter(msg => !msg.id || /^\d+$/.test(msg.id))
    const existingMessages = messages.filter(msg => msg.id && !/^\d+$/.test(msg.id))

    console.log('[Urgent Save] New messages to insert:', newMessages.length)
    console.log('[Urgent Save] Existing messages to upsert:', existingMessages.length)

    // Insert new messages (let DB generate UUID)
    if (newMessages.length > 0) {
      const insertData = newMessages.map(msg => ({
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
        created_by: 'admin'
      }))

      console.log('[Urgent Save] Insert data:', JSON.stringify(insertData, null, 2))

      const { data: insertedData, error: insertError } = await supabase
        .from('urgent_messages')
        .insert(insertData)
        .select()

      if (insertError) {
        console.error('[Urgent Save] Insert error:', insertError)
        throw insertError
      }

      console.log('[Urgent Save] ✅ Inserted successfully:', insertedData?.length || 0, 'rows')
    }

    // Update existing messages
    if (existingMessages.length > 0) {
      const upsertData = existingMessages.map(msg => ({
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
      }))

      const { error: upsertError } = await supabase
        .from('urgent_messages')
        .upsert(upsertData, { onConflict: 'id' })

      if (upsertError) {
        console.error('[Urgent Save] Upsert error:', upsertError)
        throw upsertError
      }
    }

    logger.success('Urgent messages saved successfully', {
      component: 'Urgent Messages Admin',
      count: messages.length
    })

    console.log('[Urgent Save] ✅ Save completed successfully. Total messages:', messages.length)

    return NextResponse.json({
      success: true,
      message: 'הודעות דחופות נשמרו בהצלחה',
      count: messages.length,
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })

  } catch (error) {
    console.error('[Urgent Save] ❌ Error:', error)
    logger.error('Urgent messages save error', { component: 'Urgent Messages Admin', error })
    return NextResponse.json(
      { success: false, error: 'שגיאה בשמירת הודעות דחופות', details: String(error) },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    )
  }
}
