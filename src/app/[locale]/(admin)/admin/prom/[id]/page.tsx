'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  GraduationCap, 
  ArrowRight,
  Calendar,
  Users,
  DollarSign,
  Save,
  MapPin,
  Vote,
  FileSpreadsheet,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PromEventDetail {
  id: string
  title: string
  title_ru: string | null
  description: string | null
  description_ru: string | null
  event_date: string | null
  event_time: string | null
  venue_name: string | null
  venue_address: string | null
  total_budget: number
  student_count: number
  status: string
  voting_enabled: boolean
  voting_start_date: string | null
  voting_end_date: string | null
  selected_quote_id: string | null
  quotes_count: number
  votes_count: number
  total_spent: number
  created_at: string
}

export default function PromDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [promEvent, setPromEvent] = useState<PromEventDetail | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ru: '',
    description: '',
    description_ru: '',
    event_date: '',
    event_time: '',
    venue_name: '',
    venue_address: '',
    total_budget: '',
    student_count: '',
    status: 'planning',
    voting_enabled: false,
    voting_start_date: '',
    voting_end_date: ''
  })

  useEffect(() => {
    fetchPromEvent()
  }, [id])

  async function fetchPromEvent() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/prom/${id}?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setPromEvent(data.data)
        setFormData({
          title: data.data.title || '',
          title_ru: data.data.title_ru || '',
          description: data.data.description || '',
          description_ru: data.data.description_ru || '',
          event_date: data.data.event_date || '',
          event_time: data.data.event_time || '',
          venue_name: data.data.venue_name || '',
          venue_address: data.data.venue_address || '',
          total_budget: data.data.total_budget?.toString() || '',
          student_count: data.data.student_count?.toString() || '',
          status: data.data.status || 'planning',
          voting_enabled: data.data.voting_enabled || false,
          voting_start_date: data.data.voting_start_date?.split('T')[0] || '',
          voting_end_date: data.data.voting_end_date?.split('T')[0] || ''
        })
      } else {
        toast.error('שגיאה בטעינת האירוע')
        router.push('/admin/prom')
      }
    } catch (error) {
      console.error('Error fetching prom event:', error)
      toast.error('שגיאה בטעינת האירוע')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('נא להזין כותרת')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/prom/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('האירוע עודכן בהצלחה')
        fetchPromEvent()
      } else {
        toast.error(data.error || 'שגיאה בעדכון האירוע')
      }
    } catch (error) {
      console.error('Error updating prom event:', error)
      toast.error('שגיאה בעדכון האירוע')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) {
      return
    }

    try {
      const response = await fetch(`/api/prom/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        toast.success('האירוע נמחק בהצלחה')
        router.push('/admin/prom')
      } else {
        toast.error(data.error || 'שגיאה במחיקת האירוע')
      }
    } catch (error) {
      console.error('Error deleting prom event:', error)
      toast.error('שגיאה במחיקת האירוע')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!promEvent) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/prom">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{promEvent.title}</h1>
              <p className="text-muted-foreground">עריכת פרטי מסיבת הסיום</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/prom/${id}/quotes`}>
              <FileSpreadsheet className="h-4 w-4 ml-2" />
              השוואת הצעות
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/prom/${id}/budget`}>
              <DollarSign className="h-4 w-4 ml-2" />
              תקציב
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Row - Clickable Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Link href={`/admin/prom/${id}/quotes`}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
                    <FileSpreadsheet className="h-4 w-4" />
                    הצעות מחיר
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{promEvent.quotes_count}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-400 rotate-180" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card 
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
          onClick={() => {
            if (formData.voting_enabled) {
              const voteUrl = `${window.location.origin}/prom/${id}/vote`
              navigator.clipboard.writeText(voteUrl)
              toast.success('קישור להצבעה הועתק!')
            } else {
              toast.info('הפעל הצבעה כדי לקבל קישור להורים')
            }
          }}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-800 text-sm font-medium">
                  <Vote className="h-4 w-4" />
                  הצבעות
                </div>
                <div className="text-2xl font-bold text-purple-900">{promEvent.votes_count}</div>
              </div>
              {formData.voting_enabled ? (
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">העתק קישור</span>
              ) : (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">לא פעיל</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Link href={`/admin/prom/${id}/budget`}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    הוצאו
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    ₪{promEvent.total_spent.toLocaleString('he-IL')}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-green-400 rotate-180" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card 
          className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
          onClick={() => {
            if (promEvent.student_count > 0 && promEvent.total_budget > 0) {
              const perStudent = Math.round(promEvent.total_budget / promEvent.student_count)
              const spent = Math.round(promEvent.total_spent / promEvent.student_count)
              toast.info(`תקציב: ₪${perStudent} לתלמיד | הוצאו: ₪${spent} לתלמיד`)
            } else {
              toast.info('הזן מספר תלמידים ותקציב לחישוב')
            }
          }}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-800 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  לתלמיד
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {promEvent.student_count > 0 
                    ? `₪${Math.round(promEvent.total_budget / promEvent.student_count)}`
                    : '—'}
                </div>
              </div>
              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">פרטים</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-pink-600" />
                פרטי המסיבה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת (עברית) *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_ru">כותרת (רוסית)</Label>
                <Input
                  id="title_ru"
                  name="title_ru"
                  value={formData.title_ru}
                  onChange={handleChange}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">תיאור (עברית)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">בתכנון</SelectItem>
                    <SelectItem value="voting">בהצבעה</SelectItem>
                    <SelectItem value="confirmed">מאושר</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                תאריך ומיקום
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">תאריך</Label>
                  <Input
                    id="event_date"
                    name="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_time">שעה</Label>
                  <Input
                    id="event_time"
                    name="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_name">שם המקום</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="venue_name"
                    name="venue_name"
                    value={formData.venue_name}
                    onChange={handleChange}
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_address">כתובת</Label>
                <Input
                  id="venue_address"
                  name="venue_address"
                  value={formData.venue_address}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget & Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                תקציב ותלמידים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="total_budget">תקציב כולל (₪)</Label>
                <Input
                  id="total_budget"
                  name="total_budget"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.total_budget}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_count">מספר תלמידים</Label>
                <Input
                  id="student_count"
                  name="student_count"
                  type="number"
                  min="0"
                  value={formData.student_count}
                  onChange={handleChange}
                />
              </div>

              {/* Budget Progress */}
              {promEvent.total_budget > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>ניצול תקציב</span>
                    <span>
                      {Math.round((promEvent.total_spent / promEvent.total_budget) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        (promEvent.total_spent / promEvent.total_budget) > 0.9 
                          ? "bg-red-500" 
                          : (promEvent.total_spent / promEvent.total_budget) > 0.7
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(100, (promEvent.total_spent / promEvent.total_budget) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voting Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5 text-purple-600" />
                הגדרות הצבעה
              </CardTitle>
              <CardDescription>
                אפשרו להורים להצביע על אפשרויות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>הפעל הצבעה</Label>
                  <p className="text-sm text-muted-foreground">
                    הורים יוכלו להצביע על הצעות המחיר
                  </p>
                </div>
                <Switch
                  checked={formData.voting_enabled}
                  onCheckedChange={(checked) => handleSwitchChange('voting_enabled', checked)}
                />
              </div>

              {formData.voting_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="voting_start_date">תאריך התחלה</Label>
                    <Input
                      id="voting_start_date"
                      name="voting_start_date"
                      type="date"
                      value={formData.voting_start_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voting_end_date">תאריך סיום</Label>
                    <Input
                      id="voting_end_date"
                      name="voting_end_date"
                      type="date"
                      value={formData.voting_end_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      קישור להצבעה:
                      <br />
                      <code className="text-xs bg-white px-2 py-1 rounded mt-1 block overflow-auto">
                        {typeof window !== 'undefined' ? `${window.location.origin}/prom/${id}/vote` : ''}
                      </code>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/prom">ביטול</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                שומר...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                שמור שינויים
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

