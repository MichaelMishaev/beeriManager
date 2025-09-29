'use client'

import React from 'react'
import { AlertTriangle, CheckCircle, Clock, User, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatHebrewDate, getHebrewRelativeTime } from '@/lib/utils/date'
import type { Issue } from '@/types'
import Link from 'next/link'

interface IssueCardProps {
  issue: Issue
  variant?: 'full' | 'compact' | 'minimal'
  showActions?: boolean
  onStatusChange?: (status: string) => void
  onEdit?: () => void
  className?: string
}

const ISSUE_STATUSES = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  resolved: 'נפתר',
  closed: 'סגור',
  cancelled: 'בוטל'
}

const ISSUE_CATEGORIES = {
  maintenance: 'תחזוקה',
  safety: 'בטיחות',
  equipment: 'ציוד',
  facility: 'מתקן',
  communication: 'תקשורת',
  event: 'אירוע',
  admin: 'ניהול',
  other: 'אחר'
}

const PRIORITY_LEVELS = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  critical: 'קריטית'
}

export function IssueCard({
  issue,
  variant = 'full',
  showActions = true,
  onStatusChange,
  onEdit,
  className = ''
}: IssueCardProps) {
  const createdDate = new Date(issue.created_at)
  const isOverdue = false // Issues don't have due dates
  const isUrgent = issue.priority === 'critical' || isOverdue

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200'

    const colors = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || colors.open
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800 animate-pulse'
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      maintenance: 'bg-blue-100 text-blue-800',
      safety: 'bg-red-100 text-red-800',
      equipment: 'bg-purple-100 text-purple-800',
      facility: 'bg-green-100 text-green-800',
      communication: 'bg-yellow-100 text-yellow-800',
      event: 'bg-pink-100 text-pink-800',
      admin: 'bg-gray-100 text-gray-800',
      other: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const StatusIcon = issue.status === 'resolved' || issue.status === 'closed'
    ? CheckCircle
    : issue.status === 'in_progress'
    ? Clock
    : AlertTriangle

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow ${
        isUrgent ? 'border-r-4 border-r-red-500' : ''
      } ${className}`}>
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-1 rounded-full ${
            issue.status === 'resolved' || issue.status === 'closed'
              ? 'text-green-600'
              : isUrgent
              ? 'text-red-600'
              : 'text-orange-600'
          }`}>
            <StatusIcon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{issue.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{issue.reporter_name}</span>
              <span>•</span>
              <span>{getHebrewRelativeTime(createdDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(issue.priority)}>
            {PRIORITY_LEVELS[issue.priority as keyof typeof PRIORITY_LEVELS]}
          </Badge>
          {showActions && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/issues/${issue.id}`}>פרטים</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-lg transition-shadow ${className} ${
        isUrgent ? 'ring-2 ring-red-200' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full flex-shrink-0 ${
              issue.status === 'resolved' || issue.status === 'closed'
                ? 'text-green-600 bg-green-50'
                : isUrgent
                ? 'text-red-600 bg-red-50'
                : 'text-orange-600 bg-orange-50'
            }`}>
              <StatusIcon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base leading-tight">
                  {issue.title}
                </h3>
                <div className="flex gap-1 flex-shrink-0 mr-2">
                  <Badge className={getPriorityColor(issue.priority)}>
                    {PRIORITY_LEVELS[issue.priority as keyof typeof PRIORITY_LEVELS]}
                  </Badge>
                  <Badge className={getStatusColor(issue.status, !!isOverdue)}>
                    {isOverdue ? 'באיחור' : ISSUE_STATUSES[issue.status as keyof typeof ISSUE_STATUSES]}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{issue.reporter_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatHebrewDate(createdDate)}</span>
                </div>
              </div>


              {issue.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {issue.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                {issue.category && (
                  <Badge variant="outline" className={getCategoryColor(issue.category)}>
                    {ISSUE_CATEGORIES[issue.category as keyof typeof ISSUE_CATEGORIES]}
                  </Badge>
                )}
              </div>

              {showActions && (
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/issues/${issue.id}`}>פרטים</Link>
                  </Button>
                  {issue.status !== 'resolved' && issue.status !== 'closed' && onStatusChange && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange(issue.status === 'open' ? 'in_progress' : 'resolved')}
                    >
                      {issue.status === 'open' ? 'התחל טיפול' : 'סמן כנפתר'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full variant
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className} ${
      isUrgent ? 'ring-2 ring-red-200 shadow-lg' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg flex-shrink-0 ${
            issue.status === 'resolved' || issue.status === 'closed'
              ? 'text-green-600 bg-green-50'
              : isUrgent
              ? 'text-red-600 bg-red-50'
              : 'text-orange-600 bg-orange-50'
          }`}>
            <StatusIcon className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-xl">
                {issue.title}
              </CardTitle>
              <div className="flex flex-col gap-2 items-end flex-shrink-0 mr-2">
                <Badge variant={issue.priority === 'critical' ? 'destructive' : 'outline'}
                       className={getPriorityColor(issue.priority)}>
                  <AlertTriangle className="h-3 w-3 ml-1" />
                  {PRIORITY_LEVELS[issue.priority as keyof typeof PRIORITY_LEVELS]}
                </Badge>
                <Badge className={getStatusColor(issue.status, !!isOverdue)}>
                  {isOverdue ? 'באיחור' : ISSUE_STATUSES[issue.status as keyof typeof ISSUE_STATUSES]}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{issue.reporter_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>דווח: {formatHebrewDate(createdDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location and Category */}
        <div className="flex items-center gap-4 text-sm">
          {issue.category && (
            <Badge variant="outline" className={getCategoryColor(issue.category)}>
              {ISSUE_CATEGORIES[issue.category as keyof typeof ISSUE_CATEGORIES]}
            </Badge>
          )}
        </div>

        {/* Description */}
        {issue.description && (
          <div>
            <h4 className="font-medium text-sm mb-2">תיאור הבעיה</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {issue.description}
            </p>
          </div>
        )}

        {/* Assignment Info */}
        {(issue.assigned_to || issue.resolution) && (
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">מידע על הטיפול</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {issue.assigned_to && (
                <div className="flex justify-between">
                  <span>מטופל על ידי:</span>
                  <span>{issue.assigned_to}</span>
                </div>
              )}
              {issue.resolution && (
                <div>
                  <span className="font-medium">פתרון:</span>
                  <p className="text-xs mt-1">{issue.resolution}</p>
                </div>
              )}
              {issue.resolved_at && (
                <div className="flex justify-between">
                  <span>נפתר ב:</span>
                  <span>{formatHebrewDate(issue.resolved_at)}</span>
                </div>
              )}
            </div>
          </div>
        )}


        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild>
              <Link href={`/issues/${issue.id}`}>
                צפייה מלאה
              </Link>
            </Button>

            {issue.status !== 'resolved' && issue.status !== 'closed' && onStatusChange && (
              <Button
                variant="outline"
                onClick={() => onStatusChange(issue.status === 'open' ? 'in_progress' : 'resolved')}
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                {issue.status === 'open' ? 'התחל טיפול' : 'סמן כנפתר'}
              </Button>
            )}


            {onEdit && (
              <Button variant="ghost" onClick={onEdit}>
                עריכה
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}