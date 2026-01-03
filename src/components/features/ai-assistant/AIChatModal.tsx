'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import AIConfirmationPreview from './AIConfirmationPreview'
import type { CreateEventArgs, CreateUrgentMessageArgs, CreateHighlightArgs } from '@/lib/ai/tools'
import { isComplexMessage, isConfirmation } from '@/lib/ai/complexity-detector'
import { validateInput } from '@/lib/ai/input-validator'
import { analyzeFailure, formatErrorMessage, type FailureType } from '@/lib/ai/error-analyzer'
import { getContextualExamples, type Example } from '@/lib/ai/examples'
import ManualEventForm from './ManualEventForm'
import { RATE_LIMITS, type UsageStats } from '@/lib/ai/rate-limiter'
import { trackAIInteraction, EventAction } from '@/lib/analytics'
import { logger } from '@/lib/logger'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ExtractedData {
  type: 'event' | 'events' | 'urgent_message' | 'highlight'
  data: CreateEventArgs | CreateEventArgs[] | CreateUrgentMessageArgs | CreateHighlightArgs
}

interface AIChatModalProps {
  isOpen: boolean
  onClose: () => void
}

// Max GPT rounds safety limit (increased for complex highlights)
const MAX_GPT_ROUNDS = 6

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [chatPhase, setChatPhase] = useState<
    | 'initial'
    | 'type_selection'
    | 'data_entry'
    | 'understanding_check' // NEW: For complex message understanding confirmation
    | 'refinement' // NEW: For corrections/refinements
  >('initial')
  const [conversationContext, setConversationContext] = useState<{
    understanding?: string // AI's understanding from Round 1
    originalMessage?: string // Original complex message to extract from
    gptCallCount: number // Track number of GPT calls
    failureCount: number // Track consecutive failures
    lastFailureType?: FailureType // Last failure type for better error messages
  }>({ gptCallCount: 0, failureCount: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Detect if user is on mobile (for Enter key behavior)
  const [isMobile, setIsMobile] = useState(false)

  // Phase 2: Escalation features
  const [showExamples, setShowExamples] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualFormType, setManualFormType] = useState<'event' | 'urgent_message'>('event')

  // Phase 3: Rate limiting
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [characterCount, setCharacterCount] = useState(0)

  // Track user's selected content type (1=event, 2=urgent, 3=highlight)
  const [selectedType, setSelectedType] = useState<'event' | 'urgent' | 'highlight' | null>(null)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chat when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      trackAIInteraction(EventAction.AI_CHAT_OPEN, 'AI Chat Modal Opened')
      initializeChat()
      fetchUsageStats()
    }
  }, [isOpen])

  // Fetch usage stats
  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/ai-assistant/check-limit')
      const data = await response.json()
      if (data.success && data.stats) {
        setUsageStats(data.stats)
      }
    } catch (error) {
      logger.error('Failed to fetch usage stats', {
        component: 'AIChatModal',
        action: 'fetch_stats',
        error,
      })
    }
  }

  // Update character count when input changes
  useEffect(() => {
    setCharacterCount(input.trim().length)
  }, [input])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const initializeChat = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initial',
          messages: [],
        }),
      })

      const data = await response.json()

      if (data.success && data.message) {
        setMessages([{ role: 'assistant', content: data.message }])
        setChatPhase('type_selection')
      }
    } catch (error) {
      logger.error('Failed to initialize chat', {
        component: 'AIChatModal',
        action: 'initialize',
        error,
      })
      setMessages([
        {
          role: 'assistant',
          content: 'שגיאה בהתחברות לעוזר AI. אנא נסה שוב מאוחר יותר.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Check character limit (client-side validation)
    if (characterCount > RATE_LIMITS.MAX_MESSAGE_LENGTH) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: input.trim() },
        {
          role: 'assistant',
          content: `ההודעה ארוכה מדי 📏

מקסימום: ${RATE_LIMITS.MAX_MESSAGE_LENGTH} תווים
ההודעה שלך: ${characterCount} תווים

נסה לקצר את ההודעה.`,
        },
      ])
      setInput('')
      return
    }

    // Safety check: max rounds limit - auto-reset
    if (conversationContext.gptCallCount >= MAX_GPT_ROUNDS) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `נראה שיש בעיית תקשורת אחרי 6 ניסיונות 😔

אני מאפס את השיחה. בואו ננסה שוב מההתחלה.

💡 טיפ: כתוב בפשטות:
"[שם האירוע/הדגשה] ב-[תאריך]"

דוגמה: "הישג בכדורסל - מקום ראשון ב-15/03/2025"`,
        },
      ])

      // Auto-reset after 2 seconds
      setTimeout(() => {
        handleReset()
      }, 2000)

      return
    }

    // Validate input before sending (only in data_entry phase)
    if (chatPhase === 'data_entry') {
      const validation = validateInput(input.trim())
      if (!validation.valid) {
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: input.trim() },
          {
            role: 'assistant',
            content: validation.error || 'שגיאה באימות הקלט',
          },
        ])
        setInput('')
        return
      }
    }

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Track message send
    trackAIInteraction(EventAction.AI_CHAT_SEND, 'User sent message to AI', {
      messageLength: input.trim().length,
      phase: chatPhase,
    })

    try {
      // Determine action based on chat phase
      let action: 'select_type' | 'extract_data' | 'understand_message' =
        'extract_data'
      let context: string | undefined = undefined

      if (chatPhase === 'type_selection') {
        action = 'select_type'

        // Detect and store which type was selected
        const userInput = userMessage.content.toLowerCase().trim()
        if (userInput === '1' || userInput.includes('אירוע')) {
          setSelectedType('event')
        } else if (userInput === '2' || userInput.includes('הודעה') || userInput.includes('דחוף')) {
          setSelectedType('urgent')
        } else if (userInput === '3' || userInput.includes('הדגשה') || userInput.includes('הישג') || userInput.includes('פרס')) {
          setSelectedType('highlight')
        }
      } else if (chatPhase === 'data_entry') {
        // Check if message is complex
        const isComplex = isComplexMessage(userMessage.content)

        if (isComplex) {
          // Complex message → Understanding check first (Round 1)
          action = 'understand_message'
          // Save original message for later extraction
          setConversationContext((prev) => ({
            ...prev,
            originalMessage: userMessage.content,
          }))
        } else {
          // Simple message → Direct extraction (existing flow)
          action = 'extract_data'

          // Pass selected type as context for simple messages too
          if (selectedType) {
            const typeNames = {
              event: 'אירוע',
              urgent: 'הודעה דחופה',
              highlight: 'הדגשה (קרוסלה)',
            }
            context = `המשתמש בחר ליצור: ${typeNames[selectedType]}`
          }
        }
      } else if (chatPhase === 'understanding_check') {
        // User responded to understanding check
        logger.debug('Understanding check phase', {
          component: 'AIChatModal',
          action: 'understanding_check',
          data: {
            userMessage: userMessage.content,
            isConfirmation: isConfirmation(userMessage.content),
            understanding: conversationContext.understanding?.substring(0, 100),
            originalMessage: conversationContext.originalMessage?.substring(0, 100),
          }
        })

        if (isConfirmation(userMessage.content)) {
          // User confirmed → Extract with context (Round 2)
          logger.success('User confirmed understanding!', {
            component: 'AIChatModal',
            action: 'confirmation_detected'
          })
          action = 'extract_data'

          // Build context with selected type + understanding
          const contextParts: string[] = []

          if (selectedType) {
            const typeNames = {
              event: 'אירוע',
              urgent: 'הודעה דחופה',
              highlight: 'הדגשה (קרוסלה)',
            }
            contextParts.push(`המשתמש בחר ליצור: ${typeNames[selectedType]}`)
          }

          if (conversationContext.understanding) {
            contextParts.push(`ההבנה שאושרה: ${conversationContext.understanding}`)
          }

          context = contextParts.join('\n\n')
        } else {
          // User said "no" or is correcting
          // Check if it's a simple "no" or actual correction
          if (
            userMessage.content.trim().toLowerCase() === 'לא' ||
            userMessage.content.trim().toLowerCase() === 'no'
          ) {
            // Simple "no" - ask for clarification
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: 'מה לא נכון? אנא תקן אותי או הסבר מה צריך לשנות.',
              },
            ])
            setIsLoading(false)
            return // Exit early, wait for user's correction
          } else {
            // User provided correction - refine understanding with original + correction
            action = 'understand_message'
          }
        }
      }

      // Prepare messages for API
      let apiMessages = [...messages, userMessage]

      // If user provided a correction (not just "לא"), combine with original message
      if (
        chatPhase === 'understanding_check' &&
        action === 'understand_message' &&
        conversationContext.originalMessage &&
        userMessage.content.trim().toLowerCase() !== 'לא' &&
        userMessage.content.trim().toLowerCase() !== 'no'
      ) {
        // Send original message + correction together
        apiMessages = [
          ...messages.slice(0, -2), // Remove understanding Q&A
          {
            role: 'user',
            content: `${conversationContext.originalMessage}\n\nתיקון: ${userMessage.content}`,
          },
        ]
      }

      // If extracting after confirmation, send original message for extraction
      if (action === 'extract_data' && context && conversationContext.originalMessage) {
        // Send explicit extraction request with context inline
        // This makes it crystal clear to the AI what to do
        logger.info('Preparing extraction with context', {
          component: 'AIChatModal',
          action: 'prepare_extraction',
          data: {
            hasContext: true,
            contextPreview: context?.substring(0, 100),
            originalMessagePreview: conversationContext.originalMessage.substring(0, 100),
          }
        })

        // Create an explicit extraction request that includes the understanding
        const extractionRequest = `המשתמש אישר את ההבנה הבאה:
"${context}"

עכשיו אנא חלץ את הנתונים המדויקים מההודעה המקורית הבאה:

${conversationContext.originalMessage}

חשוב: קרא לפונקציה המתאימה עם כל הנתונים שחילצת.`

        apiMessages = [
          { role: 'user', content: extractionRequest },
        ]
      }

      logger.apiCall('POST', '/api/ai-assistant', {
        action,
        hasContext: !!context,
        messageCount: apiMessages.length,
        phase: chatPhase,
      })

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          messages: apiMessages,
          context, // Pass context if exists
        }),
      })

      const data = await response.json()

      // Refresh usage stats after API call
      if (data.stats) {
        setUsageStats(data.stats)
      } else {
        fetchUsageStats()
      }

      // Handle rate limit errors
      if (data.rateLimitReached) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'הגעת למגבלה היומית',
          },
        ])
        setIsLoading(false)
        return
      }

      // Handle message too long errors
      if (data.messageTooLong) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'ההודעה ארוכה מדי',
          },
        ])
        setIsLoading(false)
        return
      }

      if (data.success) {
        // Increment GPT call count
        setConversationContext((prev) => ({
          ...prev,
          gptCallCount: prev.gptCallCount + 1,
        }))

        if (data.needsConfirmation && data.extractedData) {
          // AI extracted data - show confirmation
          setExtractedData(data.extractedData)
          // Track successful extraction
          trackAIInteraction('extraction_success', 'AI successfully extracted data', {
            dataType: data.extractedData.type,
            gptCallCount: conversationContext.gptCallCount + 1,
          })
          // Reset failure count on successful extraction
          setConversationContext((prev) => ({
            ...prev,
            failureCount: 0,
            lastFailureType: undefined,
          }))
        } else if (data.message) {
          // AI responded with text
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.message },
          ])

          // Handle phase transitions
          if (chatPhase === 'type_selection') {
            setChatPhase('data_entry')
          } else if (action === 'understand_message') {
            // Save understanding and move to understanding_check phase
            setChatPhase('understanding_check')
            setConversationContext((prev) => ({
              ...prev,
              understanding: data.understanding || data.message,
            }))
          }
        }
      } else {
        // API returned error - analyze and provide specific guidance
        const failureType: FailureType = data.error?.includes('validation')
          ? 'validation_failed'
          : 'extraction_failed'

        const newFailureCount = conversationContext.failureCount + 1

        // Track extraction failure
        trackAIInteraction('extraction_failed', 'AI failed to extract data', {
          failureType,
          failureCount: newFailureCount,
          error: data.error,
        })

        const analysis = analyzeFailure(
          userMessage.content,
          failureType,
          data.validationErrors
        )

        let errorMessage = formatErrorMessage(analysis)

        // Escalation logic based on failure count
        if (newFailureCount === 2) {
          // Second failure → Show examples
          errorMessage += '\n\n💡 בחר דוגמה למטה או נסה שוב:'
          setShowExamples(true)
        } else if (newFailureCount === 3) {
          // Third failure → Offer manual form
          errorMessage += '\n\n🔧 עדיין מתקשה? אפשר למלא טופס ידני'
          setShowExamples(true)
        } else if (newFailureCount >= 4) {
          // Fourth failure → Auto-reset with explanation
          errorMessage = `נראה שיש בעיית תקשורת 😔

אני מאפס את השיחה. בואו ננסה שוב מההתחלה.

💡 טיפ: השתמש בפורמט פשוט:
"[שם האירוע] ב-[תאריך] בשעה [שעה]"

דוגמה: "מסיבת פורים ב-15/03/2025 בשעה 17:00"`

          // Auto-reset after showing message
          setTimeout(() => {
            handleReset()
          }, 3000)
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: errorMessage,
          },
        ])

        // Increment failure count
        setConversationContext((prev) => ({
          ...prev,
          failureCount: newFailureCount,
          lastFailureType: failureType,
        }))
      }
    } catch (error) {
      logger.error('Failed to send message', {
        component: 'AIChatModal',
        action: 'send_message',
        error,
        data: { userMessage: userMessage.content.substring(0, 100) }
      })

      const analysis = analyzeFailure(
        userMessage.content,
        'network_error'
      )

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: formatErrorMessage(analysis) },
      ])

      // Increment failure count for network errors too
      setConversationContext((prev) => ({
        ...prev,
        failureCount: prev.failureCount + 1,
        lastFailureType: 'network_error',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isMobile) {
        // On mobile: Enter creates new line, use Send button to send
        return
      } else {
        // On desktop: Enter sends, Shift+Enter creates new line
        if (!e.shiftKey) {
          e.preventDefault()
          handleSend()
        }
      }
    }
  }

  const handleConfirmationClose = () => {
    setExtractedData(null)
    // Reset chat after successful creation
    setMessages([])
    setChatPhase('initial')
    setConversationContext({ gptCallCount: 0, failureCount: 0 }) // Reset context
    initializeChat()
  }

  const handleReset = () => {
    setMessages([])
    setExtractedData(null)
    setChatPhase('initial')
    setConversationContext({ gptCallCount: 0, failureCount: 0 }) // Reset context
    setShowExamples(false)
    setShowManualForm(false)
    initializeChat()
  }

  const handleExampleClick = async (example: Example) => {
    // Fill input with example
    setInput(example.text)
    setShowExamples(false)

    // Wait for state to update, then auto-send
    await new Promise(resolve => setTimeout(resolve, 50))

    // Manually trigger send with the example text
    if (!isLoading) {
      const userMessage: Message = { role: 'user', content: example.text }
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        const validation = validateInput(example.text)
        if (!validation.valid) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: validation.error || 'שגיאה באימות הקלט',
            },
          ])
          setIsLoading(false)
          return
        }

        let action: 'select_type' | 'extract_data' | 'understand_message' = 'extract_data'

        if (chatPhase === 'type_selection') {
          action = 'select_type'
        } else if (chatPhase === 'data_entry') {
          const isComplex = isComplexMessage(example.text)
          if (isComplex) {
            action = 'understand_message'
            setConversationContext((prev) => ({
              ...prev,
              originalMessage: example.text,
            }))
          } else {
            action = 'extract_data'
          }
        }

        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            messages: [...messages, userMessage],
          }),
        })

        const data = await response.json()

        if (data.success) {
          setConversationContext((prev) => ({
            ...prev,
            gptCallCount: prev.gptCallCount + 1,
          }))

          if (data.needsConfirmation && data.extractedData) {
            setExtractedData(data.extractedData)
            setConversationContext((prev) => ({
              ...prev,
              failureCount: 0,
              lastFailureType: undefined,
            }))
          } else if (data.message) {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: data.message },
            ])

            if (chatPhase === 'type_selection') {
              setChatPhase('data_entry')
            } else if (action === 'understand_message') {
              setChatPhase('understanding_check')
              setConversationContext((prev) => ({
                ...prev,
                understanding: data.understanding || data.message,
              }))
            }
          }
        } else {
          const failureType: FailureType = data.error?.includes('validation')
            ? 'validation_failed'
            : 'extraction_failed'

          const analysis = analyzeFailure(example.text, failureType, data.validationErrors)

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: formatErrorMessage(analysis),
            },
          ])
        }
      } catch (error) {
        logger.error('Failed to send example', {
          component: 'AIChatModal',
          action: 'send_example',
          error,
          data: { example: example.text.substring(0, 100) }
        })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'שגיאה בחיבור לשרת. אנא נסה שוב.' },
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleOpenManualForm = () => {
    // Determine type based on chat phase or last user message
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .pop()?.content || ''

    const isUrgentMessage = /הודעה|דחוף|תזכורת/.test(lastUserMessage)
    setManualFormType(isUrgentMessage ? 'urgent_message' : 'event')
    setShowManualForm(true)
    setShowExamples(false)
  }

  const handleManualFormSubmit = async (data: CreateEventArgs | CreateUrgentMessageArgs) => {
    // Same logic as AI extraction confirmation
    const extractedType = manualFormType === 'event' ? 'events' : 'urgent_message'
    const extractedData: ExtractedData = {
      type: extractedType as any,
      data: extractedType === 'events' ? ([data] as CreateEventArgs[]) : (data as CreateUrgentMessageArgs),
    }
    setExtractedData(extractedData)
    setShowManualForm(false)
  }

  const handleManualFormCancel = () => {
    setShowManualForm(false)
    setShowExamples(true) // Go back to examples
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">עוזר AI - הוספה מהירה</h2>
              <p className="text-sm text-white/80">מופעל על ידי GPT-5 Mini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="rounded-lg bg-white/20 px-3 py-1.5 text-sm transition-colors hover:bg-white/30"
            >
              איפוס
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6" dir="rtl">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-end">
              <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {conversationContext.gptCallCount === 0 && 'מנתח הודעה...'}
                  {conversationContext.gptCallCount === 1 && 'מחלץ נתונים...'}
                  {conversationContext.gptCallCount === 2 && 'מאמת נתונים...'}
                  {conversationContext.gptCallCount === 3 && 'משכלל...'}
                  {conversationContext.gptCallCount >= 4 && 'מעבד...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Examples Dropdown */}
        {showExamples && !showManualForm && (
          <div className="px-6 py-3 border-t border-gray-200 bg-blue-50">
            <p className="font-medium text-sm mb-2">💡 בחר דוגמה:</p>
            <div className="space-y-2">
              {getContextualExamples(chatPhase, messages[messages.length - 1]?.content).map(
                (example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-right bg-white hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-2 text-sm transition-colors"
                  >
                    {example.text}
                  </button>
                )
              )}
            </div>

            {/* Manual Form Button (shown on 3rd failure) */}
            {conversationContext.failureCount >= 3 && (
              <button
                onClick={handleOpenManualForm}
                className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                📝 מעבר לטופס ידני
              </button>
            )}
          </div>
        )}

        {/* Manual Form */}
        {showManualForm && (
          <div className="px-6 py-3 border-t border-gray-200">
            <ManualEventForm
              type={manualFormType}
              onSubmit={handleManualFormSubmit}
              onCancel={handleManualFormCancel}
            />
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isMobile ? "הקלד את ההודעה שלך..." : "הקלד את ההודעה שלך... (Shift+Enter לשורה חדשה)"}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none min-h-[44px] max-h-32"
              disabled={isLoading}
              dir="rtl"
              rows={1}
              style={{
                height: 'auto',
                overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 128) + 'px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 h-[44px]"
            >
              <Send className="h-4 w-4" />
              <span>שלח</span>
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="text-gray-500 text-left" dir="ltr">
              {usageStats && (
                <span className={usageStats.remaining <= 5 ? 'text-orange-500 font-medium' : ''}>
                  📊 {usageStats.remaining}/{usageStats.dailyLimit} שימושים
                </span>
              )}
            </div>
            <div className="text-right">
              <span className={characterCount > RATE_LIMITS.MAX_MESSAGE_LENGTH ? 'text-red-500 font-medium' : characterCount > RATE_LIMITS.MAX_MESSAGE_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-500'}>
                📏 {characterCount}/{RATE_LIMITS.MAX_MESSAGE_LENGTH} תווים
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 text-right">
            💡 {isMobile
              ? 'לשורה חדשה: לחץ Enter | לשליחה: לחץ על כפתור "שלח"'
              : 'לשורה חדשה: Shift+Enter | לשליחה: Enter'}
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {extractedData && (
        <AIConfirmationPreview
          extractedData={extractedData}
          onClose={handleConfirmationClose}
        />
      )}
    </>
  )
}
