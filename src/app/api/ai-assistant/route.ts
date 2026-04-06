import { NextRequest, NextResponse } from 'next/server'
import {
  openai,
  AI_CONFIG,
  UNDERSTANDING_PROMPT,
  SUMMARIZE_PROMPT,
  getExtractionPrompt,
} from '@/lib/ai/openai'
import {
  AI_TOOLS,
  validateEventsArgs,
  validateUrgentMessageArgs,
  validateHighlightArgs,
} from '@/lib/ai/tools'
import { incrementAiUsage, validateMessageLength } from '@/lib/ai/rate-limiter'
import { aiLogger } from '@/lib/ai/logger'
import { calculateCost } from '@/lib/ai/cost-tracker'

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
  action?: 'initial' | 'select_type' | 'extract_data' | 'understand_message' | 'summarize_message'
  context?: string // Optional context from understanding round
}

export async function POST(req: NextRequest) {
  let requestBody: AIAssistantRequest | null = null
  try {
    requestBody = await req.json()
    if (!requestBody) throw new Error('Request body is required')
    const { messages, action = 'extract_data', context } = requestBody

    // Handle initial greeting (no rate limit check - doesn't use GPT)
    if (action === 'initial') {
      aiLogger.logInitial()
      return NextResponse.json({
        success: true,
        message: `שלום! 👋 מה תרצה להוסיף?

1️⃣ **אירוע** - לוח שנה
2️⃣ **הודעה דחופה** - באנר בדף הבית
3️⃣ **הדגשה** - הישג/פרס/אירוע מיוחד

פשוט בחר מספר או תאר במילים חופשיות.`,
      })
    }

    // TEMPORARY: Rate limit check disabled for testing
    // TODO: Re-enable after database migration completes
    const rateLimitResult = await incrementAiUsage()

    // Log rate limit check
    aiLogger.logRateLimit({
      usageCount: rateLimitResult.stats.currentCount,
      dailyLimit: rateLimitResult.stats.dailyLimit,
      rateLimitReached: rateLimitResult.stats.limitReached,
    })

    // COMMENTED OUT TEMPORARILY - Rate limit disabled
    // if (!rateLimitResult.success || rateLimitResult.stats.limitReached) {
    //   aiLogger.logRateLimit({
    //     usageCount: rateLimitResult.stats.currentCount,
    //     dailyLimit: rateLimitResult.stats.dailyLimit,
    //     rateLimitReached: true,
    //   })
    //   return NextResponse.json({
    //     success: false,
    //     error: `הגעת למגבלה היומית של 50 שימושים 😔

    // נסה שוב מחר או צור קשר עם המנהל.

    // שימושים היום: ${rateLimitResult.stats.currentCount}/${rateLimitResult.stats.dailyLimit}`,
    //     rateLimitReached: true,
    //     stats: rateLimitResult.stats,
    //   })
    // }

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
        aiLogger.logTypeSelection(userInput, true)
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
        aiLogger.logTypeSelection(userInput, true)
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
        aiLogger.logTypeSelection(userInput, true)
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
        aiLogger.logTypeSelection(userInput, false)
        return NextResponse.json({
          success: true,
          message: 'לא הבנתי את הבחירה שלך 😕\n\nאנא בחר:\n1️⃣ אירוע\n2️⃣ הודעה דחופה\n3️⃣ הדגשה',
        })
      }
    }

    // Handle auto-summarize for long messages
    if (action === 'summarize_message') {
      const userMessage = messages[messages.length - 1]?.content || ''

      if (userMessage.length > 5000) {
        return NextResponse.json({
          success: false,
          error: 'ההודעה ארוכה מדי לסיכום',
        }, { status: 400 })
      }

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        max_completion_tokens: 300,
        messages: [
          { role: 'system', content: SUMMARIZE_PROMPT },
          { role: 'user', content: userMessage },
        ],
      })

      const summary = response.choices[0]?.message?.content

      if (!summary) {
        return NextResponse.json({
          success: false,
          error: 'לא הצלחתי לסכם את ההודעה',
        })
      }

      return NextResponse.json({
        success: true,
        summary,
      })
    }

    // Handle understanding check for complex messages (Round 1)
    if (action === 'understand_message') {
      const userMessage = messages[messages.length - 1]?.content || ''
      const startTime = Date.now()

      const requestMessages = [
        { role: 'system' as const, content: UNDERSTANDING_PROMPT },
        ...messages.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })),
      ]

      // Log GPT request with FULL details
      aiLogger.logGPTRequest({
        action: 'understand_message',
        userMessage,
        gptModel: AI_CONFIG.model,
        roundNumber: 1,
        context: undefined,
        metadata: {
          fullRequest: {
            model: AI_CONFIG.model,
            max_completion_tokens: AI_CONFIG.max_completion_tokens,
            messages: requestMessages, // FULL request messages
            timestamp: new Date().toISOString(),
          },
        },
      })

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        max_completion_tokens: AI_CONFIG.max_completion_tokens,
        messages: requestMessages,
        // No function calling for understanding - just text response
      })

      const assistantMessage = response.choices[0].message
      const duration = Date.now() - startTime

      // Log GPT response with FULL details
      aiLogger.logGPTResponse({
        action: 'understand_message',
        responseType: 'text',
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        cost: response.usage ? calculateCost(response.usage, AI_CONFIG.model) : 0,
        roundNumber: 1,
        durationMs: duration,
        metadata: {
          fullResponse: {
            message: assistantMessage, // FULL assistant message
            finishReason: response.choices[0].finish_reason,
            usage: response.usage,
            timestamp: new Date().toISOString(),
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: assistantMessage.content || 'לא הבנתי. אנא נסה שוב.',
        understanding: assistantMessage.content, // Save for context in next round
      })
    }

    // Handle data extraction with function calling
    if (action === 'extract_data') {
      const userMessage = messages[messages.length - 1]?.content || ''
      const roundNumber = context ? 2 : 1
      const startTime = Date.now()

      // Use extraction prompt with optional context from understanding round
      const systemPrompt = getExtractionPrompt(context)

      const requestMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })),
      ]

      // Log GPT request with FULL details
      aiLogger.logGPTRequest({
        action: 'extract_data',
        userMessage,
        gptModel: AI_CONFIG.model,
        roundNumber,
        context,
        metadata: {
          fullRequest: {
            model: AI_CONFIG.model,
            max_completion_tokens: AI_CONFIG.max_completion_tokens,
            messages: requestMessages, // FULL request messages
            tools: AI_TOOLS, // FULL tools definition
            tool_choice: 'auto',
            systemPrompt, // FULL system prompt (with context if exists)
            hasContext: !!context,
            contextPreview: context?.substring(0, 200),
            timestamp: new Date().toISOString(),
          },
        },
      })

      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        max_completion_tokens: AI_CONFIG.max_completion_tokens,
        // Note: temperature is not included - GPT-5 Mini only supports default value (1)
        messages: requestMessages,
        tools: AI_TOOLS,
        // Use 'auto' instead of 'required' to allow AI to ask for clarification if needed
        // The explicit instructions in the user message guide the AI to call functions
        tool_choice: 'auto',
      })

      const assistantMessage = response.choices[0].message
      const duration = Date.now() - startTime

      // Determine response type
      const responseType = assistantMessage.tool_calls?.length
        ? 'function_call'
        : assistantMessage.content
        ? 'text'
        : 'error'

      // Extract function call details if present
      const toolCall = assistantMessage.tool_calls?.[0]
      const functionName = toolCall?.type === 'function' && 'function' in toolCall ? toolCall.function.name : undefined
      const functionArgs = functionName && toolCall?.type === 'function' && 'function' in toolCall
        ? JSON.parse(toolCall.function.arguments)
        : undefined

      // Log GPT response with FULL details
      aiLogger.logGPTResponse({
        action: 'extract_data',
        responseType,
        functionName,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        cost: response.usage ? calculateCost(response.usage, AI_CONFIG.model) : 0,
        roundNumber,
        durationMs: duration,
        metadata: {
          fullResponse: {
            message: assistantMessage, // FULL assistant message
            toolCalls: assistantMessage.tool_calls, // FULL tool calls
            functionName,
            functionArguments: functionArgs, // Parsed function arguments
            finishReason: response.choices[0].finish_reason,
            usage: response.usage,
            timestamp: new Date().toISOString(),
          },
        },
      })

      // Check if AI wants to call a function
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolCall = assistantMessage.tool_calls[0]
        if (toolCall.type === 'function') {
          const functionName = toolCall.function.name
          const functionArgs = JSON.parse(toolCall.function.arguments)

          // Log function call detection
          aiLogger.log({
            level: 'info',
            action: 'extract_data',
            responseType: 'function_call',
            functionName,
            metadata: {
              argsPreview: JSON.stringify(functionArgs).substring(0, 200),
            },
          })

          // Validate and return extracted data
          if (functionName === 'create_events' && validateEventsArgs(functionArgs)) {
            aiLogger.logValidation({
              action: 'extract_data',
              functionName,
              validationSuccess: true,
              extractedDataType: 'events',
            })
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
          aiLogger.logValidation({
            action: 'extract_data',
            functionName,
            validationSuccess: true,
            extractedDataType: 'urgent_message',
          })
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
          aiLogger.logValidation({
            action: 'extract_data',
            functionName,
            validationSuccess: true,
            extractedDataType: 'highlight',
          })
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

            // Log validation failure
            aiLogger.logValidation({
              action: 'extract_data',
              functionName,
              validationSuccess: false,
              validationErrors,
            })

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
      aiLogger.log({
        level: 'info',
        action: 'extract_data',
        responseType: 'text',
        userMessage: messages[messages.length - 1]?.content,
        metadata: {
          aiResponse: assistantMessage.content?.substring(0, 200),
          finishReason: response.choices[0].finish_reason,
          clarificationNeeded: true,
        },
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
    // Log error using AI logger with FULL details
    aiLogger.logError({
      action: 'extract_data', // Default to extract_data since most errors happen there
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      metadata: {
        fullError: {
          name: error instanceof Error ? error.name : 'UnknownError',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          // Capture OpenAI API errors specifically
          openAIError: error && typeof error === 'object' && 'status' in error ? {
            status: (error as any).status,
            code: (error as any).code,
            type: (error as any).type,
            param: (error as any).param,
          } : undefined,
          timestamp: new Date().toISOString(),
        },
        requestBody, // Full request body
      },
    })

    console.error('[AI Assistant] Critical error:', error)
    console.error('[AI Assistant] Error details:', JSON.stringify(error, null, 2))

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
