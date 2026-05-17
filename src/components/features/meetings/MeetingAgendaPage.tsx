'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Calendar, Share2, Send, Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Meeting, MeetingIdea } from '@/types'

const STATUS_CONFIG = {
  pending:   { label: 'ממתין',  className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  discussed: { label: 'נדון',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  decided:   { label: 'הוחלט', className: 'bg-green-100 text-green-800 border-green-200' },
} as const

const ideaSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').max(200, 'מקסימום 200 תווים'),
  submitter_name: z.string().min(1, 'יש להזין שם').max(100)
})

type IdeaFormData = z.infer<typeof ideaSchema>

interface Props {
  meetingId: string
  isAdmin: boolean
}

export function MeetingAgendaPage({ meetingId, isAdmin }: Props) {
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [ideas, setIdeas] = useState<MeetingIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema)
  })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/ideas?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await res.json()
      if (data.success) {
        setMeeting(data.data.meeting)
        setIdeas(data.data.ideas)
      }
    } catch {
      toast.error('שגיאה בטעינת נושאי הישיבה')
    } finally {
      setIsLoading(false)
    }
  }, [meetingId])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function onSubmit(data: IdeaFormData) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          submitter_name: data.submitter_name,
          is_anonymous: false,
          submission_locale: 'he'
        })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('הנושא נוסף בהצלחה')
      reset()
      await fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בהוספת הנושא')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateStatus(ideaId: string, status: 'pending' | 'discussed' | 'decided') {
    setUpdatingId(ideaId)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discussion_status: status })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, discussion_status: status } : i))
    } catch {
      toast.error('שגיאה בעדכון הסטטוס')
    } finally {
      setUpdatingId(null)
    }
  }

  function handleShare() {
    const url = window.location.href
    const text = encodeURIComponent(`היי! 📋\n\nהוסיפו נושאים לדיון בישיבת הועד:\n${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-[#0D98BA]" />
          <p className="text-gray-500 text-sm">טוען ישיבה...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <p className="text-red-500 font-medium">הישיבה לא נמצאה</p>
      </div>
    )
  }

  const isClosed = !meeting.is_open || meeting.status === 'closed' || meeting.status === 'completed'

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-[#003153] text-white px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-xl font-bold leading-tight">{meeting.title}</h1>
            <button onClick={handleShare} className="shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            {meeting.meeting_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(meeting.meeting_date), 'PP', { locale: he })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {ideas.length} נושאים
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Submission form */}
        {isClosed ? (
          <div className="bg-white rounded-xl border p-5 text-center text-gray-500">
            <p className="font-medium">ישיבה זו הסתיימה</p>
            <p className="text-sm mt-1">לא ניתן להוסיף נושאים חדשים</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 text-base">+ הוסף נושא לדיון</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  נושא <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="על מה תרצו לדבר בישיבה?"
                  className={`mt-1 ${errors.title ? 'border-red-400' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="submitter_name" className="text-sm font-medium">
                  השם שלך <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="submitter_name"
                  {...register('submitter_name')}
                  placeholder="שמך"
                  className={`mt-1 ${errors.submitter_name ? 'border-red-400' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.submitter_name && <p className="text-xs text-red-500 mt-1">{errors.submitter_name.message}</p>}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#003153] hover:bg-[#002040]"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin ml-2" />שולח...</>
                ) : (
                  <><Send className="h-4 w-4 ml-2" />הוסף נושא</>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Ideas list */}
        <div className="space-y-2">
          {ideas.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">עדיין לא נוספו נושאים לדיון</p>
          ) : (
            ideas.map((idea, index) => {
              const status = (idea.discussion_status ?? 'pending') as keyof typeof STATUS_CONFIG
              const statusCfg = STATUS_CONFIG[status]
              return (
                <div key={idea.id} className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-gray-400 font-mono shrink-0">{index + 1}.</span>
                        <p className="font-medium text-gray-900 text-sm leading-snug">{idea.title}</p>
                      </div>
                      {idea.submitter_name && (
                        <p className="text-xs text-gray-400 mr-5">{idea.submitter_name}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={`text-xs border ${statusCfg.className}`}>
                        {statusCfg.label}
                      </Badge>
                      {isAdmin && (
                        <div className="flex gap-1">
                          {(['pending', 'discussed', 'decided'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(idea.id, s)}
                              disabled={updatingId === idea.id || status === s}
                              className={`text-[10px] px-1.5 py-0.5 rounded border transition-all
                                ${status === s
                                  ? STATUS_CONFIG[s].className + ' font-semibold'
                                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                                }
                                disabled:opacity-50`}
                            >
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
