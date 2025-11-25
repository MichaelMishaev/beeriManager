'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign,
  Vote,
  FileSpreadsheet,
  BarChart3,
  Trash2,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PromEvent {
  id: string
  title: string
  event_date: string | null
  total_budget: number
  student_count: number
  status: 'planning' | 'voting' | 'confirmed' | 'completed' | 'cancelled'
  voting_enabled: boolean
  quotes_count?: number
  votes_count?: number
  total_spent?: number
  created_at: string
}

const statusLabels: Record<string, { label: string; color: string }> = {
  planning: { label: 'בתכנון', color: 'bg-blue-100 text-blue-800' },
  voting: { label: 'בהצבעה', color: 'bg-purple-100 text-purple-800' },
  confirmed: { label: 'מאושר', color: 'bg-green-100 text-green-800' },
  completed: { label: 'הושלם', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'בוטל', color: 'bg-red-100 text-red-800' }
}

export default function PromDashboardPage() {
  const [promEvents, setPromEvents] = useState<PromEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPromEvents()
  }, [])

  async function fetchPromEvents() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/prom?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        // Fetch additional stats for each event
        const eventsWithStats = await Promise.all(
          data.data.map(async (event: PromEvent) => {
            const detailResponse = await fetch(`/api/prom/${event.id}?_t=${Date.now()}`, {
              cache: 'no-store'
            })
            const detailData = await detailResponse.json()
            return detailData.success ? detailData.data : event
          })
        )
        setPromEvents(eventsWithStats)
      } else {
        toast.error('שגיאה בטעינת האירועים')
      }
    } catch (error) {
      console.error('Error fetching prom events:', error)
      toast.error('שגיאה בטעינת האירועים')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
      return
    }

    try {
      const response = await fetch(`/api/prom/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        toast.success('האירוע נמחק בהצלחה')
        fetchPromEvents()
      } else {
        toast.error(data.error || 'שגיאה במחיקת האירוע')
      }
    } catch (error) {
      console.error('Error deleting prom event:', error)
      toast.error('שגיאה במחיקת האירוע')
    }
  }

  // Calculate totals
  const totalBudget = promEvents.reduce((sum, e) => sum + (e.total_budget || 0), 0)
  const totalSpent = promEvents.reduce((sum, e) => sum + (e.total_spent || 0), 0)
  const totalStudents = promEvents.reduce((sum, e) => sum + (e.student_count || 0), 0)
  const activeEvents = promEvents.filter(e => !['completed', 'cancelled'].includes(e.status)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                תכנון מסיבת סיום
              </h1>
              <p className="text-muted-foreground">
                ניהול מסיבות סיום כיתה ו' - השוואת מחירים והצבעות
              </p>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          <Link href="/admin/prom/new">
            <Plus className="h-4 w-4 ml-2" />
            אירוע חדש
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              אירועים פעילים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{activeEvents}</div>
            <p className="text-xs text-blue-700">מתוך {promEvents.length} סה"כ</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              תקציב כולל
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              ₪{totalBudget.toLocaleString('he-IL')}
            </div>
            <p className="text-xs text-green-700">
              הוצאו: ₪{totalSpent.toLocaleString('he-IL')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Users className="h-4 w-4" />
              תלמידים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{totalStudents}</div>
            <p className="text-xs text-purple-700">
              {totalStudents > 0 && totalBudget > 0 
                ? `₪${Math.round(totalBudget / totalStudents)} לתלמיד`
                : 'אין נתונים'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
              <Vote className="h-4 w-4" />
              הצבעות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {promEvents.reduce((sum, e) => sum + (e.votes_count || 0), 0)}
            </div>
            <p className="text-xs text-orange-700">
              {promEvents.filter(e => e.voting_enabled).length} הצבעות פעילות
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-pink-600" />
            מסיבות סיום
          </CardTitle>
          <CardDescription>
            רשימת כל מסיבות הסיום בניהול
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : promEvents.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">אין מסיבות סיום</h3>
              <p className="text-muted-foreground mb-6">
                צרו את מסיבת הסיום הראשונה שלכם
              </p>
              <Button asChild>
                <Link href="/admin/prom/new">
                  <Plus className="h-4 w-4 ml-2" />
                  צור מסיבת סיום
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {promEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className={cn(
                    "hover:shadow-md transition-all border-r-4",
                    event.status === 'planning' && "border-r-blue-500",
                    event.status === 'voting' && "border-r-purple-500",
                    event.status === 'confirmed' && "border-r-green-500",
                    event.status === 'completed' && "border-r-gray-400",
                    event.status === 'cancelled' && "border-r-red-500"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge className={statusLabels[event.status].color}>
                            {statusLabels[event.status].label}
                          </Badge>
                          {event.voting_enabled && (
                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                              <Vote className="h-3 w-3 ml-1" />
                              הצבעה פעילה
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {event.event_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(event.event_date), 'dd בMMMM yyyy', { locale: he })}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.student_count || 0} תלמידים
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ₪{(event.total_budget || 0).toLocaleString('he-IL')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileSpreadsheet className="h-4 w-4" />
                            {event.quotes_count || 0} הצעות מחיר
                          </span>
                          {event.votes_count && event.votes_count > 0 && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4" />
                              {event.votes_count} הצבעות
                            </span>
                          )}
                        </div>

                        {/* Budget Progress */}
                        {event.total_budget > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>תקציב</span>
                              <span>
                                ₪{(event.total_spent || 0).toLocaleString('he-IL')} / ₪{event.total_budget.toLocaleString('he-IL')}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  ((event.total_spent || 0) / event.total_budget) > 0.9 
                                    ? "bg-red-500" 
                                    : ((event.total_spent || 0) / event.total_budget) > 0.7
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                )}
                                style={{ width: `${Math.min(100, ((event.total_spent || 0) / event.total_budget) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/prom/${event.id}/quotes`}>
                            <FileSpreadsheet className="h-4 w-4 ml-2" />
                            השוואה
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/prom/${event.id}/budget`}>
                            <DollarSign className="h-4 w-4 ml-2" />
                            תקציב
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/prom/${event.id}`}>
                            <Edit className="h-4 w-4 ml-2" />
                            עריכה
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/admin/prom/new">
                <Plus className="h-5 w-5" />
                <span>מסיבה חדשה</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/admin/vendors">
                <Users className="h-5 w-5" />
                <span>ספקים</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/admin/expenses">
                <DollarSign className="h-5 w-5" />
                <span>הוצאות</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/admin/events/new">
                <Calendar className="h-5 w-5" />
                <span>אירוע חדש</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

