import type { Event } from '@/types'

export type AdminEventTab = 'upcoming' | 'drafts' | 'past'

/** The school lives in Israel; "today" always means Israel's calendar day, not the viewer's. */
export const SCHOOL_TIME_ZONE = 'Asia/Jerusalem'

/** Israel's UTC offset in ms at the given instant (positive: ahead of UTC). */
function israelOffsetMs(at: number): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHOOL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(at))
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const wallAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  )
  return wallAsUtc - Math.floor(at / 1000) * 1000
}

/**
 * Start of "today" in Israel, as a timestamp in ms.
 * Resolves the real instant of Israel's midnight, so it stays correct on the two days a year
 * the clocks change (the offset at midnight can differ from the offset "now").
 */
export function startOfTodayIsrael(now: Date): number {
  const nowMs = now.getTime()
  const wallNow = new Date(nowMs + israelOffsetMs(nowMs))
  const midnightAsUtc = Date.UTC(
    wallNow.getUTCFullYear(),
    wallNow.getUTCMonth(),
    wallNow.getUTCDate()
  )
  let midnight = midnightAsUtc - israelOffsetMs(nowMs)
  midnight = midnightAsUtc - israelOffsetMs(midnight)
  return midnight
}

/**
 * Which admin tab an event belongs to (spec "Event tabs"):
 * - past: it starts before today (Israel), or its status is `completed`, whatever else is true
 * - drafts: status `draft` (and not past)
 * - upcoming: everything else that starts today or later (published / ongoing / cancelled)
 * Cancelled events therefore stay in the tab their date puts them in.
 */
export function classifyEvent(
  event: Pick<Event, 'status' | 'start_datetime'>,
  now: Date
): AdminEventTab {
  const start = new Date(event.start_datetime).getTime()
  if (event.status === 'completed' || start < startOfTodayIsrael(now)) return 'past'
  if (event.status === 'draft') return 'drafts'
  return 'upcoming'
}
