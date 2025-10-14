'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Task } from '@/types'

interface ShareTaskButtonProps {
  task: Task
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const statusLabels: Record<string, string> = {
  pending: 'ממתינה',
  in_progress: 'בביצוע',
  completed: 'הושלמה',
  cancelled: 'בוטלה',
  overdue: 'באיחור'
}

const priorityLabels: Record<string, string> = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  urgent: 'דחופה'
}

export function ShareTaskButton({ task, variant = 'outline', size = 'sm' }: ShareTaskButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/he/tasks/${task.id}`
    const status = statusLabels[task.status] || task.status
    const priority = priorityLabels[task.priority] || task.priority

    // Build tag text
    const tagsText = task.tags && task.tags.length > 0
      ? `\n🏷️ תגיות: ${task.tags.map(t => `${t.emoji || ''} ${t.name_he}`).join(', ')}`
      : ''

    // Build due date text
    const dueDateText = task.due_date
      ? `\n📅 תאריך יעד: ${new Date(task.due_date).toLocaleDateString('he-IL')}`
      : ''

    const text = `✅ *${task.title}*\n\n👤 אחראי: ${task.owner_name}${dueDateText}\n📊 סטטוס: ${status} | עדיפות: ${priority}${tagsText}\n\n🔗 לצפייה במשימה המלאה:\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: task.title,
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
    <Button variant={variant} size={size} onClick={handleShare}>
      <Share2 className="h-4 w-4 ml-2" />
      שתף
    </Button>
  )
}
