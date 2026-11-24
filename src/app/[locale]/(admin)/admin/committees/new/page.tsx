'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'

const defaultColors = [
  '#FF8200', // UT Orange
  '#0D98BA', // Blue-Green
  '#003153', // Prussian Blue
  '#FFBA00', // Selective Yellow
  '#87CEEB', // Sky Blue
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#EF4444', // Red
  '#3B82F6', // Blue
]

export default function NewCommitteePage() {
  const t = useTranslations('admin.org.committees.form')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const committeeSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('validation.nameMin')),
        description: z.string().optional(),
        color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, t('validation.colorInvalid')),
        responsibilities: z.array(z.string()).min(1, t('validation.responsibilitiesMin')),
        members: z.array(z.string()).min(1, t('validation.membersMin')),
      }),
    [t]
  )
  type CommitteeFormData = z.infer<typeof committeeSchema>

  // Responsibilities state
  const [responsibilityInput, setResponsibilityInput] = useState('')
  const [responsibilities, setResponsibilities] = useState<string[]>([])

  // Members state
  const [memberInput, setMemberInput] = useState('')
  const [members, setMembers] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CommitteeFormData>({
    resolver: zodResolver(committeeSchema),
    defaultValues: {
      color: '#0D98BA',
      responsibilities: [],
      members: [],
    },
  })

  const selectedColor = watch('color')

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
    if (responsibilities.length === 0) {
      toast.error(t('toast.needResponsibility'))
      return
    }

    if (members.length === 0) {
      toast.error(t('toast.needMember'))
      return
    }

    setIsSubmitting(true)

    try {
      const committeeData = {
        ...data,
        responsibilities,
        members,
      }

      const response = await fetch('/api/committees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: send auth cookies
        body: JSON.stringify(committeeData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('toast.created'))
        router.push('/admin/committees')
      } else {
        toast.error(result.error || t('toast.createError'))
      }
    } catch (error) {
      console.error('Error creating committee:', error)
      toast.error(t('toast.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={t('newTitle')}
        subtitle={t('newSubtitle')}
        backHref="/admin/committees"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <AdminFormSection title={t('detailsTitle')} description={t('detailsDescription')}>
          <div>
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('namePlaceholder')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">{t('descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="color">{t('colorLabel')}</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  {...register('color')}
                  className="w-20 h-11 cursor-pointer"
                />
                <Input
                  type="text"
                  {...register('color')}
                  placeholder="#0D98BA"
                  className="flex-1"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground me-2">{t('quickColors')}</span>
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-11 w-11 rounded-lg border-2 transition-transform hover:scale-105"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#000' : 'transparent',
                    }}
                    onClick={() => setValue('color', color)}
                    title={color}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
            {errors.color && <p className="text-sm text-red-500 mt-1">{errors.color.message}</p>}
          </div>
        </AdminFormSection>

        {/* Members */}
        <AdminFormSection title={t('membersTitle')} description={t('membersDescription')}>
          <div className="flex gap-2">
            <Input
              placeholder={t('memberPlaceholder')}
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addMember()
                }
              }}
            />
            <Button type="button" onClick={addMember} variant="outline" className="min-h-[44px]">
              <Plus className="h-4 w-4 me-1" />
              {t('add')}
            </Button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 ps-3 pe-1 py-1 bg-secondary rounded-lg"
                >
                  <span className="text-sm">{member}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    aria-label={t('remove')}
                    className="flex h-8 w-8 items-center justify-center hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.members && <p className="text-sm text-red-500">{errors.members.message}</p>}
        </AdminFormSection>

        {/* Responsibilities */}
        <AdminFormSection
          title={t('responsibilitiesTitle')}
          description={t('responsibilitiesDescription')}
        >
          <div className="flex gap-2">
            <Input
              placeholder={t('responsibilityPlaceholderNew')}
              value={responsibilityInput}
              onChange={(e) => setResponsibilityInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addResponsibility()
                }
              }}
            />
            <Button
              type="button"
              onClick={addResponsibility}
              variant="outline"
              className="min-h-[44px]"
            >
              <Plus className="h-4 w-4 me-1" />
              {t('add')}
            </Button>
          </div>

          {responsibilities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {responsibilities.map((resp, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 ps-3 pe-1 py-1 rounded-lg"
                  style={{
                    backgroundColor: selectedColor + '20',
                    borderColor: selectedColor,
                    borderWidth: '1px',
                  }}
                >
                  <span className="text-sm" style={{ color: selectedColor }}>
                    {resp}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeResponsibility(index)}
                    aria-label={t('remove')}
                    className="flex h-8 w-8 items-center justify-center hover:text-destructive"
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
        </AdminFormSection>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full">
            {isSubmitting ? (
              <>{t('saving')}</>
            ) : (
              <>
                <Save className="h-4 w-4 me-2" />
                {t('saveNew')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-h-[44px] w-full"
          >
            {t('cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
