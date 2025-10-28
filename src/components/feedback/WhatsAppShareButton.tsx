'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  const handleShare = async () => {
    const text = formatFeedbackForWhatsApp()
    const feedbackTitle = locale === 'ru' ? 'Отзыв от родителей' : 'משוב מהורים'

    if (navigator.share) {
      try {
        await navigator.share({
          title: feedbackTitle,
          text
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(text)
          alert(locale === 'ru' ? 'Скопировано!' : 'הועתק!')
        }
      }
    } else {
      // Fallback to WhatsApp
      const encodedText = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1"
      onClick={handleShare}
      title={locale === 'ru' ? 'Поделиться' : 'שיתוף'}
    >
      <Share2 className="h-3 w-3 ml-1" />
      שתף
    </Button>
  )
}
