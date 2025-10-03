'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareIssueButtonProps {
  issue: {
    id: string
    title: string
    category: string
    priority: string
    status: string
  }
}

const categoryLabels: Record<string, string> = {
  safety: '🔒 בטיחות',
  maintenance: '🔧 תחזוקה',
  academic: '📚 לימודי',
  social: '👥 חברתי',
  financial: '💰 כספי',
  other: '📋 אחר'
}

const priorityLabels: Record<string, string> = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  critical: 'קריטית'
}

const statusLabels: Record<string, string> = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  resolved: 'נפתר',
  closed: 'סגור'
}

export function ShareIssueButton({ issue }: ShareIssueButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/he/issues/${issue.id}`
    const category = categoryLabels[issue.category] || issue.category
    const priority = priorityLabels[issue.priority] || issue.priority
    const status = statusLabels[issue.status] || issue.status

    const text = `⚠️ *${issue.title}*\n\n${category} | עדיפות: ${priority}\nסטטוס: ${status}\n\n🔗 לצפייה בבעיה המלאה:\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: issue.title,
          text,
          url
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(`${text}`)
          alert('הקישור הועתק! ניתן להדבקה בווטסאפ')
        }
      }
    } else {
      // Fallback to WhatsApp Web
      const encodedText = encodeURIComponent(text)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
    }
  }

  return (
    <Button variant="outline" size="sm" className="w-full" onClick={handleShare}>
      <Share2 className="h-4 w-4 ml-2" />
      שתף
    </Button>
  )
}
