'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, AlertTriangle, Tags as TagsIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminEmptyState, AdminGroup, AdminPageHeader } from '@/components/features/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  const t = useTranslations('admin.tasks.tags')
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
        alert(result.error || t('createError'))
      }
    } catch (error) {
      console.error('Error creating tag:', error)
      alert(t('createError'))
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
        alert(result.error || t('updateError'))
      }
    } catch (error) {
      console.error('Error updating tag:', error)
      alert(t('updateError'))
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
        alert(result.error || t('deleteError'))
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert(t('deleteError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const newTagButton = (
    <button
      type="button"
      onClick={() => setShowCreateDialog(true)}
      aria-label={t('newTag')}
      data-testid="admin-tags-new"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </button>
  )

  const stats = [
    { key: 'total', value: tags.length },
    { key: 'system', value: tags.filter(tag => tag.is_system).length },
    { key: 'usages', value: tags.reduce((sum, tag) => sum + tag.task_count, 0) },
  ] as const

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        backHref="/admin/more"
        action={newTagButton}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-[#eef0f2] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] rtl:divide-x-reverse">
        {stats.map((stat) => (
          <div key={stat.key} className="px-2 py-3 text-center">
            <div className="text-2xl font-bold text-[#003153]">{stat.value}</div>
            <p className="text-xs text-gray-500">{t(`stats.${stat.key}`)}</p>
          </div>
        ))}
      </div>

      {/* Tags list */}
      {tags.length === 0 ? (
        <AdminEmptyState icon={TagsIcon} title={t('empty')} />
      ) : (
        <AdminGroup title={t('existing')} description={t('existingHint')}>
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex min-h-[44px] items-center justify-between gap-2 px-3 py-2"
              data-testid="admin-tag-row"
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <Tag tag={tag} size="md" />
                <span className="text-sm text-gray-500">
                  {t('taskCount', { count: tag.task_count })}
                </span>
                {tag.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    {t('systemBadge')}
                  </Badge>
                )}
              </div>
              <div className="flex flex-none gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 p-0"
                  aria-label={t('editTag')}
                  onClick={() => loadTagIntoForm(tag)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 p-0"
                  aria-label={t('deleteTag')}
                  onClick={() => setDeletingTag(tag)}
                  disabled={tag.is_system}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </AdminGroup>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? t('dialog.editTitle') : t('dialog.newTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? t('dialog.editDescription', { name: editingTag.name_he })
                : t('dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-start">
                  {t('dialog.nameEn')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="maintenance"
                  className="text-start"
                  disabled={editingTag?.is_system}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('dialog.nameEnHint')}
                </p>
              </div>

              <div>
                <Label htmlFor="name_he" className="text-start">
                  {t('dialog.nameHe')}
                </Label>
                <Input
                  id="name_he"
                  value={formData.name_he}
                  onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                  placeholder={t('dialog.nameHePlaceholder')}
                  className="text-start"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emoji" className="text-start">
                  {t('dialog.emoji')}
                </Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🔧"
                  className="text-start text-xl"
                  maxLength={2}
                />
              </div>

              <div>
                <Label htmlFor="color" className="text-start">
                  {t('dialog.color')}
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
                    className="flex-1 text-start"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-start">
                {t('dialog.description')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('dialog.descriptionPlaceholder')}
                className="text-start"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="display_order" className="text-start">
                {t('dialog.displayOrder')}
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="text-start"
              />
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <Label className="mb-2 block text-start">{t('dialog.preview')}</Label>
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
              {t('dialog.cancel')}
            </Button>
            <Button
              onClick={editingTag ? handleUpdate : handleCreate}
              disabled={isSubmitting || !formData.name || !formData.name_he}
            >
              {isSubmitting ? t('dialog.saving') : editingTag ? t('dialog.update') : t('dialog.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTag} onOpenChange={() => setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {deletingTag?.is_system ? (
                <div className="flex items-start gap-2 text-red-600">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    {t('delete.systemBlocked')}
                  </div>
                </div>
              ) : (
                <>
                  {t('delete.confirm', { name: deletingTag?.name_he ?? '' })}
                  {deletingTag && deletingTag.task_count > 0 && (
                    <div className="mt-2 text-orange-600">
                      <AlertTriangle className="me-1 inline h-4 w-4" />
                      {t('delete.inUse', { count: deletingTag.task_count })}
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTag(null)}>
              {t('delete.cancel')}
            </AlertDialogCancel>
            {!deletingTag?.is_system && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                variant="destructive"
              >
                {isSubmitting ? t('delete.deleting') : t('delete.confirmButton')}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
