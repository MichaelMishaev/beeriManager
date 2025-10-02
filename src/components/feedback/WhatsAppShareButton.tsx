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
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

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

const categoryLabels: Record<string, Record<string, string>> = {
  he: {
    general: 'כללי',
    event: 'אירוע',
    task: 'משימה',
    suggestion: 'הצעה',
    complaint: 'תלונה',
    other: 'אחר'
  },
  ru: {
    general: 'Общее',
    event: 'Событие',
    task: 'Задача',
    suggestion: 'Предложение',
    complaint: 'Жалоба',
    other: 'Другое'
  }
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
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const [copied, setCopied] = useState(false)

  const formatFeedbackForWhatsApp = () => {
    const emoji = categoryEmojis[feedback.category] || '📝'
    const feedbackTitle = locale === 'ru' ? 'Отзыв от родителей' : 'משוב מהורים'
    const typeLabel = locale === 'ru' ? 'Тип:' : 'סוג:'
    const subjectLabel = locale === 'ru' ? 'Тема:' : 'נושא:'
    const dateLabel = locale === 'ru' ? 'Дата:' : 'תאריך:'

    let message = `${emoji} *${feedbackTitle}*\n\n`
    message += `*${typeLabel}* ${categoryLabels[locale]?.[feedback.category] || feedback.category}\n`

    if (feedback.subject) {
      message += `*${subjectLabel}* ${feedback.subject}\n`
    }

    message += `*${dateLabel}* ${format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm')}\n`
    message += `\n-------------------\n\n`
    message += `${feedback.message}\n`
    message += `\n-------------------\n`
    const moreInfo = locale === 'ru'
      ? 'Подробнее на https://beeri.online'
      : 'לעוד מידע כנסו ל https://beeri.online'
    message += moreInfo

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
