/**
 * Calendar Operation Guards - BeeriManager
 *
 * Provides runtime guards for Google Calendar integration.
 * Prevents duplicate events and ensures sync integrity.
 */

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

/**
 * GUARD 5: Google Calendar Duplicate Prevention
 *
 * Checks if event already exists in database by google_calendar_id.
 * Prevents creating duplicate calendar events on sync.
 *
 * @example
 * const isDuplicate = await checkCalendarDuplicate(googleCalendarId)
 * if (isDuplicate) throw new Error('Event already exists')
 */
export async function checkCalendarDuplicate(
  googleCalendarId: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, google_calendar_id')
      .eq('google_calendar_id', googleCalendarId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (not a duplicate)
      logger.error('Calendar duplicate check failed', {
        component: 'Calendar',
        action: 'checkDuplicate',
        data: { googleCalendarId },
        error
      })
      return false // Fail open on error (don't block event creation)
    }

    if (data) {
      // Duplicate found!
      logger.error('INVARIANT VIOLATION: Duplicate calendar event detected', {
        component: 'Calendar',
        action: 'checkDuplicate',
        data: {
          googleCalendarId,
          existingEventId: data.id,
          existingEventTitle: data.title
        }
      })
      return true
    }

    return false
  } catch (error) {
    logger.error('Calendar duplicate check exception', {
      component: 'Calendar',
      action: 'checkDuplicate',
      data: { googleCalendarId },
      error
    })
    return false // Fail open on exception
  }
}

/**
 * Prevent duplicate event creation
 *
 * Throws error if duplicate is found.
 * Use this before creating new calendar events.
 */
export async function preventDuplicateEvent(
  googleCalendarId: string,
  eventTitle?: string
): Promise<void> {
  const isDuplicate = await checkCalendarDuplicate(googleCalendarId)

  if (isDuplicate) {
    logger.error('INVARIANT VIOLATION: Attempted to create duplicate calendar event', {
      component: 'Calendar',
      action: 'preventDuplicate',
      data: { googleCalendarId, eventTitle }
    })

    throw new Error(
      `Event already exists in Google Calendar (ID: ${googleCalendarId})`
    )
  }
}

/**
 * Safe event creation with duplicate check
 *
 * Returns existing event ID if duplicate, creates new event if not.
 */
export async function safeCreateEvent(
  eventData: {
    title: string
    description?: string
    start_date: string
    end_date?: string
    location?: string
    google_calendar_id?: string
    [key: string]: any
  }
): Promise<{ success: boolean; eventId?: string; isDuplicate?: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Check for duplicate if google_calendar_id provided
    if (eventData.google_calendar_id) {
      const isDuplicate = await checkCalendarDuplicate(eventData.google_calendar_id)

      if (isDuplicate) {
        // Return existing event
        const { data: existing } = await supabase
          .from('events')
          .select('id')
          .eq('google_calendar_id', eventData.google_calendar_id)
          .single()

        logger.info('Calendar event already exists, returning existing ID', {
          component: 'Calendar',
          action: 'safeCreateEvent',
          data: { googleCalendarId: eventData.google_calendar_id, existingId: existing?.id }
        })

        return {
          success: true,
          eventId: existing?.id,
          isDuplicate: true
        }
      }
    }

    // Create new event
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select('id')
      .single()

    if (error) {
      logger.error('Event creation failed', {
        component: 'Calendar',
        action: 'safeCreateEvent',
        data: { title: eventData.title },
        error
      })

      return {
        success: false,
        error: error.message
      }
    }

    logger.success('Event created successfully', {
      component: 'Calendar',
      action: 'safeCreateEvent',
      data: { eventId: data.id, title: eventData.title }
    })

    return {
      success: true,
      eventId: data.id,
      isDuplicate: false
    }
  } catch (error) {
    logger.error('Safe create event exception', {
      component: 'Calendar',
      action: 'safeCreateEvent',
      data: { title: eventData.title },
      error
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
