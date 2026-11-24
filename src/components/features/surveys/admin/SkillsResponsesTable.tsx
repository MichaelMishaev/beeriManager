'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Trash2, ClipboardList } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { ParentSkillResponse } from '@/types/parent-skills'
import { useToast } from '@/hooks/use-toast'
import { AdminEmptyState, StatusPill } from '@/components/features/admin'

interface Props {
  responses: ParentSkillResponse[]
  isLoading: boolean
  onResponseDeleted?: () => void
}

export function SkillsResponsesTable({ responses, isLoading, onResponseDeleted }: Props) {
  const t = useTranslations('admin.inbox.survey')
  const locale = useLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'he-IL'
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const formatPhoneForWhatsApp = (phone: string | null): string => {
    if (!phone) return ''
    // Remove non-digits and add 972 prefix if needed
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      return '972' + cleaned.substring(1)
    }
    return cleaned
  }

  const handleDeleteClick = (responseId: string) => {
    setResponseToDelete(responseId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!responseToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/surveys/skills/${responseToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || t('deleteError'))
      }

      toast({
        title: t('deleteSuccess'),
        variant: 'default',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setResponseToDelete(null)

      // Notify parent component to refresh data
      if (onResponseDeleted) {
        onResponseDeleted()
      }
    } catch (error) {
      console.error('Error deleting response:', error)
      toast({
        title: t('deleteError'),
        description: error instanceof Error ? error.message : t('tryAgain'),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-gray-500">{t('loading')}</div>
  }

  if (!responses.length) {
    return <AdminEmptyState icon={ClipboardList} title={t('empty')} />
  }

  return (
    <>
      <div className="divide-y divide-[#eef0f2] overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        {responses.map((response) => {
          const expanded = expandedRow === response.id
          return (
            <div key={response.id} className="p-3">
              {/* Summary (tap to expand) */}
              <button
                type="button"
                onClick={() => toggleRow(response.id)}
                aria-expanded={expanded}
                className="flex min-h-[44px] w-full items-start gap-2 text-start"
              >
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14.5px] font-semibold text-[#003153]">
                      {response.parent_name || <span className="italic text-gray-400">{t('anonymous')}</span>}
                    </span>
                    {response.student_grade && <StatusPill tone="info">{response.student_grade}</StatusPill>}
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {response.skills.slice(0, 3).map((skill) => (
                      <StatusPill key={skill} tone="neutral">
                        {t(`skills.${skill}`)}
                      </StatusPill>
                    ))}
                    {response.skills.length > 3 && <StatusPill tone="info">+{response.skills.length - 3}</StatusPill>}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                    <span>{t(`contact.${response.preferred_contact}`)}</span>
                    {response.phone_number && (
                      <span className="font-mono" dir="ltr">
                        {response.phone_number}
                      </span>
                    )}
                  </span>
                </span>
                {expanded ? (
                  <ChevronUp className="mt-1 h-4 w-4 flex-none text-[#b6bcc4]" aria-hidden="true" />
                ) : (
                  <ChevronDown className="mt-1 h-4 w-4 flex-none text-[#b6bcc4]" aria-hidden="true" />
                )}
              </button>

              {/* Actions */}
              <div className="mt-2 flex flex-wrap gap-2">
                {response.phone_number && (
                  <>
                    <Button size="sm" variant="outline" className="min-h-[44px] min-w-[44px]" asChild>
                      <a href={`tel:${response.phone_number}`} aria-label={t('callAction')}>
                        <Phone className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="min-h-[44px] min-w-[44px] bg-green-50 hover:bg-green-100" asChild>
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsApp(response.phone_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('whatsappAction')}
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                      </a>
                    </Button>
                  </>
                )}
                {response.email && (
                  <Button size="sm" variant="outline" className="min-h-[44px] min-w-[44px]" asChild>
                    <a href={`mailto:${response.email}`} aria-label={t('emailAction')}>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px] min-w-[44px] bg-red-50 hover:bg-red-100"
                  onClick={() => handleDeleteClick(response.id)}
                  aria-label={t('deleteAction')}
                >
                  <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                </Button>
              </div>

              {/* Expanded Details */}
              {expanded && (
                <div className="mt-3 space-y-3 rounded-xl bg-[#f1f2f4] p-3">
                  <div>
                    <span className="text-sm font-semibold">{t('allSkillsLabel')}</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {response.skills.map((skill) => (
                        <StatusPill key={skill} tone="neutral">
                          {t(`skills.${skill}`)}
                        </StatusPill>
                      ))}
                    </div>
                  </div>

                  {response.other_specialty && response.skills.includes('other') && (
                    <div>
                      <span className="text-sm font-semibold">{t('otherDetails')}</span>
                      <p className="mt-1 rounded border border-yellow-200 bg-yellow-50 p-2 text-sm text-gray-700">
                        {response.other_specialty}
                      </p>
                    </div>
                  )}

                  {response.email && (
                    <div>
                      <span className="text-sm font-semibold">{t('emailLabel')}</span>
                      <p className="break-all text-sm" dir="ltr">
                        {response.email}
                      </p>
                    </div>
                  )}

                  {response.additional_notes && (
                    <div>
                      <span className="text-sm font-semibold">{t('notesLabel')}</span>
                      <p className="mt-1 text-sm text-gray-700">{response.additional_notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {t('submittedAt', {
                      date: new Date(response.created_at).toLocaleDateString(dateLocale),
                      time: new Date(response.created_at).toLocaleTimeString(dateLocale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
