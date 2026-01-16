/**
 * Hebrew event names dictionary for autocomplete
 * Common events for parent committees and school activities
 * Each event type includes an icon identifier for visual display
 */

// Icon identifiers that map to lucide-react icons
export type EventIconType =
  | 'party' // PartyPopper
  | 'graduation' // GraduationCap
  | 'birthday' // Cake
  | 'trip' // Map/Compass
  | 'beach' // Umbrella
  | 'holiday' // Star
  | 'menorah' // Flame (Chanukah)
  | 'purim' // Drama (masks)
  | 'tree' // TreeDeciduous (Tu BiShvat)
  | 'passover' // Wine
  | 'flag' // Flag (Independence)
  | 'candle' // Flame (Memorial)
  | 'bonfire' // Flame (Lag BaOmer)
  | 'meeting' // Users
  | 'sports' // Trophy/Dumbbell
  | 'theater' // Drama
  | 'music' // Music
  | 'art' // Palette
  | 'science' // Flask
  | 'book' // BookOpen
  | 'food' // UtensilsCrossed
  | 'picnic' // Sandwich
  | 'bbq' // Flame
  | 'cake' // Cake
  | 'gift' // Gift
  | 'school' // School
  | 'teacher' // GraduationCap
  | 'shabbat' // CandlestickChart
  | 'fair' // Store
  | 'fundraiser' // HandCoins
  | 'movie' // Film
  | 'carnival' // Ferris wheel/Tent
  | 'talent' // Star
  | 'awards' // Award
  | 'workshop' // Wrench
  | 'volunteer' // Heart
  | 'photo' // Camera
  | 'ceremony' // Award
  | 'welcome' // DoorOpen
  | 'farewell' // DoorClosed
  | 'surprise' // Sparkles
  | 'general' // Calendar

export interface EventTypeConfig {
  name: string
  icon: EventIconType
  category: keyof typeof EVENT_CATEGORIES
}

