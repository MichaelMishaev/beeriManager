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
  {
    type: 'function',
    function: {
      name: 'create_highlight',
      description: 'יצירת הדגשת הישג/אירוע/פרס לקרוסלת דף הבית. הדגשות מוצגות בצורה בולטת עם אייקונים, תגיות צבעוניות וטקסט מפורט.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['achievement', 'sports', 'award', 'event', 'announcement'],
            description: 'סוג ההדגשה: achievement (הישג), sports (ספורט), award (פרס), event (אירוע), announcement (הודעה)',
          },
          icon: {
            type: 'string',
            description: `אייקון אימוג׳י רלוונטי לנושא ההדגשה (חובה). בחר אייקון חכם לפי המילות המפתח:

🏀 כדורסל: 🏀
⚽ כדורגל: ⚽
🏐 כדורעף: 🏐
🎾 טניס: 🎾
🏊 שחייה: 🏊
🏃 ריצה/אתלטיקה: 🏃
🤸 התעמלות: 🤸
🥋 ג'ודו/קרב מגע: 🥋
🎯 חץ וקשת: 🎯
🏆 זכייה/גביע כללי: 🏆
🥇 מקום ראשון: 🥇
🥈 מקום שני: 🥈
🥉 מקום שלישי: 🥉
🎖️ מדליה/פרס: 🎖️
⭐ הצטיינות: ⭐
🎓 לימודים/חינוך: 🎓
📚 ספרים/קריאה: 📚
🎨 אמנות/יצירה: 🎨
🎭 תיאטרון: 🎭
🎵 מוזיקה: 🎵
🎉 חגיגה/מסיבה: 🎉
🎊 קונפטי: 🎊
🎈 בלון: 🎈
📢 הודעה: 📢
💪 כוח/מאמץ: 💪
🔥 מרגש/חזק: 🔥`,
          },
          title_he: {
            type: 'string',
            description: 'כותרת ההדגשה בעברית (חובה) - תמציתית ומושכת, עד 50 תווים. דוגמה: "מקום ראשון באליפות המחוז"',
          },
          title_ru: {
            type: 'string',
            description: 'כותרת ההדגשה ברוסית (תרגם מהעברית). דוגמה: "Первое место в областном чемпионате"',
          },
          description_he: {
            type: 'string',
            description: 'תיאור מפורט בעברית (חובה) - לפחות 10 תווים, עד 300 תווים. כלול פרטים על ההישג/אירוע.',
          },
          description_ru: {
            type: 'string',
            description: 'תיאור מפורט ברוסית (תרגם מהעברית)',
          },
          category_he: {
            type: 'string',
            description: `קטגוריה בעברית (חובה). חלץ מהנושא או השתמש בברירת מחדל לפי הסוג:
- אם יש נושא ספציפי (כדורסל, שחייה, אמנות) - השתמש בו
- אחרת השתמש בברירות מחדל: הישגים, ספורט, פרסים, אירועים, הודעות`,
          },
          category_ru: {
            type: 'string',
            description: 'קטגוריה ברוסית (תרגם מהעברית)',
          },
          event_date: {
            type: 'string',
            description: 'תאריך שבו קרה ההישג/אירוע (YYYY-MM-DD). אם המשתמש לא ציין תאריך - שאל אותו!',
          },
          start_date: {
            type: 'string',
            description: 'תאריך התחלת הצגה בקרוסלה (YYYY-MM-DD). אם לא צוין - השאר ריק (יוצג מיד)',
          },
          end_date: {
            type: 'string',
            description: 'תאריך סיום הצגה בקרוסלה (YYYY-MM-DD). אם לא צוין - שאל את המשתמש "עד מתי להציג?"',
          },
          cta_text_he: {
            type: 'string',
            description: 'טקסט כפתור קריאה לפעולה בעברית (אופציונלי). דוגמה: "קרא עוד", "צפה בתמונות"',
          },
          cta_text_ru: {
            type: 'string',
            description: 'טקסט כפתור ברוסית (תרגם מהעברית). דוגמה: "Читать далее"',
          },
          cta_link: {
            type: 'string',
            description: 'קישור URL לכפתור (אופציונלי). דוגמה: https://example.com/article',
          },
          image_url: {
            type: 'string',
            description: 'קישור URL לתמונה (אופציונלי). רק אם המשתמש סיפק קישור לתמונה.',
          },
          badge_color: {
            type: 'string',
            description: `צבע תגית Tailwind CSS (אופציונלי). בחר לפי נושא ההדגשה:
- הישגים כלליים: bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900
- ספורט ירוק: bg-gradient-to-r from-green-400 to-green-500 text-green-900
- כדורסל: bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900
- פרסים: bg-gradient-to-r from-purple-400 to-purple-500 text-purple-900
- אירועים: bg-gradient-to-r from-pink-400 to-pink-500 text-pink-900
- מידע: bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900
- דחוף: bg-gradient-to-r from-red-400 to-red-500 text-red-900
אם לא בטוח - השתמש בצהב לפי סוג ההדגשה`,
          },
        },
        required: ['type', 'icon', 'title_he', 'description_he', 'category_he'],
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

export interface CreateHighlightArgs {
  type: 'achievement' | 'sports' | 'award' | 'event' | 'announcement'
  icon: string
  title_he: string
  title_ru?: string
  description_he: string
  description_ru?: string
  category_he: string
  category_ru?: string
  event_date?: string
  start_date?: string
  end_date?: string
  cta_text_he?: string
  cta_text_ru?: string
  cta_link?: string
  image_url?: string
  badge_color?: string
}

export function validateHighlightArgs(
  args: unknown
): args is CreateHighlightArgs {
  const obj = args as CreateHighlightArgs
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.type === 'string' &&
    ['achievement', 'sports', 'award', 'event', 'announcement'].includes(obj.type) &&
    typeof obj.icon === 'string' &&
    obj.icon.length > 0 &&
    typeof obj.title_he === 'string' &&
    obj.title_he.length >= 2 &&
    typeof obj.description_he === 'string' &&
    obj.description_he.length >= 10 &&
    typeof obj.category_he === 'string' &&
    obj.category_he.length >= 2
  )
}
