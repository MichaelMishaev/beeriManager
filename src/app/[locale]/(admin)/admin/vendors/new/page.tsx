'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Save, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const vendorSchema = z.object({
  name: z.string().min(2, 'שם הספק חייב להכיל לפחות 2 תווים'),
  description: z.string().optional(),
  category: z.enum(['catering', 'equipment', 'entertainment', 'transportation', 'venue', 'photography', 'printing', 'other']),
  contact_person: z.string().optional(),
  phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין').optional().or(z.literal('')),
  email: z.string().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  website: z.string().url('כתובת אתר לא תקינה').optional().or(z.literal('')),
  address: z.string().optional(),
  business_number: z.string().optional(),
  license_number: z.string().optional(),
  price_range: z.string().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional()
})

type VendorFormData = z.infer<typeof vendorSchema>

const categoryLabels: Record<string, string> = {
  catering: 'קייטרינג',
  equipment: 'ציוד',
  entertainment: 'בידור',
  transportation: 'הסעות',
  venue: 'אולמות',
  photography: 'צילום',
  printing: 'הדפסה',
  other: 'אחר'
}

const priceRanges = [
  { value: 'budget', label: 'חסכוני (₪)' },
  { value: 'moderate', label: 'בינוני (₪₪)' },
  { value: 'premium', label: 'פרימיום (₪₪₪)' },
  { value: 'luxury', label: 'יוקרה (₪₪₪₪)' }
]

export default function NewVendorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      category: 'other'
    }
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
        status: 'active'
      }

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vendorData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הספק נוצר בהצלחה!')
        router.push('/admin/vendors')
      } else {
        toast.error(result.error || 'שגיאה ביצירת הספק')
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast.error('שגיאה ביצירת הספק')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">הוספת ספק חדש</h1>
        <p className="text-muted-foreground mt-2">
          הוסף ספק או נותן שירות למאגר
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הספק</CardTitle>
            <CardDescription>מידע בסיסי על הספק</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">שם הספק *</Label>
              <div className="relative">
                <Store className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="לדוגמה: קייטרינג הזהב"
                  className={`pr-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="תיאור הספק והשירותים שהוא מציע..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">קטגוריה *</Label>
                <Select
                  onValueChange={(value) => setValue('category', value as any)}
                  defaultValue="other"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price_range">טווח מחירים</Label>
                <Select onValueChange={(value) => setValue('price_range', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר טווח מחירים (אופציונלי)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי התקשרות</CardTitle>
            <CardDescription>איך ליצור קשר עם הספק</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_person">איש קשר</Label>
              <Input
                id="contact_person"
                {...register('contact_person')}
                placeholder="שם איש הקשר"
              />
            </div>

            <div>
              <Label htmlFor="phone">טלפון</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="050-1234567"
                  className={`pr-10 ${errors.phone ? 'border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">אימייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="supplier@example.com"
                  className={`pr-10 ${errors.email ? 'border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website">אתר אינטרנט</Label>
              <div className="relative">
                <Globe className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  {...register('website')}
                  placeholder="https://example.com"
                  className={`pr-10 ${errors.website ? 'border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.website && (
                <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">כתובת</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="כתובת מלאה"
                  className="pr-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>פרטים עסקיים</CardTitle>
            <CardDescription>מידע עסקי ומשפטי</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="business_number">ח.פ / ע.מ</Label>
                <Input
                  id="business_number"
                  {...register('business_number')}
                  placeholder="מספר עוסק מורשה"
                />
              </div>

              <div>
                <Label htmlFor="license_number">מספר רישיון</Label>
                <Input
                  id="license_number"
                  {...register('license_number')}
                  placeholder="מספר רישיון עסק"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment_terms">תנאי תשלום</Label>
              <Textarea
                id="payment_terms"
                {...register('payment_terms')}
                placeholder="לדוגמה: תשלום מראש, שוטף+30, וכו'"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="הערות נוספות על הספק..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>טוען...</>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                צור ספק
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="sm:w-auto"
          >
            ביטול
          </Button>
        </div>
      </form>
    </div>
  )
}
