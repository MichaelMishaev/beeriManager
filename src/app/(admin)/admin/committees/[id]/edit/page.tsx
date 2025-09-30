'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const committeeSchema = z.object({
  name: z.string().min(2, 'שם הוועדה חייב להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'צבע חייב להיות בפורמט תקין'),
  responsibilities: z.array(z.string()).min(1, 'חייב להיות לפחות תחום אחריות אחד'),
  members: z.array(z.string()).min(1, 'חייב להיות לפחות חבר וועדה אחד')
})

type CommitteeFormData = z.infer<typeof committeeSchema>

const defaultColors = [
  '#FF8200', '#0D98BA', '#003153', '#FFBA00', '#87CEEB',
  '#10B981', '#F43F5E', '#8B5CF6', '#EF4444', '#3B82F6'
]

export default function EditCommitteePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [responsibilityInput, setResponsibilityInput] = useState('')
  const [responsibilities, setResponsibilities] = useState<string[]>([])

  const [memberInput, setMemberInput] = useState('')
  const [members, setMembers] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CommitteeFormData>({
    resolver: zodResolver(committeeSchema),
    defaultValues: {
      color: '#0D98BA',
      responsibilities: [],
      members: []
    }
  })

  const selectedColor = watch('color')

  useEffect(() => {
    async function loadCommittee() {
      try {
        const response = await fetch(`/api/committees/${params.id}`)
        const result = await response.json()

        if (result.success) {
          const committee = result.data
          setValue('name', committee.name)
          setValue('description', committee.description || '')
          setValue('color', committee.color)
          setResponsibilities(committee.responsibilities || [])
          setValue('responsibilities', committee.responsibilities || [])
          setMembers(committee.members || [])
          setValue('members', committee.members || [])
        } else {
          toast.error('שגיאה בטעינת הוועדה')
          router.push('/admin/committees')
        }
      } catch (error) {
        console.error('Error loading committee:', error)
        toast.error('שגיאה בטעינת הוועדה')
        router.push('/admin/committees')
      } finally {
        setIsLoading(false)
      }
    }

    loadCommittee()
  }, [params.id, router, setValue])

  const addResponsibility = () => {
    if (responsibilityInput.trim() && !responsibilities.includes(responsibilityInput.trim())) {
      const newResponsibilities = [...responsibilities, responsibilityInput.trim()]
      setResponsibilities(newResponsibilities)
      setValue('responsibilities', newResponsibilities)
      setResponsibilityInput('')
    }
  }

  const removeResponsibility = (index: number) => {
    const newResponsibilities = responsibilities.filter((_, i) => i !== index)
    setResponsibilities(newResponsibilities)
    setValue('responsibilities', newResponsibilities)
  }

  const addMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      const newMembers = [...members, memberInput.trim()]
      setMembers(newMembers)
      setValue('members', newMembers)
      setMemberInput('')
    }
  }

  const removeMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index)
    setMembers(newMembers)
    setValue('members', newMembers)
  }

  async function onSubmit(data: CommitteeFormData) {
    setIsSubmitting(true)

    try {
      const committeeData = {
        id: params.id,
        ...data,
        responsibilities,
        members
      }

      const response = await fetch('/api/committees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(committeeData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הוועדה עודכנה בהצלחה!')
        router.push('/admin/committees')
      } else {
        toast.error(result.error || 'שגיאה בעדכון הוועדה')
      }
    } catch (error) {
      console.error('Error updating committee:', error)
      toast.error('שגיאה בעדכון הוועדה')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">עריכת וועדה</h1>
        <p className="text-muted-foreground mt-2">
          עדכון פרטי הוועדה, חברים ותחומי אחריות
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>פרטי הוועדה</CardTitle>
            <CardDescription>מידע בסיסי על הוועדה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">שם הוועדה *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="לדוגמה: ועדת חינוך"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">תיאור הוועדה</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="תיאור קצר של תפקיד ומטרות הוועדה..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="color">צבע זיהוי *</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    {...register('color')}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    {...register('color')}
                    placeholder="#0D98BA"
                    className="flex-1"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground mr-2">צבעים מהירים:</span>
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: color,
                        borderColor: selectedColor === color ? '#000' : 'transparent'
                      }}
                      onClick={() => setValue('color', color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              {errors.color && (
                <p className="text-sm text-red-500 mt-1">{errors.color.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>חברי וועדה *</CardTitle>
            <CardDescription>רשימת החברים בוועדה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="שם חבר וועדה"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addMember()
                  }
                }}
              />
              <Button type="button" size="sm" onClick={addMember} variant="outline">
                <Plus className="h-4 w-4" />
                הוסף
              </Button>
            </div>

            {members.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-lg"
                  >
                    <span className="text-sm">{member}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.members && (
              <p className="text-sm text-red-500">{errors.members.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>תחומי אחריות *</CardTitle>
            <CardDescription>מילות מפתח לתחומי האחריות של הוועדה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="תחום אחריות"
                value={responsibilityInput}
                onChange={(e) => setResponsibilityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addResponsibility()
                  }
                }}
              />
              <Button type="button" size="sm" onClick={addResponsibility} variant="outline">
                <Plus className="h-4 w-4" />
                הוסף
              </Button>
            </div>

            {responsibilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {responsibilities.map((resp, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg"
                    style={{
                      backgroundColor: selectedColor + '20',
                      borderColor: selectedColor,
                      borderWidth: '1px'
                    }}
                  >
                    <span className="text-sm" style={{ color: selectedColor }}>
                      {resp}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.responsibilities && (
              <p className="text-sm text-red-500">{errors.responsibilities.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>טוען...</>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                שמור שינויים
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ביטול
          </Button>
        </div>
      </form>
    </div>
  )
}