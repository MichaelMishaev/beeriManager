'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, Trash2, ClipboardList, Plus, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import TaskDrawer from '@/components/protocols/TaskDrawer'
import ExpandableTaskMentionTextarea from '@/components/protocols/ExpandableTaskMentionTextarea'
import { ExpandableTextarea } from '@/components/ui/expandable-textarea'
import { useFormDraft } from '@/hooks/useFormDraft'
import { useAutoSave } from '@/hooks/useAutoSave'
import { DraftBanner, DraftSaveIndicator } from '@/components/ui/draft-banner'

const protocolSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  protocol_date: z.string().min(1, 'תאריך ישיבה נדרש'),
  categories: z.array(z.string()),
  attendees: z.array(z.string()).min(1, 'חייב להיות לפחות משתתף אחד'),
  is_public: z.boolean(),
  extracted_text: z.string().optional(),
  agenda: z.string().optional(),
  decisions: z.string().optional(),
  action_items: z.string().optional()
})

type ProtocolFormData = z.infer<typeof protocolSchema>

const categoryOptions = [
  { value: 'regular', label: 'ישיבה רגילה' },
  { value: 'special', label: 'ישיבה מיוחדת' },
  { value: 'annual', label: 'אסיפה שנתית' },
  { value: 'emergency', label: 'ישיבת חירום' }
]

