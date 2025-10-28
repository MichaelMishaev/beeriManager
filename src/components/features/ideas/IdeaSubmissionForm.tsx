'use client'

import { useState } from 'react'
import { Send, Lightbulb, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ShareIdeaButton } from './ShareIdeaButton'

const CATEGORIES = [
  { value: 'improvement', label: 'שיפור קיים' },
  { value: 'feature', label: 'תכונה חדשה' },
  { value: 'process', label: 'תהליך עבודה' },
  { value: 'other', label: 'אחר' }
]

export function IdeaSubmissionForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitterName, setSubmitterName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('נא להזין כותרת לרעיון')
      return
    }

    if (!description.trim()) {
      toast.error('נא להזין תיאור מפורט')
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
        setIsSubmitted(true)
        toast.success('הרעיון נשלח בהצלחה!')
        // Reset form after 3 seconds
        setTimeout(() => {
          setTitle('')
          setDescription('')
          setCategory('')
          setIsAnonymous(true)
          setSubmitterName('')
          setContactEmail('')
          setIsSubmitted(false)
        }, 3000)
      } else {
        toast.error(result.error || 'שגיאה בשליחת הרעיון')
      }
    } catch (error) {
      toast.error('שגיאה בשליחת הרעיון')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="py-8 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-2">
            <Check className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              תודה רבה על שיתוף הרעיון!
            </h3>
            <p className="text-sm text-amber-700">
              הרעיון שלכם התקבל ונבדק על ידי הנהלת הוועד
            </p>
          </div>

          <div className="pt-4 border-t border-amber-200">
            <p className="text-sm font-medium text-amber-900 mb-2">
              מכירים עוד אנשים עם רעיונות?
            </p>
            <p className="text-xs text-amber-700 mb-4">
              שתפו את האפשרות לשליחת רעיונות עם הורים אחרים
            </p>
            <ShareIdeaButton
              variant="outline"
              size="default"
              className="border-amber-500 text-amber-600 hover:bg-amber-100"
              showLabel={true}
            />
          </div>
        </CardContent>
      </Card>
    )
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
            <Label htmlFor="title" className="text-sm">כותרת הרעיון *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: תזכורות אוטומטיות למשימות"
              className="mt-1.5"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length} / 100 תווים
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
            <Label htmlFor="description" className="text-sm">תיאור מפורט *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תארו את הרעיון בפירוט - מה הבעיה שהוא פותר? איך זה יעזור?"
              rows={5}
              className="mt-1.5 text-sm"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length} / 2000 תווים
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
