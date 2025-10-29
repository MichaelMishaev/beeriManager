'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Maximize2, Minimize2, Calendar } from 'lucide-react'
import { formatHebrewDate } from '@/lib/utils/date'
import Link from 'next/link'

interface FeedbackDisplayProps {
  feedback: {
    id: string
    message: string
    category: string
    created_at: string
  }
}

const categoryLabels: Record<string, string> = {
  general: 'כללי',
  event: 'אירוע',
  task: 'משימה',
  suggestion: 'הצעה',
  complaint: 'פניה',
  other: 'אחר'
}

const categoryColors: Record<string, string> = {
  general: 'bg-blue-100 text-blue-800',
  event: 'bg-purple-100 text-purple-800',
  task: 'bg-green-100 text-green-800',
  suggestion: 'bg-yellow-100 text-yellow-800',
  complaint: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800'
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-sm text-amber-900">נוצר ממשוב הורים</CardTitle>
            <Badge className={categoryColors[feedback.category] || 'bg-gray-100 text-gray-800'}>
              {categoryLabels[feedback.category] || feedback.category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">תוכן המשוב:</p>
          <p className={`text-sm text-amber-900 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {feedback.message}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-amber-200">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>נשלח: {formatHebrewDate(new Date(feedback.created_at))}</span>
          </div>
          <Link
            href={`/admin/feedback`}
            className="text-amber-700 hover:underline font-medium"
          >
            צפה במשובים ←
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
