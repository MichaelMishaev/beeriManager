'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { Tag } from './Tag'
import type { Tag as TagType } from '@/types'

interface TagManagerProps {
  tags: TagType[]
  onRefresh?: () => void
}

export function TagManager({ tags, onRefresh }: TagManagerProps) {
  const router = useRouter()
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [deletingTag, setDeletingTag] = useState<TagType | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshData = () => {
    if (onRefresh) {
      onRefresh()
    }
    router.refresh()
  }

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    name_he: '',
    emoji: '',
    color: '#0D98BA',
    description: '',
    display_order: 0
  })

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      name_he: '',
      emoji: '',
      color: '#0D98BA',
      description: '',
      display_order: 0
    })
    setEditingTag(null)
    setShowCreateDialog(false)
  }

  // Load tag data into form
  const loadTagIntoForm = (tag: TagType) => {
    setFormData({
      name: tag.name,
      name_he: tag.name_he,
      emoji: tag.emoji || '',
      color: tag.color,
      description: tag.description || '',
      display_order: tag.display_order
    })
    setEditingTag(tag)
    setShowCreateDialog(true)
  }

  // Create tag
  const handleCreate = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        resetForm()
        refreshData()
      } else {
        alert(result.error || 'שגיאה ביצירת התגית')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
      alert('שגיאה ביצירת התגית')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update tag
  const handleUpdate = async () => {
    if (!editingTag) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        resetForm()
        refreshData()
      } else {
        alert(result.error || 'שגיאה בעדכון התגית')
      }
    } catch (error) {
      console.error('Error updating tag:', error)
      alert('שגיאה בעדכון התגית')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete tag
  const handleDelete = async () => {
    if (!deletingTag) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tags/${deletingTag.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setDeletingTag(null)
        refreshData()
      } else {
        alert(result.error || 'שגיאה במחיקת התגית')
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert('שגיאה במחיקת התגית')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ניהול תגיות</h2>
          <p className="text-muted-foreground">
            צור וערוך תגיות לקטגוריזציה של משימות
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 ml-2" />
          תגית חדשה
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-muted-foreground">סה&quot;כ תגיות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tags.filter(t => t.is_system).length}
            </div>
            <p className="text-xs text-muted-foreground">תגיות מערכת</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tags.reduce((sum, t) => sum + t.task_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">שימושים</p>
          </CardContent>
        </Card>
      </div>

      {/* Tags list */}
      <Card>
        <CardHeader>
          <CardTitle>תגיות קיימות</CardTitle>
          <CardDescription>
            לחץ על תגית לעריכה או מחיקה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Tag tag={tag} size="md" />
                  <span className="text-sm text-muted-foreground">
                    {tag.task_count} משימות
                  </span>
                  {tag.is_system && (
                    <Badge variant="secondary" className="text-xs">
                      מערכת
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadTagIntoForm(tag)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingTag(tag)}
                    disabled={tag.is_system}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'עריכת תגית' : 'תגית חדשה'}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? `עריכת התגית "${editingTag.name_he}"`
                : 'צור תגית חדשה לקטגוריזציה של משימות'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-right">
                  שם באנגלית *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="maintenance"
                  className="text-right"
                  disabled={editingTag?.is_system}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  אותיות קטנות, מקף, מקף תחתון
                </p>
              </div>

              <div>
                <Label htmlFor="name_he" className="text-right">
                  שם בעברית *
                </Label>
                <Input
                  id="name_he"
                  value={formData.name_he}
                  onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                  placeholder="תחזוקה"
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emoji" className="text-right">
                  אמוג&apos;י (אופציונלי)
                </Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🔧"
                  className="text-right text-xl"
                  maxLength={2}
                />
              </div>

              <div>
                <Label htmlFor="color" className="text-right">
                  צבע *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-16"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#0D98BA"
                    className="text-right flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-right">
                תיאור
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="תיאור התגית..."
                className="text-right"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="display_order" className="text-right">
                סדר תצוגה
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="text-right"
              />
            </div>

            {/* Preview */}
            <div className="pt-4 border-t">
              <Label className="text-right mb-2 block">תצוגה מקדימה</Label>
              <Tag
                tag={{
                  id: 'preview',
                  name: formData.name,
                  name_he: formData.name_he,
                  emoji: formData.emoji,
                  color: formData.color,
                  description: formData.description,
                  display_order: formData.display_order,
                  task_count: 0,
                  is_system: false,
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  version: 1
                }}
                size="md"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button
              onClick={editingTag ? handleUpdate : handleCreate}
              disabled={isSubmitting || !formData.name || !formData.name_he}
            >
              {isSubmitting ? 'שומר...' : editingTag ? 'עדכן' : 'צור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTag} onOpenChange={() => setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">מחיקת תגית</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {deletingTag?.is_system ? (
                <div className="flex items-start gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    לא ניתן למחוק תגית מערכת. תגיות מערכת הן חלק בסיסי מהמערכת.
                  </div>
                </div>
              ) : (
                <>
                  האם אתה בטוח שברצונך למחוק את התגית &quot;{deletingTag?.name_he}&quot;?
                  {deletingTag && deletingTag.task_count > 0 && (
                    <div className="mt-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4 inline ml-1" />
                      התגית משמשת ב-{deletingTag.task_count} משימות והיא תוסר מהן.
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTag(null)}>
              ביטול
            </AlertDialogCancel>
            {!deletingTag?.is_system && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                variant="destructive"
              >
                {isSubmitting ? 'מוחק...' : 'מחק'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
