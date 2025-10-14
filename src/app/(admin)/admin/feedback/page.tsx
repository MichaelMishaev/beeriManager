'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Star, Calendar, User, Mail, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Feedback {
  id: string
  category: 'general' | 'event' | 'task' | 'suggestion' | 'complaint' | 'other'
  subject: string
  message: string
  rating?: number
  parent_name?: string
  contact_email?: string
  is_anonymous: boolean
  status: 'new' | 'read' | 'responded'
  response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

const categoryLabels = {
  general: 'כללי',
  event: 'אירוע',
  task: 'משימה',
  suggestion: 'הצעה',
  complaint: 'תלונה',
  other: 'אחר'
}

const categoryColors = {
  general: 'bg-blue-100 text-blue-800',
  event: 'bg-purple-100 text-purple-800',
  task: 'bg-green-100 text-green-800',
  suggestion: 'bg-yellow-100 text-yellow-800',
  complaint: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800'
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  responded: 'bg-green-100 text-green-800'
}

const statusLabels = {
  new: 'חדש',
  read: 'נקרא',
  responded: 'נענה'
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchFeedbacks()
  }, [selectedCategory, selectedStatus])

  async function fetchFeedbacks() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`/api/feedback?${params}`)
      const data = await response.json()

      if (data.success) {
        setFeedbacks(data.data)
      } else {
        toast.error('שגיאה בטעינת המשובים')
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      toast.error('שגיאה בטעינת המשובים')
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      const response = await fetch(`/api/feedback/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'read' })
      })

      if (response.ok) {
        setFeedbacks(prev => prev.map(f =>
          f.id === id ? { ...f, status: 'read' } : f
        ))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    suggestions: feedbacks.filter(f => f.category === 'suggestion').length,
    complaints: feedbacks.filter(f => f.category === 'complaint').length,
    averageRating: feedbacks.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) /
                   feedbacks.filter(f => f.rating).length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ניהול משובים</h1>
        <p className="text-muted-foreground mt-2">
          צפייה וניהול משובים מהורים
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה"כ משובים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.new} חדשים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">הצעות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suggestions}</div>
            <p className="text-xs text-muted-foreground">
              הצעות לשיפור
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">תלונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complaints}</div>
            <p className="text-xs text-muted-foreground">
              דורשות התייחסות
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">דירוג ממוצע</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.averageRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              מתוך 5.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>סינון משובים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">טוען משובים...</p>
            </CardContent>
          </Card>
        ) : feedbacks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">אין משובים להצגה</p>
            </CardContent>
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              className={cn(
                'transition-all',
                feedback.status === 'new' && 'border-primary'
              )}
              onClick={() => feedback.status === 'new' && markAsRead(feedback.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{feedback.subject}</CardTitle>
                      <Badge className={categoryColors[feedback.category]}>
                        {categoryLabels[feedback.category]}
                      </Badge>
                      <Badge className={statusColors[feedback.status]}>
                        {statusLabels[feedback.status]}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(feedback.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                        {feedback.is_anonymous ? (
                          <span className="text-muted-foreground">משוב אנונימי</span>
                        ) : (
                          <>
                            {feedback.parent_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {feedback.parent_name}
                              </span>
                            )}
                            {feedback.contact_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {feedback.contact_email}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  {feedback.rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < feedback.rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{feedback.message}</p>
                {feedback.response && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">תגובת הועד:</span>
                    </div>
                    <p className="text-sm">{feedback.response}</p>
                    {feedback.responded_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        נענה בתאריך: {format(new Date(feedback.responded_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}