export const EVENT_CATEGORIES = {
  // School celebrations - חגיגות בית ספר
  celebrations: [
    { name: 'מסיבת סוף שנה', icon: 'party' },
    { name: 'מסיבת כיתה', icon: 'party' },
    { name: 'מסיבת יום הולדת', icon: 'birthday' },
    { name: 'מסיבת סיום', icon: 'graduation' },
    { name: 'מסיבת פרידה', icon: 'farewell' },
    { name: 'מסיבת קבלת פנים', icon: 'welcome' },
    { name: 'מסיבת הפתעה', icon: 'surprise' },
    { name: 'חגיגת יום הולדת', icon: 'birthday' },
    { name: 'מסיבת גן', icon: 'party' },
    { name: 'מסיבת כיתה א׳', icon: 'party' },
    { name: 'מסיבת סיום גן', icon: 'graduation' },
    { name: 'מסיבת סיום כיתה ו׳', icon: 'graduation' },
    { name: 'מסיבת סיום כיתה ח׳', icon: 'graduation' },
    { name: 'מסיבת סיום כיתה י״ב', icon: 'graduation' },
  ],

  // Trips and outings - טיולים
  trips: [
    { name: 'טיול שנתי', icon: 'trip' },
    { name: 'טיול כיתתי', icon: 'trip' },
    { name: 'טיול משפחות', icon: 'trip' },
    { name: 'טיול סוף שנה', icon: 'trip' },
    { name: 'טיול לפארק', icon: 'trip' },
    { name: 'טיול לים', icon: 'beach' },
    { name: 'טיול לצפון', icon: 'trip' },
    { name: 'טיול לדרום', icon: 'trip' },
    { name: 'יום כיף', icon: 'party' },
    { name: 'יום גיבוש', icon: 'party' },
    { name: 'פעילות שטח', icon: 'trip' },
    { name: 'טיול לחו״ל', icon: 'trip' },
    { name: 'טיול לאילת', icon: 'beach' },
    { name: 'טיול לכנרת', icon: 'beach' },
    { name: 'טיול לירושלים', icon: 'trip' },
    { name: 'טיול למוזיאון', icon: 'school' },
    { name: 'טיול לגן חיות', icon: 'trip' },
    { name: 'טיול ללונה פארק', icon: 'carnival' },
    { name: 'טיול לפארק מים', icon: 'beach' },
  ],

  // Holidays - חגים
  holidays: [
    { name: 'מסיבת חנוכה', icon: 'menorah' },
    { name: 'מסיבת פורים', icon: 'purim' },
    { name: 'מסיבת ט״ו בשבט', icon: 'tree' },
    { name: 'חגיגת חג', icon: 'holiday' },
    { name: 'ערב חג', icon: 'holiday' },
    { name: 'סדר פסח', icon: 'passover' },
    { name: 'ערב ראש השנה', icon: 'holiday' },
    { name: 'סוכות', icon: 'holiday' },
    { name: 'שמחת תורה', icon: 'book' },
    { name: 'יום העצמאות', icon: 'flag' },
    { name: 'יום הזיכרון', icon: 'candle' },
    { name: 'יום ירושלים', icon: 'flag' },
    { name: 'ל״ג בעומר', icon: 'bonfire' },
    { name: 'שבועות', icon: 'holiday' },
    { name: 'ערב פסח', icon: 'passover' },
    { name: 'ערב סוכות', icon: 'holiday' },
    { name: 'חגיגת חנוכה', icon: 'menorah' },
    { name: 'חגיגת פורים', icon: 'purim' },
    { name: 'מסיבת ראש השנה', icon: 'holiday' },
    { name: 'הדלקת נרות חנוכה', icon: 'menorah' },
    { name: 'קריאת מגילה', icon: 'purim' },
    { name: 'מדורת ל״ג בעומר', icon: 'bonfire' },
  ],

  // Meetings - פגישות
  meetings: [
    { name: 'אסיפת הורים', icon: 'meeting' },
    { name: 'ישיבת ועד', icon: 'meeting' },
    { name: 'פגישת הורים', icon: 'meeting' },
    { name: 'פגישת מחנכת', icon: 'meeting' },
    { name: 'שיחת הורים', icon: 'meeting' },
    { name: 'יום הורים', icon: 'meeting' },
    { name: 'ערב הורים', icon: 'meeting' },
    { name: 'פגישת ועד הורים', icon: 'meeting' },
    { name: 'אסיפה כללית', icon: 'meeting' },
    { name: 'ישיבת תכנון', icon: 'meeting' },
  ],

  // Sports & Activities - ספורט ופעילויות
  activities: [
    { name: 'פעילות חברתית', icon: 'party' },
    { name: 'פעילות יצירה', icon: 'art' },
    { name: 'פעילות ספורט', icon: 'sports' },
    { name: 'יום ספורט', icon: 'sports' },
    { name: 'תחרות כיתתית', icon: 'sports' },
    { name: 'הצגה', icon: 'theater' },
    { name: 'מופע סוף שנה', icon: 'theater' },
    { name: 'טקס סיום', icon: 'ceremony' },
    { name: 'יריד', icon: 'fair' },
    { name: 'בזאר', icon: 'fair' },
    { name: 'מכירת עוגות', icon: 'cake' },
    { name: 'מופע כישרונות', icon: 'talent' },
    { name: 'ערב הופעות', icon: 'music' },
    { name: 'קונצרט', icon: 'music' },
    { name: 'תערוכת אמנות', icon: 'art' },
    { name: 'סדנת יצירה', icon: 'workshop' },
    { name: 'סדנת בישול', icon: 'food' },
    { name: 'ערב סרטים', icon: 'movie' },
    { name: 'ערב משחקים', icon: 'party' },
    { name: 'קרנבל', icon: 'carnival' },
    { name: 'יום שיא', icon: 'awards' },
    { name: 'טורניר ספורט', icon: 'sports' },
    { name: 'משחק כדורגל', icon: 'sports' },
    { name: 'משחק כדורסל', icon: 'sports' },
    { name: 'אולימפיאדה', icon: 'sports' },
    { name: 'יום ריצה', icon: 'sports' },
    { name: 'מרוץ צבעים', icon: 'sports' },
  ],

  // Food events - אירועי אוכל
  food: [
    { name: 'ארוחת בוקר', icon: 'food' },
    { name: 'ארוחת צהריים', icon: 'food' },
    { name: 'ארוחת ערב', icon: 'food' },
    { name: 'פיקניק', icon: 'picnic' },
    { name: 'מנגל', icon: 'bbq' },
    { name: 'ברביקיו', icon: 'bbq' },
    { name: 'קייטרינג', icon: 'food' },
    { name: 'כיבוד קל', icon: 'food' },
    { name: 'שולחן מתוק', icon: 'cake' },
    { name: 'ארוחה משותפת', icon: 'food' },
    { name: 'מסיבת פיצה', icon: 'food' },
    { name: 'מסיבת גלידה', icon: 'food' },
    { name: 'ערב סושי', icon: 'food' },
    { name: 'בראנץ׳', icon: 'food' },
    { name: 'שבת יחד', icon: 'shabbat' },
  ],

  // School events - אירועי בית ספר
  school: [
    { name: 'יום פתוח', icon: 'school' },
    { name: 'יום מיוחד', icon: 'school' },
    { name: 'שבוע הספר', icon: 'book' },
    { name: 'שבוע העברית', icon: 'book' },
    { name: 'שבוע המדע', icon: 'science' },
    { name: 'יום המורה', icon: 'teacher' },
    { name: 'יום החינוך', icon: 'school' },
    { name: 'קבלת שבת', icon: 'shabbat' },
    { name: 'טקס פתיחת שנה', icon: 'ceremony' },
    { name: 'טקס חלוקת תעודות', icon: 'awards' },
    { name: 'טקס הענקת פרסים', icon: 'awards' },
    { name: 'יריד מדע', icon: 'science' },
    { name: 'תערוכת מדע', icon: 'science' },
    { name: 'יום התנדבות', icon: 'volunteer' },
    { name: 'יום צילום', icon: 'photo' },
    { name: 'צילום כיתתי', icon: 'photo' },
    { name: 'יום מעשים טובים', icon: 'volunteer' },
    { name: 'יום משפחה', icon: 'meeting' },
    { name: 'יום ספרות', icon: 'book' },
    { name: 'יום מתמטיקה', icon: 'science' },
    { name: 'יום אנגלית', icon: 'book' },
  ],

  // Fundraising - גיוס כספים
  fundraising: [
    { name: 'מכירה פומבית', icon: 'fundraiser' },
    { name: 'הגרלה', icon: 'gift' },
    { name: 'לוטו', icon: 'gift' },
    { name: 'מכירת פרחים', icon: 'gift' },
    { name: 'מכירת מתנות', icon: 'gift' },
    { name: 'ערב גיוס', icon: 'fundraiser' },
    { name: 'מכירת ספרים', icon: 'book' },
    { name: 'יריד יד שניה', icon: 'fair' },
    { name: 'מכירת בגדים', icon: 'fair' },
    { name: 'ערב טריוויה', icon: 'party' },
  ],
} as const

