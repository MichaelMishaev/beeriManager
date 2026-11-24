'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Calendar, User, Mail, CheckCircle, FileText, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
import { AdminEmptyState, AdminFormSection, StatusPill } from '@/components/features/admin'

type IdeaCategory = 'improvement' | 'feature' | 'process' | 'other'
type IdeaStatus = 'new' | 'reviewed' | 'approved' | 'implemented' | 'rejected'
type PillTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info'

interface Idea {
  id: string
  category: IdeaCategory
  title: string
  description: string
  submitter_name?: string
  contact_email?: string
  is_anonymous: boolean
  status: IdeaStatus
  admin_notes?: string
  response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

const CATEGORIES: IdeaCategory[] = ['improvement', 'feature', 'process', 'other']
const STATUSES: IdeaStatus[] = ['new', 'reviewed', 'approved', 'implemented', 'rejected']

const categoryTones: Record<IdeaCategory, PillTone> = {
  improvement: 'info',
  feature: 'info',
  process: 'success',
  other: 'neutral',
}

const statusTones: Record<IdeaStatus, PillTone> = {
  new: 'info',
  reviewed: 'neutral',
  approved: 'success',
  implemented: 'warning',
  rejected: 'danger',
}

export function IdeasPanel() {
  const t = useTranslations('admin.inbox.ideas')

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        toast.error(t('loadError'))
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
      toast.error(t('loadError'))
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
        toast.success(t('statusUpdated'))
        setEditingId(null)
      } else {
        toast.error(t('statusError'))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(t('statusError'))
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
        toast.success(t('deleted'))
        setDeleteConfirmId(null)
      } else {
        toast.error(result.error || t('deleteError'))
      }
    } catch (error) {
      console.error('Error deleting idea:', error)
      toast.error(t('deleteError'))
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
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#eef0f2] shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:grid-cols-4">
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsTotal')}</p>
          <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.total}</p>
          <p className="text-xs text-gray-500">{t('statsNew', { count: stats.new })}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsNewTitle')}</p>
          <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.new}</p>
          <p className="text-xs text-gray-500">{t('statsNewHint')}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsApproved')}</p>
          <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.approved}</p>
          <p className="text-xs text-gray-500">{t('statsApprovedHint')}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t('statsImplemented')}</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.implemented}</p>
          <p className="text-xs text-gray-500">{t('statsImplementedHint')}</p>
        </div>
      </div>

      {/* Filters */}
      <AdminFormSection title={t('filterTitle')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories')}</SelectItem>
              {CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`category.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              {STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`status.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminFormSection>

      {/* Ideas List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#0D98BA] border-t-transparent" />
            <p className="text-sm text-gray-500">{t('loading')}</p>
          </div>
        ) : ideas.length === 0 ? (
          <AdminEmptyState icon={Lightbulb} title={t('empty')} />
        ) : (
          ideas.map((idea) => (
            <article
              key={idea.id}
              className={cn(
                'rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all',
                idea.status === 'new' && 'ring-2 ring-[#FFBA00]'
              )}
            >
              <div className="space-y-2">
                <h3 className="break-words text-[15px] font-bold text-[#003153]">{idea.title}</h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusPill tone={categoryTones[idea.category]}>
                    {t(`category.${idea.category}`)}
                  </StatusPill>
                  <StatusPill tone={statusTones[idea.status]}>
                    {t(`status.${idea.status}`)}
                  </StatusPill>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    {format(new Date(idea.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                  {idea.is_anonymous ? (
                    <span>{t('anonymous')}</span>
                  ) : (
                    <>
                      {idea.submitter_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" aria-hidden="true" />
                          {idea.submitter_name}
                        </span>
                      )}
                      {idea.contact_email && (
                        <span className="flex min-w-0 items-center gap-1">
                          <Mail className="h-3 w-3 flex-none" aria-hidden="true" />
                          <span className="break-all">{idea.contact_email}</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#003153]">{idea.description}</p>

              {/* Edit Mode */}
              {editingId === idea.id ? (
                <div className="mt-4 space-y-3 rounded-xl bg-[#f1f2f4] p-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">{t('changeStatus')}</label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`status.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">{t('responseLabel')}</label>
                    <Textarea
                      value={editResponse}
                      onChange={(e) => setEditResponse(e.target.value)}
                      placeholder={t('responsePlaceholder')}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">{t('notesLabel')}</label>
                    <Textarea
                      value={editAdminNotes}
                      onChange={(e) => setEditAdminNotes(e.target.value)}
                      placeholder={t('notesPlaceholder')}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => saveChanges(idea.id)} size="sm" className="min-h-[44px]">
                      {t('saveChanges')}
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm" className="min-h-[44px]">
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Admin Notes */}
                  {idea.admin_notes && (
                    <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                        <span className="text-sm font-medium text-yellow-900">{t('internalNotes')}</span>
                      </div>
                      <p className="text-sm text-yellow-800">{idea.admin_notes}</p>
                    </div>
                  )}

                  {/* Response */}
                  {idea.response && (
                    <div className="mt-4 rounded-xl bg-[#f1f2f4] p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                        <span className="text-sm font-medium">{t('committeeResponse')}</span>
                      </div>
                      <p className="text-sm">{idea.response}</p>
                      {idea.responded_at && (
                        <p className="mt-2 text-xs text-gray-500">
                          {t('respondedAt', { date: format(new Date(idea.responded_at), 'dd/MM/yyyy HH:mm') })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button onClick={() => startEditing(idea)} size="sm" variant="outline" className="min-h-[44px]">
                      {t('edit')}
                    </Button>
                    <Button
                      onClick={() => setDeleteConfirmId(idea.id)}
                      size="sm"
                      variant="destructive"
                      className="min-h-[44px] gap-1"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      {t('delete')}
                    </Button>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && deleteIdea(deleteConfirmId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
