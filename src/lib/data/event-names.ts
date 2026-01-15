/**
 * Hebrew event names dictionary for autocomplete
 * Common events for parent committees and school activities
 */

export const EVENT_CATEGORIES = {
  // School celebrations - חגיגות בית ספר
  celebrations: [
    'מסיבת סוף שנה',
    'מסיבת כיתה',
    'מסיבת חנוכה',
    'מסיבת פורים',
    'מסיבת ט״ו בשבט',
    'מסיבת יום הולדת',
    'מסיבת סיום',
    'מסיבת פרידה',
    'מסיבת קבלת פנים',
    'מסיבת הפתעה',
  ],

  // Trips and outings - טיולים
  trips: [
    'טיול שנתי',
    'טיול כיתתי',
    'טיול משפחות',
    'טיול סוף שנה',
    'טיול לפארק',
    'טיול לים',
    'טיול לצפון',
    'טיול לדרום',
    'יום כיף',
    'יום גיבוש',
    'פעילות שטח',
  ],

  // Holidays - חגים
  holidays: [
    'חגיגת חג',
    'ערב חג',
    'סדר פסח',
    'ערב ראש השנה',
    'סוכות',
    'שמחת תורה',
    'יום העצמאות',
    'יום הזיכרון',
    'יום ירושלים',
    'ל״ג בעומר',
    'שבועות',
  ],

  // Meetings - פגישות
  meetings: [
    'אסיפת הורים',
    'ישיבת ועד',
    'פגישת הורים',
    'פגישת מחנכת',
    'שיחת הורים',
    'יום הורים',
    'ערב הורים',
  ],

  // Activities - פעילויות
  activities: [
    'פעילות חברתית',
    'פעילות יצירה',
    'פעילות ספורט',
    'יום ספורט',
    'תחרות כיתתית',
    'הצגה',
    'מופע סוף שנה',
    'טקס סיום',
    'יריד',
    'בזאר',
    'מכירת עוגות',
  ],

  // Food events - אירועי אוכל
  food: [
    'ארוחת בוקר',
    'ארוחת צהריים',
    'ארוחת ערב',
    'פיקניק',
    'מנגל',
    'ברביקיו',
    'קייטרינג',
    'כיבוד קל',
    'שולחן מתוק',
  ],

  // School events - אירועי בית ספר
  school: [
    'יום פתוח',
    'יום שיא',
    'יום מיוחד',
    'שבוע הספר',
    'שבוע העברית',
    'שבוע המדע',
    'יום המורה',
    'יום החינוך',
    'קבלת שבת',
  ],
} as const

// Flattened list for search (unique items only)
export const ALL_EVENT_NAMES: string[] = [
  ...new Set(Object.values(EVENT_CATEGORIES).flat())
]

// Quick suggestions for initial display (most common events)
export const QUICK_EVENT_SUGGESTIONS = [
  'מסיבת סוף שנה',
  'טיול שנתי',
  'מסיבת כיתה',
  'חגיגת חג',
] as const
