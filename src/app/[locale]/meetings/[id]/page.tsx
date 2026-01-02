'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Send, CheckCircle, Users, Calendar, Lock, LockOpen, Lightbulb, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { ShareButton } from '@/components/ui/share-button'
import type { Meeting, MeetingIdea } from '@/types'

const ideaSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים').max(200),
  description: z.string().optional(),
  submitter_name: z.string().optional(),
  is_anonymous: z.boolean().default(true)
})

type IdeaFormData = z.infer<typeof ideaSchema>

interface PageProps {
  params: { id: string; locale: string }
}

export default function MeetingIdeasPage({ params }: PageProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [ideas, setIdeas] = useState<MeetingIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      is_anonymous: true
    }
  })

  const isAnonymous = watch('is_anonymous')

  useEffect(() => {
    fetchMeetingData()
  }, [params.id])

  async function fetchMeetingData() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meetings/${params.id}/ideas?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setMeeting(data.data.meeting)
        setIdeas(data.data.ideas)
      } else {
        toast.error('הפגישה לא נמצאה')
      }
    } catch (error) {
      console.error('Error fetching meeting:', error)
      toast.error('שגיאה בטעינת הפגישה')
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(data: IdeaFormData) {
    setIsSubmitting(true)

    try {
      const ideaData = {
        ...data,
        submitter_name: isAnonymous ? undefined : data.submitter_name,
        submission_locale: params.locale
      }

      const response = await fetch(`/api/meetings/${params.id}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ideaData)
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem('idea_submitted', 'true')
        window.location.href = `/${params.locale}`
      } else {
        toast.error(result.error || 'שגיאה בשליחת הרעיון')
      }
    } catch (error) {
      console.error('Error submitting idea:', error)
      toast.error('שגיאה בשליחת הרעיון')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-lg">
          <CardContent className="text-center py-12">
            <div className="h-12 w-12 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground font-medium">טוען פגישה...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-lg">
          <CardContent className="text-center py-12">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">הפגישה לא נמצאה</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isMeetingClosed = !meeting.is_open || meeting.status !== 'open'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-gray-50/30">
      {/* Hero Section with Logo & Meeting Info */}
      <div className="bg-gradient-to-br from-primary/5 via-blue-50/50 to-primary/10 border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-full.png"
              alt="לוגו בארי נתניה - ועד הורים"
              width={160}
              height={64}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>

          {/* Meeting Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-3">
              <Badge
                variant={isMeetingClosed ? 'secondary' : 'default'}
                className="text-sm font-medium px-3 py-1"
              >
                {isMeetingClosed ? (
                  <>
                    <Lock className="h-3.5 w-3.5 ml-1" />
                    סגור לשליחת רעיונות
                  </>
                ) : (
                  <>
                    <LockOpen className="h-3.5 w-3.5 ml-1" />
                    פתוח לשליחת רעיונות
                  </>
                )}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              {meeting.title}
            </h1>

            {meeting.description && (
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                {meeting.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-3 flex-wrap text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Calendar className="h-4 w-4 text-primary" />
                {format(new Date(meeting.meeting_date), 'PPP', { locale: he })}
              </span>
              <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Lightbulb className="h-4 w-4 text-primary" />
                {ideas.length} רעיונות
              </span>
              <ShareButton
                shareData={{
                  title: `${meeting.title} - שליחת רעיונות לפגישה`,
                  text: `שלחו רעיונות לסדר היום של ${meeting.title}`,
                  url: typeof window !== 'undefined' ? window.location.href : ''
                }}
                variant="outline"
                size="default"
                className="shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Submission Form */}
          <div className="lg:sticky lg:top-6 h-fit">
            {isMeetingClosed ? (
              <Card className="border-none shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">הפגישה סגורה</h3>
                  <p className="text-muted-foreground">
                    שליחת רעיונות חדשים אינה זמינה כעת
                  </p>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/10 to-blue-50/50 px-6 py-5 border-b">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">שליחת רעיון</h2>
                        <p className="text-sm text-gray-600">שתפו את המחשבות שלכם</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-5">
                    {/* Anonymous Toggle */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200">
                      <Switch
                        id="is_anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setValue('is_anonymous', checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="is_anonymous" className="cursor-pointer font-semibold text-gray-900">
                          שליחה אנונימית
                        </Label>
                        <p className="text-sm text-gray-600 mt-0.5">
                          הרעיון יופיע ללא שם
                        </p>
                      </div>
                    </div>

                    {/* Submitter Name */}
                    {!isAnonymous && (
                      <div className="space-y-2 animate-in slide-in-from-top duration-200">
                        <Label htmlFor="submitter_name" className="text-sm font-semibold text-gray-700">
                          שם (אופציונלי)
                        </Label>
                        <Input
                          id="submitter_name"
                          {...register('submitter_name')}
                          placeholder="השם שלך"
                          className="h-11 border-gray-200 focus:border-primary focus:ring-primary/20"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                        נושא <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="על מה תרצו לדבר בפגישה?"
                        className={`h-11 border-gray-200 focus:border-primary focus:ring-primary/20 ${
                          errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                        }`}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                        פירוט (אופציונלי)
                      </Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="הוסיפו פרטים נוספים על הרעיון שלכם..."
                        rows={4}
                        className="resize-none border-gray-200 focus:border-primary focus:ring-primary/20"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin ml-2 border-2 border-white border-t-transparent rounded-full" />
                          שולח רעיון...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 ml-2" />
                          שלח רעיון
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            )}
          </div>

          {/* Ideas List */}
          <div>
            <Card className="border-none shadow-lg">
              <div className="bg-gradient-to-br from-gray-50 to-white px-6 py-5 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">רעיונות שנשלחו</h2>
                    <p className="text-sm text-gray-600 mt-0.5">שקיפות מלאה - כולם רואים הכל</p>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                    {ideas.length}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {ideas.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      עדיין אין רעיונות
                    </h3>
                    <p className="text-muted-foreground">
                      היו הראשונים לשתף רעיון!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                    {ideas.map((idea, index) => (
                      <div
                        key={idea.id}
                        className="group p-5 border border-gray-200 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 leading-tight">
                                {idea.title}
                              </h4>
                              {idea.is_anonymous && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  אנונימי
                                </Badge>
                              )}
                            </div>

                            {idea.description && (
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                {idea.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="font-medium">
                                {!idea.is_anonymous && idea.submitter_name ? (
                                  <>✍️ {idea.submitter_name}</>
                                ) : (
                                  <>&nbsp;</>
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(idea.created_at), 'dd/MM/yyyy HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
