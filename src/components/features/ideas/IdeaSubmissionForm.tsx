'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'improvement', label: 'שיפור קיים' },
  { value: 'feature', label: 'תכונה חדשה' },
  { value: 'process', label: 'תהליך עבודה' },
  { value: 'other', label: 'אחר' }
]

export function IdeaSubmissionForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitterName, setSubmitterName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Client-side validation
    if (!title.trim()) {
      toast.error('נא להזין כותרת לרעיון')
      return
    }

    if (title.trim().length < 2) {
      toast.error('כותרת חייבת להכיל לפחות 2 תווים')
      return
    }

    if (!description.trim()) {
      toast.error('נא להזין תיאור מפורט')
      return
    }

    if (description.trim().length < 10) {
      toast.error('תיאור חייב להכיל לפחות 10 תווים')
      return
    }

    if (!category) {
      toast.error('נא לבחור קטגוריה')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          is_anonymous: isAnonymous,
          submitter_name: !isAnonymous ? submitterName.trim() || null : null,
          contact_email: !isAnonymous ? contactEmail.trim() || null : null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הרעיון נשלח בהצלחה! תודה על השיתוף 💡')
        // Reset form
        setTitle('')
        setDescription('')
        setCategory('')
        setIsAnonymous(true)
        setSubmitterName('')
        setContactEmail('')
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        // Show validation errors if available
        if (result.details && Array.isArray(result.details)) {
          result.details.forEach((detail: string) => {
            toast.error(detail)
          })
        } else {
          toast.error(result.error || 'שגיאה בשליחת הרעיון')
        }
      }
    } catch (error) {
      toast.error('שגיאה בשליחת הרעיון')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          שליחת רעיון חדש
        </CardTitle>
        <CardDescription>
          יש לכם רעיון לשיפור או תכונה חדשה? נשמח לשמוע!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm">כותרת הרעיון * <span className="text-muted-foreground font-normal">(מינימום 2 תווים)</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: תזכורות אוטומטיות למשימות"
              className={`mt-1.5 ${title.length > 0 && title.length < 2 ? 'border-red-500' : ''}`}
              maxLength={100}
            />
            <p className={`text-xs mt-1 ${title.length > 0 && title.length < 2 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {title.length} / 100 תווים {title.length > 0 && title.length < 2 && '(נדרשים לפחות 2 תווים)'}
            </p>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-sm">סוג הרעיון *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm">תיאור מפורט * <span className="text-muted-foreground font-normal">(מינימום 10 תווים)</span></Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תארו את הרעיון בפירוט - מה הבעיה שהוא פותר? איך זה יעזור?"
              rows={5}
              className={`mt-1.5 text-sm ${description.length > 0 && description.length < 10 ? 'border-red-500' : ''}`}
              maxLength={2000}
            />
            <p className={`text-xs mt-1 ${description.length > 0 && description.length < 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {description.length} / 2000 תווים {description.length > 0 && description.length < 10 && '(נדרשים לפחות 10 תווים)'}
            </p>
          </div>

          {/* Anonymous checkbox */}
          <div className="flex items-start space-x-2 space-x-reverse">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                שלח באופן אנונימי
              </Label>
              <p className="text-xs text-muted-foreground">
                הרעיון יישלח ללא פרטי זיהוי אישיים
              </p>
            </div>
          </div>

          {/* Contact info (only if not anonymous) */}
          {!isAnonymous && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                פרטי יצירת קשר
              </p>
              <p className="text-xs text-muted-foreground -mt-1">
                כל השדות הבאים הם אופציונליים - מלאו רק אם תרצו שנחזור אליכם
              </p>
              <div>
                <Label htmlFor="submitter_name" className="text-sm">שם <span className="text-muted-foreground font-normal">(אופציונלי)</span></Label>
                <Input
                  id="submitter_name"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="השם שלכם (לא חובה)"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact_email" className="text-sm">דוא״ל או טלפון <span className="text-muted-foreground font-normal">(אופציונלי)</span></Label>
                <Input
                  id="contact_email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="example@email.com או 050-1234567 (לא חובה)"
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* Privacy notice */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs">
            <p className="text-muted-foreground">
              🔒 {isAnonymous
                ? 'הרעיון יישלח באופן אנונימי ולא ישויך אליכם באופן אישי'
                : 'פרטי ההתקשרות שלכם ישמרו באופן מאובטח ולא ישותפו עם אף אחד'
              }
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim() || !category}
            className="w-full bg-amber-500 hover:bg-amber-600"
            size="sm"
          >
            {isSubmitting ? (
              <>שולח...</>
            ) : (
              <>
                <Send className="h-3 w-3 ml-2" />
                שלח רעיון
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