export default function EditProtocolPage() {
  const router = useRouter()
  const params = useParams()
  const protocolId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [protocolTitle, setProtocolTitle] = useState('')
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [attendeeInput, setAttendeeInput] = useState('')
  const [attendees, setAttendees] = useState<string[]>([])
  const [showDraftBanner, setShowDraftBanner] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProtocolFormData>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      categories: ['regular'],
      attendees: [],
      is_public: true
    }
  })

  const isPublic = watch('is_public')
  const selectedCategory = watch('categories')?.[0] || 'regular'

  // Draft management
  const { saveDraft, restoreDraft, clearDraft, hasDraft, draftTimestamp } = useFormDraft<ProtocolFormData>({
    formType: 'protocol',
    action: 'edit',
    entityId: protocolId
  })

  // Auto-save
  const formData = watch()
  const { lastSaved, isSaving } = useAutoSave({
    data: { ...formData, attendees },
    onSave: (data) => saveDraft(data),
    delay: 3000,
    enabled: !isLoading // Only auto-save after protocol is loaded
  })

  // Check for existing draft on mount (after protocol is loaded)
  useEffect(() => {
    if (!isLoading && hasDraft && draftTimestamp) {
      setShowDraftBanner(true)
    }
  }, [isLoading, hasDraft, draftTimestamp])

  // Restore draft handler
  const handleRestoreDraft = () => {
    const draft = restoreDraft()
    if (draft) {
      // Restore all form fields
      const draftData = draft as any
      Object.keys(draftData).forEach((key) => {
        if (key === 'attendees') {
          setAttendees(draftData[key] as string[])
        } else if (key in draftData) {
          setValue(key as any, draftData[key])
        }
      })
      setShowDraftBanner(false)
      toast.success('הטיוטה שוחזרה בהצלחה!')
    }
  }

  // Discard draft handler
  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
    toast.success('הטיוטה נמחקה')
  }

  const addAttendee = () => {
    if (attendeeInput.trim() && !attendees.includes(attendeeInput.trim())) {
      const newAttendees = [...attendees, attendeeInput.trim()]
      setAttendees(newAttendees)
      setValue('attendees', newAttendees)
      setAttendeeInput('')
    }
  }

  const removeAttendee = (index: number) => {
    const newAttendees = attendees.filter((_, i) => i !== index)
    setAttendees(newAttendees)
    setValue('attendees', newAttendees)
  }

  useEffect(() => {
    loadProtocol()
  }, [protocolId])

  async function loadProtocol() {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data: protocol, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', protocolId)
        .single()

      if (error || !protocol) {
        toast.error('פרוטוקול לא נמצא')
        router.push('/admin/protocols')
        return
      }

      // Populate form with existing data
      setProtocolTitle(protocol.title)
      setValue('title', protocol.title)
      setValue('protocol_date', protocol.protocol_date)
      setValue('categories', protocol.categories || ['regular'])
      setValue('is_public', protocol.is_public)
      setValue('extracted_text', protocol.extracted_text || '')
      setValue('agenda', protocol.agenda || '')
      setValue('decisions', protocol.decisions || '')
      setValue('action_items', protocol.action_items || '')

      // Set attendees
      const attendeesList = protocol.attendees || []
      setAttendees(attendeesList)
      setValue('attendees', attendeesList)
    } catch (error) {
      console.error('Error loading protocol:', error)
      toast.error('שגיאה בטעינת הפרוטוקול')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הפרוטוקול נמחק בהצלחה')
        setShowDeleteDialog(false)
        router.push('/he/protocols')
        router.refresh()
      } else {
        toast.error(result.error || 'שגיאה במחיקת הפרוטוקול')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('שגיאה במחיקת הפרוטוקול')
    } finally {
      setIsDeleting(false)
    }
  }

  async function onSubmit(data: ProtocolFormData) {
    if (attendees.length === 0) {
      toast.error('יש להוסיף לפחות משתתף אחד')
      return
    }

    setIsSubmitting(true)

    try {
      const year = new Date(data.protocol_date).getFullYear()

      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          attendees,
          year
        })
      })

      const result = await response.json()

      if (result.success) {
        clearDraft() // Clear draft on successful save
        toast.success('הפרוטוקול עודכן בהצלחה!')
        router.push(`/he/protocols/${protocolId}`)
      } else {
        toast.error(result.error || 'שגיאה בעדכון הפרוטוקול')
      }
    } catch (error) {
      console.error('Error updating protocol:', error)
      toast.error('שגיאה בעדכון הפרוטוקול')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">עריכת פרוטוקול</h1>
        <p className="text-muted-foreground mt-2">
          עדכון פרטי הפרוטוקול
        </p>
      </div>

      {/* Draft Banner */}
      {showDraftBanner && draftTimestamp && (
        <DraftBanner
          timestamp={draftTimestamp}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
          onDismiss={() => setShowDraftBanner(false)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הפרוטוקול</CardTitle>
            <CardDescription>מידע בסיסי על הישיבה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת הפרוטוקול *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="לדוגמה: פרוטוקול ישיבת ועד חודש נובמבר"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="protocol_date">תאריך הישיבה *</Label>
                <Input
                  id="protocol_date"
                  type="date"
                  {...register('protocol_date')}
                  className={errors.protocol_date ? 'border-red-500' : ''}
                />
                {errors.protocol_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.protocol_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">סוג הישיבה</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setValue('categories', [value])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is_public">פרוטוקול ציבורי</Label>
                <p className="text-sm text-muted-foreground">
                  יוצג לכל ההורים
                </p>
              </div>
              <Switch
                id="is_public"
                checked={isPublic}
                onCheckedChange={(checked) => setValue('is_public', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card>
          <CardHeader>
            <CardTitle>משתתפים *</CardTitle>
            <CardDescription>רשימת המשתתפים בישיבה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="שם המשתתף"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAttendee()
                  }
                }}
              />
              <Button
                type="button"
                onClick={addAttendee}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                הוסף
              </Button>
            </div>

            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-lg"
                  >
                    <span className="text-sm">{attendee}</span>
                    <button
                      type="button"
                      onClick={() => removeAttendee(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.attendees && (
              <p className="text-sm text-red-500">{errors.attendees.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Meeting Content */}
        <Card>
          <CardHeader>
            <CardTitle>תוכן הישיבה</CardTitle>
            <CardDescription>סדר יום, החלטות ומשימות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="agenda">סדר יום</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDrawerOpen(true)}
                  className="gap-2"
                >
                  <ClipboardList className="h-4 w-4" />
                  צפה במשימות
                </Button>
              </div>
              <ExpandableTaskMentionTextarea
                id="agenda"
                label="סדר יום"
                value={watch('agenda') || ''}
                onChange={(value) => setValue('agenda', value)}
                placeholder="נושאים שנדונו בישיבה... (הקלד @ כדי לקשר משימה)"
                rows={4}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="decisions">החלטות</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDrawerOpen(true)}
                  className="gap-2"
                >
                  <ClipboardList className="h-4 w-4" />
                  צפה במשימות
                </Button>
              </div>
              <ExpandableTaskMentionTextarea
                id="decisions"
                label="החלטות"
                value={watch('decisions') || ''}
                onChange={(value) => setValue('decisions', value)}
                placeholder="החלטות שהתקבלו בישיבה... (הקלד @ כדי לקשר משימה)"
                rows={4}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="action_items">משימות לביצוע</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDrawerOpen(true)}
                  className="gap-2"
                >
                  <ClipboardList className="h-4 w-4" />
                  צפה במשימות
                </Button>
              </div>
              <ExpandableTaskMentionTextarea
                id="action_items"
                label="משימות לביצוע"
                value={watch('action_items') || ''}
                onChange={(value) => setValue('action_items', value)}
                placeholder="משימות שנקבעו בישיבה... (הקלד @ כדי לקשר משימה)"
                rows={4}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              לחץ על &quot;צפה במשימות&quot; לראות את כל המשימות בפרויקט
            </p>

            <div>
              <Label htmlFor="extracted_text">תוכן מעוצב (HTML)</Label>
              <ExpandableTextarea
                id="extracted_text"
                label="תוכן מעוצב (HTML)"
                value={watch('extracted_text') || ''}
                onChange={(e) => setValue('extracted_text', e.target.value)}
                placeholder="תוכן HTML מעוצב..."
                minRows={8}
                maxRows={30}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                תוכן זה מוצג בעמוד הפרוטוקול. ניתן לערוך ידנית או להעלות קובץ חדש.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          {/* Draft Save Indicator */}
          <div className="flex items-center justify-start">
            <DraftSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>טוען...</>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  שמור שינויים
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || isDeleting}
            >
              ביטול
            </Button>
          </div>

          {/* Delete Button */}
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting || isSubmitting}
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            מחק פרוטוקול
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              פעולה זו תמחק את הפרוטוקול &quot;{protocolTitle}&quot; לצמיתות.
              <br />
              לא ניתן לשחזר פרוטוקול לאחר מחיקה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? 'מוחק...' : 'מחק'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Drawer */}
      <TaskDrawer
        isOpen={taskDrawerOpen}
        onClose={() => setTaskDrawerOpen(false)}
      />
    </div>
  )
}