// Type for event with icon
export interface EventWithIcon {
  name: string
  icon: EventIconType
}

// Flattened list for search (unique items only)
export const ALL_EVENT_NAMES: string[] = [
  ...new Set(
    Object.values(EVENT_CATEGORIES)
      .flat()
      .map((event) => event.name)
  ),
]

// Map event name to its icon
export const EVENT_ICON_MAP: Record<string, EventIconType> = Object.values(
  EVENT_CATEGORIES
)
  .flat()
  .reduce(
    (acc, event) => {
      acc[event.name] = event.icon
      return acc
    },
    {} as Record<string, EventIconType>
  )

// Get icon for an event name (with fallback)
export function getEventIcon(eventName: string): EventIconType {
  return EVENT_ICON_MAP[eventName] || 'general'
}

// Quick suggestions for initial display (most common events)
// Show a diverse set of event types with their icons
export const QUICK_EVENT_SUGGESTIONS: EventWithIcon[] = [
  { name: 'מסיבת סוף שנה', icon: 'party' },
  { name: 'טיול שנתי', icon: 'trip' },
  { name: 'מסיבת כיתה', icon: 'party' },
  { name: 'חגיגת חג', icon: 'holiday' },
  { name: 'מסיבת יום הולדת', icon: 'birthday' },
  { name: 'יום ספורט', icon: 'sports' },
]
