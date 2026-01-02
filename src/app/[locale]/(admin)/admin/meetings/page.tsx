'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Users, Lock, LockOpen, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import Link from 'next/link'
import type { Meeting } from '@/types'

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMeetings()
  }, [])

  async function fetchMeetings() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/meetings?_t=' + Date.now(), {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setMeetings(data.data)
      } else {
        toast.error('שגיאה בטעינת הפגישות')
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error('שגיאה בטעינת הפגישות')
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleMeetingStatus(id: string, currentIsOpen: boolean) {
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_open: !currentIsOpen,
          status: !currentIsOpen ? 'open' : 'closed'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(currentIsOpen ? 'הפגישה נסגרה' : 'הפגישה נפתחה')
        fetchMeetings()
      } else {
        toast.error('שגיאה בעדכון הפגישה')
      }
    } catch (error) {
      console.error('Error toggling meeting:', error)
      toast.error('שגיאה בעדכון הפגישה')
    }
  }

  const stats = {
    total: meetings.length,
    open: meetings.filter(m => m.is_open).length,
    closed: meetings.filter(m => !m.is_open).length,
    totalIdeas: meetings.reduce((sum, m) => sum + m.ideas_count, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ניהול פגישות</h1>
          <p className="text-muted-foreground mt-2">
            ניהול פגישות ושליחת רעיונות לסדר היום
          </p>
        </div>
        <Link href="/admin/meetings/new">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            פגישה חדשה
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה"כ פגישות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">פגישות פתוחות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">פגישות סגורות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה"כ רעיונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIdeas}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
              <p className="text-muted-foreground">טוען פגישות...</p>
            </CardContent>
          </Card>
        ) : meetings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">אין פגישות. צרו פגישה חדשה!</p>
            </CardContent>
          </Card>
        ) : (
          meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      <Badge variant={meeting.is_open ? 'default' : 'secondary'}>
                        {meeting.is_open ? (
                          <>
                            <LockOpen className="h-3 w-3 ml-1" />
                            פתוח
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 ml-1" />
                            סגור
                          </>
                        )}
                      </Badge>
                    </div>

                    {meeting.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {meeting.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(meeting.meeting_date), 'PPP', { locale: he })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {meeting.ideas_count} רעיונות
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/meetings/${meeting.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 ml-2" />
                        צפה בדף
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMeetingStatus(meeting.id, meeting.is_open)}
                    >
                      {meeting.is_open ? 'סגור' : 'פתח'}
                    </Button>

                    <Link href={`/admin/meetings/${meeting.id}`}>
                      <Button variant="outline" size="sm">
                        נהל
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
