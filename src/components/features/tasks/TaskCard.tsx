'use client'

import React, { useState } from 'react'
import { CheckSquare, Square, Clock, AlertCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatHebrewDate, getHebrewRelativeTime } from '@/lib/utils/date'
import { TASK_STATUSES, PRIORITY_LEVELS } from '@/lib/utils/constants'
import type { Task, Tag } from '@/types'
import Link from 'next/link'
import { QuickTagEditor } from './QuickTagEditor'
import { ShareButton } from '@/components/ui/share-button'
import { formatTaskShareData } from '@/lib/utils/share-formatters'
import { TaskCompletionDialog } from './TaskCompletionDialog'

interface TaskCardProps {
  task: Task
  variant?: 'full' | 'compact' | 'minimal'
  showActions?: boolean
  onComplete?: (comment?: string) => void
  onEdit?: () => void
  onTagsUpdated?: (updatedTask: Task) => void
  availableTags?: Tag[]
  className?: string
}

export function TaskCard({
  task,
  variant = 'full',
  showActions = true,
  onComplete,
  onEdit,
  onTagsUpdated,
  availableTags = [],
  className = ''
}: TaskCardProps) {
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const dueDate = task.due_date ? new Date(task.due_date) : null
  const isOverdue = task.status !== 'completed' && dueDate && dueDate < new Date()
  const isToday = dueDate ? dueDate.toDateString() === new Date().toDateString() : false

  const handleCompletionClick = () => {
    // If task is not completed, show dialog to add optional comment
    if (task.status !== 'completed') {
      setShowCompletionDialog(true)
    } else {
      // If already completed, just toggle back without comment
      onComplete?.()
    }
  }

  const handleConfirmCompletion = (comment?: string) => {
    onComplete?.(comment)
  }

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200'

    const colors = {
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      overdue: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800 animate-pulse'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const StatusIcon = task.status === 'completed' ? CheckSquare : Square

  if (variant === 'minimal') {
    return (
      <>
        <div className={`flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow ${className}`}>
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={handleCompletionClick}
            className={`p-1 rounded transition-colors ${
              task.status === 'completed'
                ? 'text-green-600 hover:text-green-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <StatusIcon className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{task.owner_name}</span>
              {dueDate && (
                <>
                  <span>•</span>
                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    {getHebrewRelativeTime(dueDate)}
                  </span>
                </>
              )}
            </div>
            {/* Tags for minimal */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      borderColor: tag.color,
                      color: tag.color
                    }}
                    className="text-xs font-normal px-1 py-0"
                  >
                    {tag.emoji}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        {showActions && (
          <div className="flex gap-1">
            <Button variant="ghost" asChild size="sm">
              <Link href={`/tasks/${task.id}`}>פרטים</Link>
            </Button>
            <ShareButton shareData={formatTaskShareData(task)} variant="ghost" size="sm" />
          </div>
        )}
      </div>

      <TaskCompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onConfirm={handleConfirmCompletion}
        taskTitle={task.title}
      />
    </>
    )
  }

  if (variant === 'compact') {
    return (
      <>
        <Card className={`hover:shadow-lg transition-shadow ${className} ${
          task.priority === 'urgent' ? 'ring-2 ring-red-200' : ''
        }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={handleCompletionClick}
              className={`p-1 rounded transition-colors flex-shrink-0 mt-0.5 ${
                task.status === 'completed'
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <StatusIcon className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-semibold text-base leading-tight ${
                  task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task.title}
                </h3>
                <div className="flex gap-1 flex-shrink-0 mr-2">
                  {task.priority !== 'normal' && (
                    <Badge className={getPriorityColor(task.priority)}>
                      {PRIORITY_LEVELS[task.priority as keyof typeof PRIORITY_LEVELS]}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(task.status, !!isOverdue)}>
                    {isOverdue ? 'באיחור' : TASK_STATUSES[task.status as keyof typeof TASK_STATUSES]}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <span>{task.owner_name}</span>
                </div>
                {dueDate && (
                  <div className={`flex items-center gap-1 ${
                    isOverdue ? 'text-red-600' : isToday ? 'text-orange-600 font-medium' : ''
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span>{formatHebrewDate(dueDate)}</span>
                  </div>
                )}
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{
                        backgroundColor: `${tag.color}15`,
                        borderColor: tag.color,
                        color: tag.color
                      }}
                      className="text-xs font-normal"
                    >
                      {tag.emoji && <span className="ml-1">{tag.emoji}</span>}
                      {tag.name_he}
                    </Badge>
                  ))}
                </div>
              )}

              {showActions && (
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" asChild>
                    <Link href={`/tasks/${task.id}`}>פרטים</Link>
                  </Button>
                  {task.status !== 'completed' && onComplete && (
                    <Button variant="outline" size="sm" onClick={handleCompletionClick}>
                      {task.status === 'pending' ? 'התחל עבודה' : 'סיים משימה'}
                    </Button>
                  )}
                  {availableTags.length > 0 && (
                    <QuickTagEditor
                      task={task}
                      availableTags={availableTags}
                      onTagsUpdated={onTagsUpdated}
                    />
                  )}
                  <ShareButton shareData={formatTaskShareData(task)} variant="ghost" size="sm" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskCompletionDialog
        open={showCompletionDialog}
        onOpenChange={setShowCompletionDialog}
        onConfirm={handleConfirmCompletion}
        taskTitle={task.title}
      />
    </>
    )
  }

  // Full variant
  return (
    <>
      <Card className={`hover:shadow-lg transition-shadow ${className} ${
        task.priority === 'urgent' ? 'ring-2 ring-red-200 shadow-lg' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <button
              onClick={handleCompletionClick}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                task.status === 'completed'
                  ? 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <StatusIcon className="h-6 w-6" />
            </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className={`text-xl ${
                task.status === 'completed' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </CardTitle>
              <div className="flex flex-col gap-2 items-end flex-shrink-0 mr-2">
                {task.priority !== 'normal' && (
                  <Badge variant={task.priority === 'urgent' ? 'destructive' : 'outline'}
                         className={getPriorityColor(task.priority)}>
                    <AlertCircle className="h-3 w-3 ml-1" />
                    {PRIORITY_LEVELS[task.priority as keyof typeof PRIORITY_LEVELS]}
                  </Badge>
                )}
                <Badge className={getStatusColor(task.status, !!isOverdue)}>
                  {isOverdue ? 'באיחור' : TASK_STATUSES[task.status as keyof typeof TASK_STATUSES]}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>{task.owner_name}</span>
                {task.owner_phone && (
                  <span className="text-xs">({task.owner_phone})</span>
                )}
              </div>
              {dueDate && (
                <div className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-orange-600 font-medium' : ''
                }`}>
                  <Calendar className="h-4 w-4" />
                  <span>יעד: {formatHebrewDate(dueDate)}</span>
                  {isOverdue && <AlertCircle className="h-4 w-4 text-red-600" />}
                  {isToday && <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">היום</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tags for full variant */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">תגיות</h4>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                  className="text-sm font-normal"
                >
                  {tag.emoji && <span className="ml-1">{tag.emoji}</span>}
                  {tag.name_he}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {task.description && (
          <div>
            <h4 className="font-medium text-sm mb-2">תיאור המשימה</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Progress and Follow-ups */}
        {(task.follow_up_count > 0 || task.completed_at) && (
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">מעקב ותהליך</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {task.follow_up_count > 0 && (
                <div className="flex justify-between">
                  <span>מעקבים:</span>
                  <span>{task.follow_up_count} פעמים</span>
                </div>
              )}
              {task.completed_at && (
                <div className="flex justify-between">
                  <span>הושלם ב:</span>
                  <span>{formatHebrewDate(task.completed_at)}</span>
                </div>
              )}
              {task.completed_by && (
                <div className="flex justify-between">
                  <span>הושלם על ידי:</span>
                  <span>{task.completed_by}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attachments */}
        {task.attachment_urls && task.attachment_urls.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">קבצים מצורפים</h4>
            <div className="space-y-1">
              {task.attachment_urls.slice(0, 3).map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 block truncate"
                >
                  📎 קובץ מצורף {index + 1}
                </a>
              ))}
              {task.attachment_urls.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ועוד {task.attachment_urls.length - 3} קבצים...
                </p>
              )}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm">
              <Link href={`/tasks/${task.id}`}>
                צפייה מלאה
              </Link>
            </Button>

            {task.status !== 'completed' && onComplete && (
              <Button variant="outline" size="sm" onClick={handleCompletionClick}>
                <CheckSquare className="h-4 w-4 ml-2" />
                {task.status === 'pending' ? 'התחל עבודה' : 'סיים משימה'}
              </Button>
            )}

            {availableTags.length > 0 && (
              <QuickTagEditor
                task={task}
                availableTags={availableTags}
                onTagsUpdated={onTagsUpdated}
              />
            )}

            <ShareButton shareData={formatTaskShareData(task)} variant="ghost" size="sm" />

            {task.owner_phone && (
              <Button variant="ghost" asChild size="sm">
                <Link href={`https://wa.me/972${task.owner_phone.replace(/^0/, '')}`}>
                  שלח הודעה ב-WhatsApp
                </Link>
              </Button>
            )}

            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                עריכה
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>

    <TaskCompletionDialog
      open={showCompletionDialog}
      onOpenChange={setShowCompletionDialog}
      onConfirm={handleConfirmCompletion}
      taskTitle={task.title}
    />
  </>
  )
}