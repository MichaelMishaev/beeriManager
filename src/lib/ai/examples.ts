// Examples database for AI assistant
// Provides clickable examples to help users when they struggle

export interface Example {
  text: string // Example text in Hebrew
  category: 'event' | 'urgent_message' // Type of example
  description?: string // Optional description
}

export const EXAMPLES = {
  events: [
    {
      text: 'מסיבת פורים ב-15/03/2025 בשעה 17:00 באולם בית הספר',
      category: 'event' as const,
      description: 'אירוע עם תאריך, שעה ומיקום',
    },
    {
      text: 'מבחן מתמטיקה ביום רביעי בשעה 10:00',
      category: 'event' as const,
      description: 'אירוע עם יום ושעה',
    },
    {
      text: 'יום הורים ב-20/04/2025 בשעה 16:00 בכיתה',
      category: 'event' as const,
      description: 'אירוע עם תאריך, שעה ומיקום',
    },
    {
      text: 'טיול שנתי ב-5 ביוני עד סוף היום',
      category: 'event' as const,
      description: 'אירוע עם תאריך בפורמט טקסטואלי',
    },
    {
      text: 'חופשת פסח מ-15/04/2025 עד 25/04/2025',
      category: 'event' as const,
      description: 'אירוע עם טווח תאריכים',
    },
    {
      text: 'פגישת הורים ומורים ב-12/02/2025 בין 16:00 ל-19:00 באולם',
      category: 'event' as const,
      description: 'אירוע עם טווח שעות',
    },
  ],
  urgent_messages: [
    {
      text: 'תזכורת חולצה לבנה למחר עד 20/03/2025',
      category: 'urgent_message' as const,
      description: 'הודעה דחופה עם תאריך סיום',
    },
    {
      text: 'ביטול לימודים מחר בגלל מזג אוויר עד 18/03/2025',
      category: 'urgent_message' as const,
      description: 'הודעה דחופה עם סיבה',
    },
    {
      text: 'חג חנוכה שמח למשך שבוע',
      category: 'urgent_message' as const,
      description: 'הודעה עם משך זמן יחסי',
    },
    {
      text: 'שינוי שעת פיזור היום - 13:00 במקום 14:00 עד סוף השבוע',
      category: 'urgent_message' as const,
      description: 'הודעה דחופה עם שינוי',
    },
    {
      text: 'הודעה חשובה: איסוף ילדים מהכניסה האחורית עד 25/03',
      category: 'urgent_message' as const,
      description: 'הודעה עם הנחיה',
    },
  ],
}

/**
 * Get relevant examples based on type and count
 * @param type - Type of content (event or urgent_message)
 * @param count - Number of examples to return (default: 3)
 */
export function getRelevantExamples(
  type: 'event' | 'urgent_message',
  count: number = 3
): Example[] {
  const key = type === 'event' ? 'events' : 'urgent_messages'
  return EXAMPLES[key].slice(0, count)
}

/**
 * Get all examples for a type
 */
export function getAllExamples(type: 'event' | 'urgent_message'): Example[] {
  const key = type === 'event' ? 'events' : 'urgent_messages'
  return EXAMPLES[key]
}

/**
 * Get examples based on what the user is trying to do
 * Analyzes chat phase to determine which examples to show
 */
export function getContextualExamples(
  chatPhase: string,
  userInput?: string
): Example[] {
  // During type selection - show mix of both
  if (chatPhase === 'type_selection') {
    return [...EXAMPLES.events.slice(0, 2), ...EXAMPLES.urgent_messages.slice(0, 2)]
  }

  // If user input contains urgent/message keywords
  if (userInput) {
    const hasUrgentWords = /הודעה|דחוף|תזכורת|ביטול|שינוי/.test(userInput)
    if (hasUrgentWords) {
      return EXAMPLES.urgent_messages.slice(0, 3)
    }
  }

  // Default to event examples (most common)
  return EXAMPLES.events.slice(0, 3)
}
