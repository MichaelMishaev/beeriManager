'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import AIConfirmationPreview from './AIConfirmationPreview'
import type { CreateEventArgs, CreateUrgentMessageArgs } from '@/lib/ai/tools'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ExtractedData {
  type: 'event' | 'events' | 'urgent_message'
  data: CreateEventArgs | CreateEventArgs[] | CreateUrgentMessageArgs
}

interface AIChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [chatPhase, setChatPhase] = useState<
    'initial' | 'type_selection' | 'data_entry'
  >('initial')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Detect if user is on mobile (for Enter key behavior)
  const [isMobile, setIsMobile] = useState(false)

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
      initializeChat()
    }
  }, [isOpen])

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
      console.error('Failed to initialize chat:', error)
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

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const action =
        chatPhase === 'type_selection' ? 'select_type' : 'extract_data'

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
        if (data.needsConfirmation && data.extractedData) {
          // AI extracted data - show confirmation
          setExtractedData(data.extractedData)
        } else if (data.message) {
          // AI responded with text
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.message },
          ])

          // Move to data entry phase after type selection
          if (chatPhase === 'type_selection') {
            setChatPhase('data_entry')
          }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'שגיאה בעיבוד הבקשה. אנא נסה שוב.',
          },
        ])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'שגיאה בחיבור לשרת. אנא נסה שוב.' },
      ])
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
    initializeChat()
  }

  const handleReset = () => {
    setMessages([])
    setExtractedData(null)
    setChatPhase('initial')
    initializeChat()
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
                <span className="text-sm">חושב...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

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
          <p className="mt-2 text-xs text-gray-500 text-right">
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
