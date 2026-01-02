'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Trash2, Calendar, Users, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import Link from 'next/link'
import type { Meeting, MeetingIdea } from '@/types'

interface PageProps {
  params: { id: string; locale: string }
}

export default function ManageMeetingPage({ params }: PageProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [ideas, setIdeas] = useState<MeetingIdea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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
        toast.error('הפגישה לא נמצאה')
      }
    } catch (error) {
      console.error('Error fetching meeting:', error)
      toast.error('שגיאה בטעינת הפגישה')
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteIdea(ideaId: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק רעיון זה?')) {
      return
    }

    try {
      const response = await fetch(`/api/meetings/${params.id}/ideas/${ideaId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הרעיון נמחק בהצלחה')
        fetchMeetingData()
      } else {
        toast.error('שגיאה במחיקת הרעיון')
      }
    } catch (error) {
      console.error('Error deleting idea:', error)
      toast.error('שגיאה במחיקת הרעיון')
    }
  }

  async function copyLink() {
    const publicUrl = `${window.location.origin}/${params.locale}/meetings/${meeting?.id}`
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success('הקישור הועתק')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading || !meeting) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground">טוען...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const publicUrl = `${window.location.origin}/${params.locale}/meetings/${meeting.id}`

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/meetings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowRight className="h-4 w-4 ml-2" />
            חזור לפגישות
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{meeting.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(meeting.meeting_date), 'PPP', { locale: he })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {ideas.length} רעיונות
              </span>
              <Badge variant={meeting.is_open ? 'default' : 'secondary'}>
                {meeting.is_open ? 'פתוח' : 'סגור'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">קישור לשליחת רעיונות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={publicUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={copyLink}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>רעיונות שנשלחו ({ideas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ideas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                עדיין לא נשלחו רעיונות
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.map((idea, index) => (
                <div
                  key={idea.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                          {index + 1}. {idea.title}
                        </h4>
                        {idea.is_anonymous && (
                          <Badge variant="secondary" className="text-xs">
                            אנונימי
                          </Badge>
                        )}
                      </div>

                      {idea.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {idea.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {!idea.is_anonymous && idea.submitter_name && (
                          <span>נשלח על ידי: {idea.submitter_name}</span>
                        )}
                        <span>
                          {format(new Date(idea.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteIdea(idea.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
