'use client'

import { ShareButton } from '@/components/ui/share-button'
import { formatTaskShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Task } from '@/types'
import type { Locale } from '@/i18n/config'

interface ShareTaskButtonProps {
  task: Task
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ShareTaskButton({ task, variant = 'outline', size = 'sm' }: ShareTaskButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale

  // Map task fields to what the formatter expects
  const taskData = {
    id: task.id,
    title: task.title,
    description: task.description,
    due_date: task.due_date,
    priority: task.priority,
    assigned_to: task.owner_name ? [task.owner_name] : undefined,
    status: task.status
  }

  return (
    <ShareButton
      shareData={formatTaskShareData(taskData, locale)}
      variant={variant}
      size={size}
      locale={locale}
      label={locale === 'ru' ? 'Поделиться' : 'שתף'}
    />
  )
}
