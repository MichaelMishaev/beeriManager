import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_CONFIG } from '@/lib/ai/openai'
import { aiLogger } from '@/lib/ai/logger'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Parse request body first (can only be done once)
  const body = await req.json().catch(() => ({}))
  const { refinement, previousSummary } = body

  try {
    const supabase = await createClient()

    // Fetch the protocol
    const { data: protocol, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !protocol) {
      return NextResponse.json(
        { success: false, error: 'פרוטוקול לא נמצא' },
        { status: 404 }
      )
    }

    // Build the content to summarize
    const contentParts: string[] = []

    if (protocol.title) {
      contentParts.push(`כותרת: ${protocol.title}`)
    }

    if (protocol.protocol_date) {
      contentParts.push(`תאריך: ${new Date(protocol.protocol_date).toLocaleDateString('he-IL')}`)
    }

    if (protocol.attendees && protocol.attendees.length > 0) {
      contentParts.push(`משתתפים: ${protocol.attendees.join(', ')}`)
    }

    if (protocol.agenda) {
      contentParts.push(`\nסדר יום:\n${protocol.agenda}`)
    }

    if (protocol.decisions) {
      contentParts.push(`\nהחלטות:\n${protocol.decisions}`)
    }

    if (protocol.action_items) {
      contentParts.push(`\nמשימות לביצוע:\n${protocol.action_items}`)
    }

    const fullContent = contentParts.join('\n\n')

    if (!fullContent || fullContent.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'אין תוכן לסיכום בפרוטוקול זה' },
        { status: 400 }
      )
    }

    // Generate summary using OpenAI
    let systemPrompt = `אתה עוזר AI המתמחה בסיכום פרוטוקולים של ועד הורים בשפה רשמית וברורה.
תפקידך: ליצור סיכום מקצועי, ידידותי למשתמש, ומפורט של הפרוטוקול.

📋 **עקרונות יסוד:**

**שפה ופורמט:**
- השתמש בשפה רשמית ומכבדת בעברית תקנית
- כתוב במשפטים ברורים ומובנים
- הימנע מסלנג או ביטויים לא פורמליים
- השתמש בפסוקיות ופיסוק נכון
- הקפד על ניקוד במילים שעלולות להיות מבולבלות

**מבנה וארגון:**
- סדר לוגי וברור של המידע
- כותרות ברורות לכל קטע
- תבליטים (•) עם רווח נאה
- פסקאות מסודרות ומאווררות
- מספור ברור למשימות והחלטות

**תוכן ופרטים:**
⚠️ **חשוב ביותר: שמור על כל הפרטים!**
- כלול את כל השמות המלאים
- תאריכים וזמנים מדויקים
- סכומי כסף וכמויות
- כל ההחלטות בפירוט מלא
- כל המשימות עם אחראים ותאריכי יעד
- כל הנקודות שהועלו בדיון

**סגנון כתיבה:**
- משפטים קצרים וענייניים (לא יותר מ-2 שורות)
- הימנע מחזרות מיותרות
- השתמש בפעלים פעילים במקום סבילים
- הדגש את העיקר בכל סעיף
- הפרד בין נושאים שונים בבירור

**פורמט הסיכום המלא:**

📋 **סיכום ישיבת ועד ההורים**
[תאריך הישיבה]

---

**משתתפים:**
• [רשימת כל המשתתפים]

---

🎯 **נושאים שנדונו:**

**1. [שם הנושא הראשון]**
   • [תיאור מפורט של הדיון]
   • [נקודות עיקריות שהועלו]
   • [דעות שונות אם היו]

**2. [שם הנושא השני]**
   • [תיאור מפורט]
   • [פרטים חשובים]

---

✅ **החלטות שהתקבלו:**

**החלטה 1: [כותרת ההחלטה]**
   • **תיאור:** [הסבר מפורט על ההחלטה]
   • **נימוק:** [הסיבה להחלטה]
   • **ביצוע:** [מתי ואיך]
   • **אחראי:** [שם מלא]

**החלטה 2: [כותרת ההחלטה]**
   • **תיאור:** [הסבר מפורט]
   • **נימוק:** [הסיבה]
   • **ביצוע:** [פרטים]
   • **אחראי:** [שם]

---

📌 **משימות לביצוע:**

**משימה 1: [שם המשימה]**
   • **תיאור:** [מה צריך לעשות בדיוק]
   • **אחראי:** [שם מלא של האחראי]
   • **מועד יעד:** [תאריך קונקרטי]
   • **משאבים:** [תקציב/כלים נדרשים אם רלוונטי]

**משימה 2: [שם המשימה]**
   • **תיאור:** [פרטים]
   • **אחראי:** [שם]
   • **מועד יעד:** [תאריך]

---

💰 **נושאים תקציביים:** (אם רלוונטי)
   • [פירוט הוצאות שאושרו]
   • [סכומים מדויקים]
   • [מקור התקציב]

---

💡 **נקודות חשובות לתשומת לב:**
   • [כל הערה חשובה]
   • [נקודות שנדרש מעקב]
   • [נושאים לדיון בישיבה הבאה]

---

**מועד הישיבה הבאה:** [תאריך ושעה אם נקבעו]

---

**הערות:**
- הסיכום נוצר באופן אוטומטי ונבדק לדיוק
- לשאלות ניתן לפנות לאחראי הפרוטוקול`

    let userPrompt = `סכם את הפרוטוקול הבא:\n\n${fullContent}`

    // If this is a refinement request, add refinement instructions
    if (refinement && previousSummary) {
      systemPrompt += `\n\n🔄 **הנחיות לשיפור הסיכום:**\n- שמור על שפה רשמית ומקצועית\n- הקפד על פורמט ברור ומסודר\n- שמר על כל הפרטים החשובים`

      switch (refinement) {
        case 'shorter':
          userPrompt = `הסיכום הקודם:\n${previousSummary}\n\nבקשת שיפור: צמצם את הסיכום והפוך אותו לתמציתי יותר, אך:
- שמור על כל ההחלטות והמשימות בפירוט מלא
- שמור על שפה רשמית ומכבדת
- השאר את כל השמות, התאריכים, והסכומים
- הקפד על פורמט ברור עם כותרות וסעיפים
- הסר רק הסברים מיותרים, לא מידע חשוב`
          break
        case 'longer':
          userPrompt = `הסיכום הקודם:\n${previousSummary}\n\nבקשת שיפור: הרחב והעשר את הסיכום עם פרטים נוספים מהפרוטוקול המקורי:

הפרוטוקול המלא:\n${fullContent}

הנחיות להרחבה:
- הוסף פרטים שחסרים מהפרוטוקול המקורי
- הרחב הסברים על ההחלטות והנימוקים
- כלול רקע ונימוקים לדיונים
- שמור על שפה רשמית ומקצועית
- הקפד על מבנה ברור ומסודר
- הוסף קונטקסט לכל החלטה ומשימה`
          break
        case 'focus_decisions':
          userPrompt = `הסיכום הקודם:\n${previousSummary}\n\nבקשת שיפור: צור סיכום ממוקד בהחלטות ובמשימות.

הפרוטוקול המלא:\n${fullContent}

הנחיות:
- **התמקד בהחלטות**: כלול כל החלטה עם:
  • נימוק מפורט
  • שם האחראי המלא
  • מועדי ביצוע
  • פרטים טכניים (תקציב, משאבים)

- **התמקד במשימות**: כלול כל משימה עם:
  • תיאור ברור ומדויק של המשימה
  • שם האחראי המלא
  • תאריך יעד ספציפי
  • משאבים נדרשים

- שמור על שפה רשמית ומקצועית
- השתמש בפורמט ברור עם כותרות ומספור
- הקפד על פיסוק נכון ומשפטים ברורים`
          break
        case 'custom':
          // Custom refinement will be handled by additional user message
          break
      }
    }

    // Log the request
    const startTime = Date.now()
    const isRefinement = !!refinement

    aiLogger.logProtocolSummary({
      protocolId: params.id,
      isRefinement,
      refinementType: refinement,
      gptModel: AI_CONFIG.model,
      userMessage: `Protocol: ${protocol.title}`,
      metadata: {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
        fullContentLength: fullContent.length,
      }
    })

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      max_completion_tokens: 3000, // Increased for more detailed summaries
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    const summary = response.choices[0].message.content
    const duration = Date.now() - startTime

    // Check if GPT returned a valid summary
    if (!summary || summary.trim().length === 0) {
      // Calculate cost even for failed attempts (GPT-4o Mini pricing)
      const inputCost = (response.usage?.prompt_tokens || 0) * (0.00015 / 1000)
      const outputCost = (response.usage?.completion_tokens || 0) * (0.0006 / 1000)
      const cost = inputCost + outputCost

      // Log the failure
      aiLogger.logProtocolSummaryResponse({
        protocolId: params.id,
        isRefinement,
        success: false,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        cost,
        durationMs: duration,
        errorMessage: 'GPT returned empty summary',
        metadata: {
          protocolTitle: protocol.title,
          refinementType: refinement,
        }
      })

      return NextResponse.json(
        {
          success: false,
          error: 'לא הצלחתי ליצור סיכום. אנא נסה שוב.'
        },
        { status: 500 }
      )
    }

    // Calculate cost (GPT-4o Mini pricing: $0.00015 per 1K input tokens, $0.0006 per 1K output tokens)
    const inputCost = (response.usage?.prompt_tokens || 0) * (0.00015 / 1000)
    const outputCost = (response.usage?.completion_tokens || 0) * (0.0006 / 1000)
    const cost = inputCost + outputCost

    // Log the successful response
    aiLogger.logProtocolSummaryResponse({
      protocolId: params.id,
      isRefinement,
      success: true,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
      cost,
      durationMs: duration,
      summaryLength: summary.length,
      metadata: {
        protocolTitle: protocol.title,
        refinementType: refinement,
      }
    })

    return NextResponse.json({
      success: true,
      summary,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    })

  } catch (error) {
    console.error('❌ [Protocol Summarization] Error:', error)
    console.error('❌ [Protocol Summarization] Error details:', {
      protocolId: params.id,
      errorMessage: error instanceof Error ? error.message : 'Unknown',
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorStack: error instanceof Error ? error.stack : undefined,
      // Log OpenAI specific errors
      ...(error && typeof error === 'object' && 'status' in error ? {
        openaiStatus: (error as any).status,
        openaiCode: (error as any).code,
        openaiType: (error as any).type,
      } : {})
    })

    // Log the error
    aiLogger.logProtocolSummaryResponse({
      protocolId: params.id,
      isRefinement: !!body.refinement,
      success: false,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0,
      durationMs: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: error instanceof Error ? error.name : 'UnknownError',
        // Include OpenAI error details if available
        openaiError: error && typeof error === 'object' && 'status' in error ? {
          status: (error as any).status,
          code: (error as any).code,
          type: (error as any).type,
        } : undefined,
      }
    })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'שגיאה ביצירת סיכום הפרוטוקול',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown',
          type: error instanceof Error ? error.name : 'UnknownError',
        } : undefined
      },
      { status: 500 }
    )
  }
}
