import { NextRequest, NextResponse } from 'next/server'
import {
  openai,
  AI_CONFIG,
  UNDERSTANDING_PROMPT,
  getExtractionPrompt,
} from '@/lib/ai/openai'
import {
  AI_TOOLS,
  validateEventsArgs,
  validateUrgentMessageArgs,
  validateHighlightArgs,
} from '@/lib/ai/tools'
import { logAICost } from '@/lib/ai/cost-tracker'
import { incrementAiUsage, validateMessageLength } from '@/lib/ai/rate-limiter'
import { aiLogger } from '@/lib/ai/logger'

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
  action?: 'initial' | 'select_type' | 'extract_data' | 'understand_message'
  context?: string // Optional context from understanding round
}

export async function POST(req: NextRequest) {
  try {
    const body: AIAssistantRequest = await req.json()
    const { messages, action = 'extract_data', context } = body

    // Handle initial greeting (no rate limit check - doesn't use GPT)
    if (action === 'initial') {
      aiLogger.logInitial()
      return NextResponse.json({
        success: true,
        message: `שלום! 👋

מה תרצה להוסיף למערכת?

1️⃣ **אירוע** - אירוע בלוח השנה של בית הספר
2️⃣ **הודעה דחופה** - הודעה שתוצג בבאנר בדף הבית
3️⃣ **הדגשה** - הישג/פרס/אירוע מיוחד לקרוסלת דף הבית

בחר אפשרות ואסביר לך מה צריך למלא.

💡 מגבלה יומית: 20 שימושים ביום | מקסימום 1500 תווים להודעה`,
      })
    }

    // Check rate limit for all GPT requests
    const rateLimitResult = await incrementAiUsage()

    // Log rate limit check
    aiLogger.logRateLimit({
      usageCount: rateLimitResult.stats.currentCount,
      dailyLimit: rateLimitResult.stats.dailyLimit,
      rateLimitReached: rateLimitResult.stats.limitReached,
    })

    if (!rateLimitResult.success || rateLimitResult.stats.limitReached) {
      console.warn('[AI Assistant] Rate limit reached:', rateLimitResult.stats)
      return NextResponse.json({
        success: false,
        error: `הגעת למגבלה היומית של 20 שימושים 😔

נסה שוב מחר או צור קשר עם המנהל.

שימושים היום: ${rateLimitResult.stats.currentCount}/${rateLimitResult.stats.dailyLimit}`,
        rateLimitReached: true,
        stats: rateLimitResult.stats,
      })
    }

    // Validate message length (400 chars max)
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    const lengthValidation = validateMessageLength(lastUserMessage)

    if (!lengthValidation.valid) {
      return NextResponse.json({
        success: false,
        error: `ההודעה ארוכה מדי 📏

מקסימום: ${lengthValidation.maxLength} תווים
ההודעה שלך: ${lengthValidation.length} תווים

נסה לקצר את ההודעה.`,
        messageTooLong: true,
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
      } else if (
        userInput.includes('הדגשה') ||
        userInput.includes('הישג') ||
        userInput.includes('פרס') ||
        userInput === '3'
      ) {
        return NextResponse.json({
          success: true,
          message: `מעולה! בוא ניצור הדגשה מיוחדת ✨

**תאר את ההדגשה**, כולל:
• **נושא וסוג:** הישג/ספורט/פרס/אירוע/הודעה
• **כותרת קצרה:** מה קרה? (למשל: "מקום ראשון באליפות")
• **תיאור מפורט:** פרטים נוספים על ההישג/אירוע
• **תאריך:** מתי זה קרה? (אם לא תציין - אשאל!)
• **קטגוריה:** (כדורסל, שחייה, אמנות וכו' - אוטומטי אם לא תציין)

**דוגמאות:**
"הישג בכדורסל - זכינו במקום הראשון באליפות המחוז ב-15 במרץ 2025"

"פרס למורה מצטיינת - הגב' רחל כהן זכתה בפרס מצטיינות חינוכית"

"הישג בשחייה - התלמיד יוסי לוי שבר שיא בית הספר במשך 100 מטר חופשי ב-20/03"

**💡 ניתן גם להוסיף:**
• קישור למאמר/תמונה
• תאריכי תצוגה (עד מתי להציג בקרוסלה)`,
        })
      } else {
        return NextResponse.json({
          success: true,
          message: 'לא הבנתי את הבחירה שלך 😕\n\nאנא בחר:\n1️⃣ אירוע\n2️⃣ הודעה דחופה\n3️⃣ הדגשה',
        })
      }
    }

    // Handle understanding check for complex messages (Round 1)
    if (action === 'understand_message') {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        max_completion_tokens: AI_CONFIG.max_completion_tokens,
        messages: [
          { role: 'system', content: UNDERSTANDING_PROMPT },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        // No function calling for understanding - just text response
      })

      const assistantMessage = response.choices[0].message

      // Log cost for analytics (Round 1)
      logAICost(
        response.usage,
        'understand_message',
        messages[messages.length - 1]?.content,
        1 // Round number
      )

      return NextResponse.json({
        success: true,
        message: assistantMessage.content || 'לא הבנתי. אנא נסה שוב.',
        understanding: assistantMessage.content, // Save for context in next round
      })
    }

    // Handle data extraction with function calling
    if (action === 'extract_data') {
      // Use extraction prompt with optional context from understanding round
      const systemPrompt = getExtractionPrompt(context)

      console.log('[AI API] Extraction request:', {
        hasContext: !!context,
        contextPreview: context?.substring(0, 100),
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1]?.content.substring(0, 100),
      })

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        max_completion_tokens: AI_CONFIG.max_completion_tokens,
        // Note: temperature is not included - GPT-5 Mini only supports default value (1)
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        tools: AI_TOOLS,
        // Use 'auto' instead of 'required' to allow AI to ask for clarification if needed
        // The explicit instructions in the user message guide the AI to call functions
        tool_choice: 'auto',
      })

      const assistantMessage = response.choices[0].message

      // Log cost for analytics (Round 2 if context exists, Round 1 if simple message)
      const roundNumber = context ? 2 : 1
      logAICost(
        response.usage,
        'extract_data',
        messages[messages.length - 1]?.content,
        roundNumber
      )

      console.log('[AI API] GPT Response:', {
        hasToolCalls: !!assistantMessage.tool_calls,
        toolCallCount: assistantMessage.tool_calls?.length || 0,
        hasContent: !!assistantMessage.content,
        contentPreview: assistantMessage.content?.substring(0, 100),
        finishReason: response.choices[0].finish_reason,
      })

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
          } else if (
          functionName === 'create_highlight' &&
          validateHighlightArgs(functionArgs)
        ) {
          return NextResponse.json({
            success: true,
            needsConfirmation: true,
            extractedData: {
              type: 'highlight',
              data: functionArgs,
            },
          })
          } else {
            // Validation failed - return specific validation errors
            console.error('[AI Assistant] Validation failed:', {
              functionName,
              args: functionArgs,
              eventsValid: functionName === 'create_events' ? validateEventsArgs(functionArgs) : 'N/A',
              urgentValid: functionName === 'create_urgent_message' ? validateUrgentMessageArgs(functionArgs) : 'N/A',
            })

            // Generate specific validation error messages
            const validationErrors: string[] = []

            if (functionName === 'create_events') {
              if (!functionArgs.events || functionArgs.events.length === 0) {
                validationErrors.push('לא נמצאו אירועים לייצור')
              } else {
                functionArgs.events.forEach((event: any, index: number) => {
                  if (!event.title) validationErrors.push(`אירוע ${index + 1}: חסר שם`)
                  if (!event.start_datetime) validationErrors.push(`אירוע ${index + 1}: חסר תאריך`)
                  if (!event.title_ru) validationErrors.push(`אירוע ${index + 1}: חסר תרגום רוסי`)
                })
              }
            } else if (functionName === 'create_urgent_message') {
              if (!functionArgs.title_he) validationErrors.push('חסרה כותרת בעברית')
              if (!functionArgs.title_ru) validationErrors.push('חסר תרגום רוסי')
              if (!functionArgs.end_date) validationErrors.push('חסר תאריך סיום')
            } else if (functionName === 'create_highlight') {
              if (!functionArgs.type) validationErrors.push('חסר סוג הדגשה')
              if (!functionArgs.icon) validationErrors.push('חסר אייקון')
              if (!functionArgs.title_he || functionArgs.title_he.length < 2) validationErrors.push('כותרת בעברית חייבת להכיל לפחות 2 תווים')
              if (!functionArgs.description_he || functionArgs.description_he.length < 10) validationErrors.push('תיאור בעברית חייב להכיל לפחות 10 תווים')
              if (!functionArgs.category_he || functionArgs.category_he.length < 2) validationErrors.push('קטגוריה בעברית חייבת להכיל לפחות 2 תווים')
            }

            return NextResponse.json({
              success: false,
              error: 'שגיאה באימות הנתונים שחולצו מההודעה',
              validationErrors,
            })
          }
        }
      }

      // AI responded with text (no function call) - this means it's asking for clarification
      // This is actually SUCCESS - AI is asking for missing information
      console.log('[AI Assistant] AI asking for clarification:', {
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
