'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  GraduationCap, 
  ArrowRight,
  Calendar,
  Users,
  DollarSign,
  Save,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function NewPromPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    status: 'planning'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('נא להזין כותרת')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/prom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('המסיבה נוצרה בהצלחה')
        router.push(`/admin/prom/${data.data.id}`)
      } else {
        toast.error(data.error || 'שגיאה ביצירת המסיבה')
      }
    } catch (error) {
      console.error('Error creating prom event:', error)
      toast.error('שגיאה ביצירת המסיבה')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold">מסיבת סיום חדשה</h1>
            <p className="text-muted-foreground">יצירת תכנון מסיבת סיום חדשה</p>
          </div>
        </div>
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
              <CardDescription>מידע בסיסי על מסיבת הסיום</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">כותרת (עברית) *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="מסיבת סיום כיתה ו' תשפ״ה"
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
                  placeholder="Выпускной вечер 6 класса"
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
                  placeholder="תיאור המסיבה..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ru">תיאור (רוסית)</Label>
                <Textarea
                  id="description_ru"
                  name="description_ru"
                  value={formData.description_ru}
                  onChange={handleChange}
                  placeholder="Описание..."
                  rows={3}
                  dir="ltr"
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
              <CardDescription>מתי ואיפה תתקיים המסיבה</CardDescription>
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
                    placeholder="שם האולם / המקום"
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
                  placeholder="כתובת מלאה"
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget & Students */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                תקציב ותלמידים
              </CardTitle>
              <CardDescription>הגדרות תקציב ומספר משתתפים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="total_budget">תקציב כולל (₪)</Label>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="total_budget"
                      name="total_budget"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.total_budget}
                      onChange={handleChange}
                      placeholder="15000"
                      className="pr-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student_count">מספר תלמידים</Label>
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student_count"
                      name="student_count"
                      type="number"
                      min="0"
                      value={formData.student_count}
                      onChange={handleChange}
                      placeholder="60"
                      className="pr-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>עלות לתלמיד (משוער)</Label>
                  <div className="h-10 flex items-center px-3 bg-muted rounded-md text-muted-foreground">
                    {formData.total_budget && formData.student_count && parseInt(formData.student_count) > 0
                      ? `₪${Math.round(parseInt(formData.total_budget) / parseInt(formData.student_count))}`
                      : '—'}
                  </div>
                </div>
              </div>
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
                צור מסיבה
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

