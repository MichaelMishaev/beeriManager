// UI Components Export
export { MobileCalendar, EVENT_CONFIG } from './MobileCalendar'
export type { CalendarEvent } from './MobileCalendar'

// Helper functions for calendar components
export const createSampleEvents = () => {
  const today = new Date()
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  return [
    {
      id: '1',
      title: 'ישיבת ועד הורים',
      date: addDays(today, 2),
      type: 'meeting' as const,
      time: '19:00',
      location: 'אודיטוריום',
      description: 'דיון על תקציב השנה והפעילויות הקרובות'
    },
    {
      id: '2',
      title: 'טיול כיתה א׳',
      date: addDays(today, 5),
      type: 'trip' as const,
      time: '08:00',
      location: 'פארק הירקון',
      description: 'טיול למשפחות עם פעילויות חוץ'
    },
    {
      id: '3',
      title: 'מכירת עוגות',
      date: addDays(today, 7),
      type: 'fundraising' as const,
      time: '15:30',
      location: 'חצר בית הספר',
      description: 'גיוס כספים למעבדת מחשבים חדשה'
    },
    {
      id: '4',
      title: 'חג הפורים',
      date: addDays(today, 12),
      type: 'holiday' as const,
      time: '10:00',
      location: 'בית הספר',
      description: 'מסיבת תחפושות וחלוקת משלוח מנות'
    },
    {
      id: '5',
      title: 'התנדבות ספרייה',
      date: addDays(today, 3),
      type: 'volunteer' as const,
      time: '16:00',
      location: 'ספרית בית הספר',
      description: 'עזרה בקטלוג ספרים חדשים'
    },
    {
      id: '6',
      title: 'הרצאה לחינוך',
      date: addDays(today, 10),
      type: 'event' as const,
      time: '20:00',
      location: 'כיתה 12',
      description: 'הרצאה על חינוך ילדים בעידן הדיגיטל'
    }
  ]
}