import type { ChatCompletionTool } from 'openai/resources/chat/completions'

// Function calling tools for GPT-5 Mini
export const AI_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_events',
      description: 'יצירת אירוע או מספר אירועים בלוח השנה. תומך באירוע יחיד או רשימה של אירועים.',
      parameters: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            description: 'רשימת האירועים ליצירה. אם יש רק אירוע אחד, שלח מערך עם אלמנט אחד.',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'שם האירוע בעברית (חובה)',
                },
                title_ru: {
                  type: 'string',
                  description: 'שם האירוע ברוסית (אופציונלי)',
                },
                start_datetime: {
                  type: 'string',
                  description: 'תאריך ושעת התחלה בפורמט ISO (YYYY-MM-DDTHH:MM:SS). אם אין שעה, השתמש ב-00:00:00',
                },
                end_datetime: {
                  type: 'string',
                  description: 'תאריך ושעת סיום בפורמט ISO (אופציונלי)',
                },
                description: {
                  type: 'string',
                  description: 'תיאור האירוע בעברית (אופציונלי)',
                },
                description_ru: {
                  type: 'string',
                  description: 'תיאור האירוע ברוסית (אופציונלי)',
                },
                location: {
                  type: 'string',
                  description: 'מיקום האירוע בעברית (אופציונלי)',
                },
                location_ru: {
                  type: 'string',
                  description: 'מיקום האירוע ברוסית (אופציונלי)',
                },
              },
              required: ['title', 'start_datetime'],
            },
          },
        },
        required: ['events'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_urgent_message',
      description: 'יצירת הודעה דחופה להורים (מופיעה בבאנר בדף הבית)',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['white_shirt', 'urgent', 'info', 'warning'],
            description: 'סוג ההודעה: white_shirt (חולצה לבנה), urgent (דחוף), info (מידע), warning (אזהרה)',
          },
          title_he: {
            type: 'string',
            description: 'כותרת ההודעה בעברית (חובה)',
          },
          title_ru: {
            type: 'string',
            description: 'כותרת ההודעה ברוסית (חובה)',
          },
          description_he: {
            type: 'string',
            description: 'תיאור מפורט בעברית (אופציונלי)',
          },
          description_ru: {
            type: 'string',
            description: 'תיאור מפורט ברוסית (אופציונלי)',
          },
          start_date: {
            type: 'string',
            description: 'תאריך התחלת הצגה (YYYY-MM-DD). ברירת מחדל: היום',
          },
          end_date: {
            type: 'string',
            description: 'תאריך סיום הצגה (YYYY-MM-DD). חובה להגדיר!',
          },
          icon: {
            type: 'string',
            description: 'אייקון אימוג׳י (אופציונלי). דוגמאות: 👕, ⚠️, ℹ️, 📢',
          },
          color: {
            type: 'string',
            description: 'צבע רקע CSS class (אופציונלי). דוגמאות: bg-yellow-50, bg-red-50, bg-blue-50',
          },
        },
        required: ['title_he', 'title_ru', 'end_date'],
      },
    },
  },
]

// Helper function to get tool by name
export function getToolByName(name: string): ChatCompletionTool | undefined {
  return AI_TOOLS.find((tool) => tool.type === 'function' && tool.function.name === name)
}

// Type guards for function arguments
export interface CreateEventArgs {
  title: string
  title_ru?: string
  start_datetime: string
  end_datetime?: string
  description?: string
  description_ru?: string
  location?: string
  location_ru?: string
}

export interface CreateEventsArgs {
  events: CreateEventArgs[]
}

export interface CreateUrgentMessageArgs {
  type?: 'white_shirt' | 'urgent' | 'info' | 'warning'
  title_he: string
  title_ru: string
  description_he?: string
  description_ru?: string
  start_date?: string
  end_date: string
  icon?: string
  color?: string
}

// Validation functions
export function validateEventArgs(args: unknown): args is CreateEventArgs {
  const obj = args as CreateEventArgs
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.title === 'string' &&
    obj.title.length > 0 &&
    typeof obj.start_datetime === 'string' &&
    obj.start_datetime.length > 0
  )
}

export function validateEventsArgs(args: unknown): args is CreateEventsArgs {
  const obj = args as CreateEventsArgs
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.events) &&
    obj.events.length > 0 &&
    obj.events.every(validateEventArgs)
  )
}

export function validateUrgentMessageArgs(
  args: unknown
): args is CreateUrgentMessageArgs {
  const obj = args as CreateUrgentMessageArgs
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.title_he === 'string' &&
    obj.title_he.length > 0 &&
    typeof obj.title_ru === 'string' &&
    obj.title_ru.length > 0 &&
    typeof obj.end_date === 'string' &&
    obj.end_date.length > 0
  )
}
