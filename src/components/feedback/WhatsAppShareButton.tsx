'use client'

import { MessageCircle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'

interface Feedback {
  id: string
  category: string
  subject?: string
  message: string
  created_at: string
}

interface WhatsAppShareButtonProps {
  feedback: Feedback
}

const categoryLabels: Record<string, string> = {
  general: 'כללי',
  event: 'אירוע',
  task: 'משימה',
  suggestion: 'הצעה',
  complaint: 'תלונה',
  other: 'אחר'
}

const categoryEmojis: Record<string, string> = {
  general: '💬',
  event: '📅',
  task: '✅',
  suggestion: '💡',
  complaint: '⚠️',
  other: '📝'
}

export function WhatsAppShareButton({ feedback }: WhatsAppShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const formatFeedbackForWhatsApp = () => {
    const emoji = categoryEmojis[feedback.category] || '📝'

    let message = `${emoji} *משוב מהורים*\n\n`
    message += `*סוג:* ${categoryLabels[feedback.category] || feedback.category}\n`

    if (feedback.subject) {
      message += `*נושא:* ${feedback.subject}\n`
    }

    message += `*תאריך:* ${format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm')}\n`
    message += `\n-------------------\n\n`
    message += `${feedback.message}\n`
    message += `\n-------------------\n`
    message += `*לצפייה בכל המשובים:*\n`
    message += `${window.location.origin}/admin/feedback`

    return message
  }

  const handleCopy = async () => {
    const text = formatFeedbackForWhatsApp()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsAppShare = () => {
    const text = formatFeedbackForWhatsApp()
    const encodedText = encodeURIComponent(text)
    const whatsappUrl = `https://wa.me/?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
        >
          <MessageCircle className="h-3 w-3" />
          שתף
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWhatsAppShare} className="gap-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          <span>שתף בווצאפ</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? 'הועתק!' : 'העתק טקסט'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
