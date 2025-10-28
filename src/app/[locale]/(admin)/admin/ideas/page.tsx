'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Calendar, User, Mail, CheckCircle, FileText, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Idea {
  id: string
  category: 'improvement' | 'feature' | 'process' | 'other'
  title: string
  description: string
  submitter_name?: string
  contact_email?: string
  is_anonymous: boolean
  status: 'new' | 'reviewed' | 'approved' | 'implemented' | 'rejected'
  admin_notes?: string
  response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

const categoryLabels = {
  improvement: 'שיפור',
  feature: 'תכונה חדשה',
  process: 'תהליך',
  other: 'אחר'
}

const categoryColors = {
  improvement: 'bg-blue-100 text-blue-800',
  feature: 'bg-purple-100 text-purple-800',
  process: 'bg-green-100 text-green-800',
  other: 'bg-gray-100 text-gray-800'
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  reviewed: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  implemented: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-800'
}

const statusLabels = {
  new: 'חדש',
  reviewed: 'נבדק',
  approved: 'מאושר',
  implemented: 'יושם',
  rejected: 'נדחה'
}

export default function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [editResponse, setEditResponse] = useState('')
  const [editAdminNotes, setEditAdminNotes] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchIdeas()
  }, [selectedCategory, selectedStatus])

  async function fetchIdeas() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`/api/ideas?${params}`)
      const data = await response.json()

      if (data.success) {
        setIdeas(data.data)
      } else {
        toast.error('שגיאה בטעינת הרעיונות')
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
      toast.error('שגיאה בטעינת הרעיונות')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateIdeaStatus(id: string, status: string, response?: string, adminNotes?: string) {
    try {
      const apiResponse = await fetch(`/api/ideas/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          response: response || null,
          admin_notes: adminNotes || null
        })
      })

      if (apiResponse.ok) {
        const result = await apiResponse.json()
        setIdeas(prev => prev.map(i =>
          i.id === id ? result.data : i
        ))
        toast.success('הסטטוס עודכן בהצלחה')
        setEditingId(null)
      } else {
        toast.error('שגיאה בעדכון הסטטוס')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('שגיאה בעדכון הסטטוס')
    }
  }

  function startEditing(idea: Idea) {
    setEditingId(idea.id)
    setEditStatus(idea.status)
    setEditResponse(idea.response || '')
    setEditAdminNotes(idea.admin_notes || '')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditStatus('')
    setEditResponse('')
    setEditAdminNotes('')
  }

  function saveChanges(id: string) {
    updateIdeaStatus(id, editStatus, editResponse, editAdminNotes)
  }

  async function deleteIdea(id: string) {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Remove from list
        setIdeas(prev => prev.filter(i => i.id !== id))
        toast.success('הרעיון נמחק בהצלחה')
        setDeleteConfirmId(null)
      } else {
        toast.error(result.error || 'שגיאה במחיקת הרעיון')
      }
    } catch (error) {
      console.error('Error deleting idea:', error)
      toast.error('שגיאה במחיקת הרעיון')
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = {
    total: ideas.length,
    new: ideas.filter(i => i.status === 'new').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    implemented: ideas.filter(i => i.status === 'implemented').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-amber-500" />
          ניהול רעיונות
        </h1>
        <p className="text-muted-foreground mt-2">
          צפייה וניהול רעיונות מהורים
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה"כ רעיונות</CardTitle>
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
            <CardTitle className="text-sm font-medium">חדשים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
            <p className="text-xs text-muted-foreground">
              ממתינים לבדיקה
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">מאושרים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              לתכנון יישום
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">יושמו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.implemented}</div>
            <p className="text-xs text-muted-foreground">
              רעיונות שיושמו
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>סינון רעיונות</CardTitle>
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

      {/* Ideas List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">טוען רעיונות...</p>
            </CardContent>
          </Card>
        ) : ideas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">אין רעיונות להצגה</p>
            </CardContent>
          </Card>
        ) : (
          ideas.map((idea) => (
            <Card
              key={idea.id}
              className={cn(
                'transition-all',
                idea.status === 'new' && 'border-amber-500 border-2'
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <Badge className={categoryColors[idea.category]}>
                        {categoryLabels[idea.category]}
                      </Badge>
                      <Badge className={statusColors[idea.status]}>
                        {statusLabels[idea.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(idea.created_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                      {idea.is_anonymous ? (
                        <span className="text-muted-foreground">רעיון אנונימי</span>
                      ) : (
                        <>
                          {idea.submitter_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {idea.submitter_name}
                            </span>
                          )}
                          {idea.contact_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {idea.contact_email}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{idea.description}</p>

                {/* Edit Mode */}
                {editingId === idea.id ? (
                  <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium mb-1 block">שינוי סטטוס</label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">תגובה למשלח (אופציונלי)</label>
                      <Textarea
                        value={editResponse}
                        onChange={(e) => setEditResponse(e.target.value)}
                        placeholder="תגובה שתוצג למשלח הרעיון..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">הערות פנימיות (לא יוצגו להורים)</label>
                      <Textarea
                        value={editAdminNotes}
                        onChange={(e) => setEditAdminNotes(e.target.value)}
                        placeholder="הערות פנימיות למנהלים..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => saveChanges(idea.id)} size="sm">
                        שמור שינויים
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" size="sm">
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Admin Notes */}
                    {idea.admin_notes && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">הערות פנימיות:</span>
                        </div>
                        <p className="text-sm text-yellow-800">{idea.admin_notes}</p>
                      </div>
                    )}

                    {/* Response */}
                    {idea.response && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">תגובת הועד:</span>
                        </div>
                        <p className="text-sm">{idea.response}</p>
                        {idea.responded_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            נענה בתאריך: {format(new Date(idea.responded_at), 'dd/MM/yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => startEditing(idea)} size="sm" variant="outline">
                        עריכה
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirmId(idea.id)}
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        מחק
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הרעיון לצמיתות ולא ניתן יהיה לשחזר אותו.
              האם אתה בטוח שברצונך להמשיך?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteIdea(deleteConfirmId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'מוחק...' : 'מחק'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
