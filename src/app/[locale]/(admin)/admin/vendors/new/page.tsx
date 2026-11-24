'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Save, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AdminFormSection, AdminPageHeader } from '@/components/features/admin'

const categoryKeys = [
  'catering',
  'equipment',
  'entertainment',
  'transportation',
  'venue',
  'photography',
  'printing',
  'other',
] as const

const priceRangeKeys = ['budget', 'moderate', 'premium', 'luxury'] as const

type VendorCategory = (typeof categoryKeys)[number]

export default function NewVendorPage() {
  const t = useTranslations('admin.org.vendors')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const vendorSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('form.validation.nameMin')),
        description: z.string().optional(),
        category: z.enum(categoryKeys),
        contact_person: z.string().optional(),
        phone: z
          .string()
          .regex(/^05\d{8}$/, t('form.validation.phoneInvalid'))
          .optional()
          .or(z.literal('')),
        email: z.string().email(t('form.validation.emailInvalid')).optional().or(z.literal('')),
        website: z.string().url(t('form.validation.websiteInvalid')).optional().or(z.literal('')),
        address: z.string().optional(),
        business_number: z.string().optional(),
        license_number: z.string().optional(),
        price_range: z.string().optional(),
        payment_terms: z.string().optional(),
        notes: z.string().optional(),
      }),
    [t]
  )
  type VendorFormData = z.infer<typeof vendorSchema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      category: 'other',
    },
  })

  async function onSubmit(data: VendorFormData) {
    setIsSubmitting(true)

    try {
      const vendorData = {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        contact_person: data.contact_person || null,
        address: data.address || null,
        business_number: data.business_number || null,
        license_number: data.license_number || null,
        price_range: data.price_range || null,
        payment_terms: data.payment_terms || null,
        notes: data.notes || null,
        status: 'active',
      }

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('form.toast.created'))
        router.push('/admin/vendors')
      } else {
        toast.error(result.error || t('form.toast.createError'))
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast.error(t('form.toast.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={t('form.newTitle')}
        subtitle={t('form.newSubtitle')}
        backHref="/admin/vendors"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <AdminFormSection title={t('form.detailsTitle')} description={t('form.detailsDescription')}>
          <div>
            <Label htmlFor="name">{t('form.nameLabel')}</Label>
            <div className="relative">
              <Store
                className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="name"
                {...register('name')}
                placeholder={t('form.namePlaceholder')}
                className={`ps-10 ${errors.name ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('form.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="category">{t('form.categoryLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('category', value as VendorCategory)}
                defaultValue="other"
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryKeys.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`categories.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price_range">{t('form.priceRangeLabel')}</Label>
              <Select onValueChange={(value) => setValue('price_range', value)}>
                <SelectTrigger id="price_range">
                  <SelectValue placeholder={t('form.priceRangePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {priceRangeKeys.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`priceRanges.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </AdminFormSection>

        {/* Contact Information */}
        <AdminFormSection title={t('form.contactTitle')} description={t('form.contactDescription')}>
          <div>
            <Label htmlFor="contact_person">{t('form.contactPersonLabel')}</Label>
            <Input
              id="contact_person"
              {...register('contact_person')}
              placeholder={t('form.contactPersonPlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t('form.phoneLabel')}</Label>
            <div className="relative" dir="ltr">
              <Phone
                className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="phone"
                {...register('phone')}
                placeholder="050-1234567"
                className={`ps-10 ${errors.phone ? 'border-red-500' : ''}`}
                dir="ltr"
              />
            </div>
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">{t('form.emailLabel')}</Label>
            <div className="relative" dir="ltr">
              <Mail
                className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="supplier@example.com"
                className={`ps-10 ${errors.email ? 'border-red-500' : ''}`}
                dir="ltr"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="website">{t('form.websiteLabel')}</Label>
            <div className="relative" dir="ltr">
              <Globe
                className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="website"
                {...register('website')}
                placeholder="https://example.com"
                className={`ps-10 ${errors.website ? 'border-red-500' : ''}`}
                dir="ltr"
              />
            </div>
            {errors.website && (
              <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">{t('form.addressLabel')}</Label>
            <div className="relative">
              <MapPin
                className="absolute start-3 top-3.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="address"
                {...register('address')}
                placeholder={t('form.addressPlaceholder')}
                className="ps-10"
              />
            </div>
          </div>
        </AdminFormSection>

        {/* Business Details */}
        <AdminFormSection
          title={t('form.businessTitle')}
          description={t('form.businessDescription')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="business_number">{t('form.businessNumberLabel')}</Label>
              <Input
                id="business_number"
                {...register('business_number')}
                placeholder={t('form.businessNumberPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="license_number">{t('form.licenseNumberLabel')}</Label>
              <Input
                id="license_number"
                {...register('license_number')}
                placeholder={t('form.licenseNumberPlaceholder')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="payment_terms">{t('form.paymentTermsLabel')}</Label>
            <Textarea
              id="payment_terms"
              {...register('payment_terms')}
              placeholder={t('form.paymentTermsPlaceholder')}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">{t('form.notesLabel')}</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder={t('form.notesPlaceholder')}
              rows={3}
            />
          </div>
        </AdminFormSection>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full">
            {isSubmitting ? (
              <>{t('form.saving')}</>
            ) : (
              <>
                <Save className="h-4 w-4 me-2" />
                {t('form.submit')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-h-[44px] w-full"
          >
            {t('form.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}
