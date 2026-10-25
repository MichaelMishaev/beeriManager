// Kiss & Ride (נשק וסע) — which class is on drop-off duty, and when. School year 2026-27.
// Source: the list sent by the class committees. Dates are ISO (YYYY-MM-DD), inclusive.

export type KissRideGrade = 'א' | 'ב' | 'ג' | 'ד' | 'ה' | 'ו'

export interface KissRideClass {
  grade: KissRideGrade
  num: number
}

export interface KissRideShift {
  classes: KissRideClass[]
  start: string
  end: string
}

export const KISS_RIDE_GRADES: KissRideGrade[] = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']

const c = (grade: KissRideGrade, num: number): KissRideClass => ({ grade, num })

// Sorted by start date. Two shifts cover two classes at once (ד3+ג3, ב3+א3).
export const kissRideShifts: KissRideShift[] = [
  { classes: [c('ו', 1)], start: '2026-10-04', end: '2026-10-16' },
  { classes: [c('ו', 2)], start: '2026-10-18', end: '2026-10-30' },
  { classes: [c('ו', 3)], start: '2026-11-01', end: '2026-11-13' },
  { classes: [c('ה', 1)], start: '2026-11-15', end: '2026-11-27' },
  { classes: [c('ד', 3), c('ג', 3)], start: '2026-11-29', end: '2026-12-04' },
  { classes: [c('ה', 2)], start: '2026-12-13', end: '2026-12-25' },
  { classes: [c('ה', 3)], start: '2026-12-27', end: '2027-01-08' },
  { classes: [c('ד', 1)], start: '2027-01-10', end: '2027-01-22' },
  { classes: [c('ד', 2)], start: '2027-01-24', end: '2027-02-05' },
  { classes: [c('ד', 4)], start: '2027-02-07', end: '2027-02-19' },
  { classes: [c('ג', 1)], start: '2027-02-21', end: '2027-03-05' },
  { classes: [c('ג', 2)], start: '2027-03-07', end: '2027-03-19' },
  { classes: [c('א', 2)], start: '2027-03-21', end: '2027-03-26' },
  { classes: [c('ג', 4)], start: '2027-03-28', end: '2027-04-12' },
  { classes: [c('ב', 1)], start: '2027-05-02', end: '2027-05-14' },
  { classes: [c('ב', 2)], start: '2027-05-16', end: '2027-05-28' },
  { classes: [c('ב', 3), c('א', 3)], start: '2027-05-30', end: '2027-06-04' },
  { classes: [c('ב', 4)], start: '2027-06-06', end: '2027-06-18' },
  { classes: [c('א', 1)], start: '2027-06-20', end: '2027-06-25' },
  { classes: [c('א', 4)], start: '2027-06-27', end: '2027-06-30' },
]

export const classKey = (cls: KissRideClass) => `${cls.grade}${cls.num}`

/** Inverse of classKey ("ו1" → { grade: 'ו', num: 1 }); undefined if it isn't a class on the schedule. */
export function parseClassKey(value: string | null | undefined): KissRideClass | undefined {
  const match = value ? /^([אבגדהו])(\d)$/.exec(value) : null
  if (!match) return undefined
  const cls = { grade: match[1] as KissRideGrade, num: Number(match[2]) }
  return getShiftForClass(cls) ? cls : undefined
}

export function getShiftForClass(cls: KissRideClass): KissRideShift | undefined {
  return kissRideShifts.find((s) => s.classes.some((x) => classKey(x) === classKey(cls)))
}

/** Class numbers that have a shift, for a grade (drives the second row of chips). */
export function getClassNumbers(grade: KissRideGrade): number[] {
  const nums = new Set<number>()
  for (const s of kissRideShifts) for (const x of s.classes) if (x.grade === grade) nums.add(x.num)
  return [...nums].sort((a, b) => a - b)
}

export type ShiftStatus = 'past' | 'now' | 'upcoming'

/** `today` is an ISO date; ISO strings compare correctly as plain strings. */
export function getShiftStatus(shift: KissRideShift, today: string): ShiftStatus {
  if (today > shift.end) return 'past'
  if (today >= shift.start) return 'now'
  return 'upcoming'
}

/** The shift on duty on `today` (ISO), or undefined in a gap, before the first or after the last shift. */
export function getCurrentShift(today: string): KissRideShift | undefined {
  return kissRideShifts.find((s) => getShiftStatus(s, today) === 'now')
}

/** The first shift that starts after `today` (ISO), or undefined when none is left this school year. */
export function getNextShift(today: string): KissRideShift | undefined {
  return kissRideShifts.find((s) => s.start > today)
}

/** Whole calendar days from ISO date `from` to ISO date `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

/** Today's date in Israel (the schedule is local), as YYYY-MM-DD. */
export function todayInIsrael(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(now)
}
