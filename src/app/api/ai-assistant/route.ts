import { NextRequest, NextResponse } from 'next/server'
import { openai, AI_CONFIG, SYSTEM_PROMPT } from '@/lib/ai/openai'
import {
  AI_TOOLS,
  validateEventsArgs,
  validateUrgentMessageArgs,
} from '@/lib/ai/tools'
import { logAICost } from '@/lib/ai/cost-tracker'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Types for request/response
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIAssistantRequest {
  messages: ChatMessage[]
  action?: 'initial' | 'select_type' | 'extract_data'
}

export async function POST(req: NextRequest) {
  try {
    const body: AIAssistantRequest = await req.json()
    const { messages, action = 'extract_data' } = body

    // Handle initial greeting
    if (action === 'initial') {
      return NextResponse.json({
        success: true,
        message: `שלום! 👋

מה תרצה להוסיף למערכת?

1️⃣ **אירוע** - אירוע בלוח השנה של בית הספר
2️⃣ **הודעה דחופה** - הודעה שתוצג בבאנר בדף הבית

בחר אפשרות ואסביר לך מה צריך למלא.`,
      })
    }

    // Handle type selection
    if (action === 'select_type') {
      const lastMessage = messages[messages.length - 1]
      const userInput = lastMessage.content.toLowerCase()

      if (userInput.includes('אירוע') || userInput === '1') {
        return NextResponse.json({
          success: true,
          message: `מעולה! בוא ניצור אירוע חדש 📅

**תאר את האירוע במשפט אחד**, כולל:
• שם האירוע
• תאריך (לדוגמה: 15 במרץ או 15/03/2025)
• שעה (לדוגמה: 17:00 או 5 אחה״צ) - אופציונלי
• מיקום - אופציונלי

**דוגמה:**
"מסיבת פורים ב-15/03/2025 בשעה 17:00 בגן הילדים"

או:
"מסיבת פורים ב15 במרץ"

💡 **אפשר גם מספר אירועים!**
"מסיבת פורים ב15 במרץ וגם מסיבת סיום ב30 ביוני"`,
        })
      } else if (
        userInput.includes('הודעה') ||
        userInput.includes('דחוף') ||
        userInput === '2'
      ) {
        return NextResponse.json({
          success: true,
          message: `מעולה! בוא ניצור הודעה דחופה 📢

**תאר את ההודעה**, כולל:
• תוכן ההודעה (בעברית)
• תאריך סיום - **חובה!** (עד מתי להציג)
• סוג ההודעה (דחוף/מידע/אזהרה/חולצה לבנה) - אופציונלי

**דוגמאות:**
"תזכורת חולצה לבנה למחר עד תאריך 20/03/2025"

"אירוע דחוף: ביטול לימודים מחר בגלל מזג אוויר, עד 18/03"

"חג חנוכה שמח! 🕎 תראה הודעה זו למשך 5 ימים"

**💡 טיפ:** אפשר להשתמש בתאריכים יחסיים:
• "5 ימים", "שבוע", "עד סוף החודש"`,
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'לא הבנתי את הבחירה שלך 😕\n\nאנא בחר:\n1️⃣ אירוע\n2️⃣ הודעה דחופה',
        })
      }
    }

    // Handle data extraction with function calling
    if (action === 'extract_data') {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        max_completion_tokens: AI_CONFIG.max_completion_tokens,
        // Note: temperature is not included - GPT-5 Mini only supports default value (1)
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        tools: AI_TOOLS,
        // Use 'required' to force function calling when user provides event/message data
        tool_choice: 'required',
      })

      const assistantMessage = response.choices[0].message

      // Log cost for analytics
      logAICost(response.usage, 'extract_data', messages[messages.length - 1]?.content)

      // Check if AI wants to call a function
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolCall = assistantMessage.tool_calls[0]
        if (toolCall.type === 'function') {
          const functionName = toolCall.function.name
          const functionArgs = JSON.parse(toolCall.function.arguments)

          console.log('[AI Assistant] Function call detected:', {
            functionName,
            args: functionArgs,
          })

          // Validate and return extracted data
          if (functionName === 'create_events' && validateEventsArgs(functionArgs)) {
            return NextResponse.json({
              success: true,
              needsConfirmation: true,
              extractedData: {
                type: 'events',
                data: functionArgs.events,
              },
            })
          } else if (
          functionName === 'create_urgent_message' &&
          validateUrgentMessageArgs(functionArgs)
        ) {
          return NextResponse.json({
            success: true,
            needsConfirmation: true,
            extractedData: {
              type: 'urgent_message',
              data: functionArgs,
            },
          })
          } else {
            console.error('[AI Assistant] Validation failed:', {
              functionName,
              args: functionArgs,
              eventsValid: functionName === 'create_events' ? validateEventsArgs(functionArgs) : 'N/A',
              urgentValid: functionName === 'create_urgent_message' ? validateUrgentMessageArgs(functionArgs) : 'N/A',
            })
            return NextResponse.json({
              success: false,
              error: 'AI extracted invalid data. Please try again.',
            })
          }
        }
      }

      // AI responded with text (no function call)
      console.warn('[AI Assistant] No function call - AI responded with text:', {
        content: assistantMessage.content,
        userMessage: messages[messages.length - 1]?.content,
        finishReason: response.choices[0].finish_reason,
      })

      return NextResponse.json({
        success: true,
        message: assistantMessage.content || 'לא הבנתי. אנא נסה שוב.',
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    })
  } catch (error) {
    console.error('[AI Assistant] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
