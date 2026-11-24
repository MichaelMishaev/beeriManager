'use client'

import { useState, useEffect, useRef } from 'react'
import { Trash2, Calendar, Users, Copy, Check, FileDown, Lightbulb } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { he, ru } from 'date-fns/locale'
import {
  AdminEmptyState,
  AdminFormSection,
  AdminGroup,
  AdminPageHeader,
  StatusPill,
} from '@/components/features/admin'
// html2canvas and jspdf loaded dynamically in handleExportPDF
import type { Meeting, MeetingIdea } from '@/types'

interface PageProps {
  params: { id: string; locale: string }
}

type DiscussionStatus = 'pending' | 'discussed' | 'decided'

const statusTone = {
  decided: 'success',
  discussed: 'info',
  pending: 'warning',
} as const

export default function ManageMeetingPage({ params }: PageProps) {
  const t = useTranslations('admin.records.meetings.detail')
  const locale = useLocale()
  const dateLocale = locale === 'ru' ? ru : he
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [ideas, setIdeas] = useState<MeetingIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMeetingData()
  }, [params.id])

  async function fetchMeetingData() {
    setIsLoading(true)
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/meetings/${params.id}/ideas?_t=${timestamp}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setMeeting(data.data.meeting)
        setIdeas(data.data.ideas)
      } else {
        toast.error(t('notFound'))
      }
    } catch (error) {
      console.error('Error fetching meeting:', error)
      toast.error(t('loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteIdea(ideaId: string) {
    if (!confirm(t('confirmDeleteIdea'))) {
      return
    }

    try {
      const response = await fetch(`/api/meetings/${params.id}/ideas/${ideaId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('ideaDeleted'))
        fetchMeetingData()
      } else {
        toast.error(t('ideaDeleteError'))
      }
    } catch (error) {
      console.error('Error deleting idea:', error)
      toast.error(t('ideaDeleteError'))
    }
  }

  async function copyLink() {
    const publicUrl = `${window.location.origin}/${params.locale}/meetings/${meeting?.id}`
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success(t('linkCopied'))
    setTimeout(() => setCopied(false), 2000)
  }

  async function updateIdeaStatus(ideaId: string, status: DiscussionStatus) {
    setUpdatingId(ideaId)
    try {
      const res = await fetch(`/api/meetings/${params.id}/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discussion_status: status })
      })
      const result = await res.json()
      if (result.success) {
        setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, discussion_status: status } : i))
      } else {
        toast.error(t('statusUpdateError'))
      }
    } catch {
      toast.error(t('statusUpdateError'))
    } finally {
      setUpdatingId(null)
    }
  }

  async function exportToPDF() {
    if (!meeting || ideas.length === 0 || !printRef.current) {
      toast.error(t('noIdeasToExport'))
      return
    }

    try {
      toast.loading(t('preparingPdf'))

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      // Capture the print content as canvas
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 297 // A4 width in mm (landscape)
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Create PDF in landscape mode
      const pdf = new jsPDF({
        orientation: imgHeight > 210 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageWidth = pdf.internal.pageSize.getWidth()
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename
      const fileName = `${meeting.title}_${t('pdf.fileSuffix')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`

      // Save PDF
      pdf.save(fileName)

      toast.dismiss()
      toast.success(t('pdfExported'))
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error(t('pdfError'))
    }
  }

  if (isLoading || !meeting) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('loadingTitle')} backHref="/admin/meetings" />
        <div className="rounded-2xl bg-white py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#0D98BA] border-t-transparent" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const publicUrl = `${window.location.origin}/${params.locale}/meetings/${meeting.id}`
  const statusLabels: Record<DiscussionStatus, string> = {
    pending: t('statusPending'),
    discussed: t('statusDiscussed'),
    decided: t('statusDecided'),
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title={meeting.title} backHref="/admin/meetings" />

      <div className="flex flex-wrap items-center gap-3 px-1 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          {format(new Date(meeting.meeting_date), 'PPP', { locale: dateLocale })}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" aria-hidden="true" />
          {t('ideasCount', { count: ideas.length })}
        </span>
        <StatusPill tone={meeting.is_open ? 'success' : 'neutral'}>
          {meeting.is_open ? t('open') : t('closed')}
        </StatusPill>
      </div>

      <AdminFormSection title={t('linkTitle')}>
        <div className="flex items-center gap-2">
          <Input
            value={publicUrl}
            readOnly
            dir="ltr"
            className="h-11 font-mono text-sm"
          />
          <Button
            variant="outline"
            onClick={copyLink}
            aria-label={t('copyLink')}
            className="h-11 w-11 flex-none p-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </AdminFormSection>

      {ideas.length > 0 && (
        <Button
          variant="outline"
          onClick={exportToPDF}
          className="h-11 w-full gap-2 bg-white"
        >
          <FileDown className="h-4 w-4" aria-hidden="true" />
          {t('exportPdf')}
        </Button>
      )}

      {ideas.length === 0 ? (
        <AdminEmptyState icon={Lightbulb} title={t('noIdeas')} />
      ) : (
        <AdminGroup title={t('ideasTitle', { count: ideas.length })}>
          {ideas.map((idea, index) => {
            const current: DiscussionStatus = idea.discussion_status ?? 'pending'
            return (
              <div key={idea.id} className="flex items-start gap-2 px-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h4 className="text-[14.5px] font-semibold text-[#003153]">
                      {index + 1}. {idea.title}
                    </h4>
                    {idea.is_anonymous && (
                      <StatusPill tone="neutral">{t('anonymous')}</StatusPill>
                    )}
                  </div>

                  {idea.description && (
                    <p className="mb-2 text-sm text-gray-500">{idea.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    {!idea.is_anonymous && idea.submitter_name && (
                      <span>{t('submittedBy', { name: idea.submitter_name })}</span>
                    )}
                    <span>
                      {format(new Date(idea.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>

                  {/* Discussion status controls */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone={statusTone[current]}>{statusLabels[current]}</StatusPill>
                    <div className="flex flex-wrap gap-1">
                      {(['pending', 'discussed', 'decided'] as const).map((s) => (
                        <Button
                          key={s}
                          variant="outline"
                          size="sm"
                          disabled={updatingId === idea.id || current === s}
                          onClick={() => updateIdeaStatus(idea.id, s)}
                          className={`min-h-[44px] px-3 text-xs ${current === s ? 'bg-primary/10' : ''}`}
                        >
                          {statusLabels[s]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteIdea(idea.id)}
                  aria-label={t('deleteIdea')}
                  className="h-11 w-11 flex-none p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )
          })}
        </AdminGroup>
      )}

      {/* Hidden print content for PDF export */}
      <div
        ref={printRef}
        className="fixed -left-[9999px] top-0 w-[1200px] bg-white p-8"
        dir={locale === 'ru' ? 'ltr' : 'rtl'}
      >
        <div className="mb-6">
          <h1 className="mb-4 text-center text-3xl font-bold">{meeting.title}</h1>
          <div className="space-y-1 text-start text-sm text-gray-600">
            <p>{t('pdf.meetingDate')}: {format(new Date(meeting.meeting_date), 'dd/MM/yyyy', { locale: dateLocale })}</p>
            <p>{t('pdf.exportDate')}: {format(new Date(), 'dd/MM/yyyy')}</p>
            <p>{t('pdf.totalIdeas')}: {ideas.length}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 p-3 text-start">{t('pdf.number')}</th>
              <th className="border border-gray-300 p-3 text-start">{t('pdf.title')}</th>
              <th className="border border-gray-300 p-3 text-start">{t('pdf.description')}</th>
              <th className="border border-gray-300 p-3 text-start">{t('pdf.submitter')}</th>
              <th className="border border-gray-300 p-3 text-start">{t('pdf.dateTime')}</th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea, index) => (
              <tr key={idea.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 text-start">{index + 1}</td>
                <td className="border border-gray-300 p-3 text-start font-semibold">{idea.title}</td>
                <td className="border border-gray-300 p-3 text-start">{idea.description || '-'}</td>
                <td className="border border-gray-300 p-3 text-start">
                  {idea.is_anonymous ? t('anonymous') : (idea.submitter_name || t('anonymous'))}
                </td>
                <td className="border border-gray-300 p-3 text-start">
                  {format(new Date(idea.created_at), 'dd/MM/yyyy HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
