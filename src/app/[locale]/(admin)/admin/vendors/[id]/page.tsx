import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import {
  Bus,
  Calendar,
  Camera,
  Drama,
  DollarSign,
  Globe,
  Landmark,
  Mail,
  Package,
  Pencil,
  Phone,
  Printer,
  Star,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { formatHebrewDate } from '@/lib/utils/date'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/ui/share-button'
import { formatVendorShareData } from '@/lib/utils/share-formatters'
import { DeleteVendorButton } from '@/components/features/vendors/DeleteVendorButton'
import { AdminFormSection, AdminPageHeader, StatusPill } from '@/components/features/admin'
import { Link } from '@/i18n/navigation'

const categoryIcons: Record<string, LucideIcon> = {
  catering: UtensilsCrossed,
  equipment: Package,
  entertainment: Drama,
  transportation: Bus,
  venue: Landmark,
  photography: Camera,
  printing: Printer,
  other: Store,
}

interface Vendor {
  id: string
  name: string
  category: string
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  contact_person?: string | null
  business_number?: string | null
  license_number?: string | null
  payment_terms?: string | null
  notes?: string | null
  price_range?: string | null
  overall_rating?: number | null
  created_at: string
  updated_at?: string | null
}

async function getVendor(id: string): Promise<Vendor | null> {
  const supabase = createClient()

  const { data: vendor, error } = await supabase.from('vendors').select('*').eq('id', id).single()

  if (error || !vendor) {
    return null
  }

  return vendor as Vendor
}

function DetailRow({
  label,
  children,
  multiline = false,
}: {
  label: string
  children: ReactNode
  multiline?: boolean
}) {
  return (
    <div className={multiline ? 'flex items-start gap-3' : 'flex items-center gap-3'}>
      <div className="w-28 flex-none text-sm text-gray-500">{label}</div>
      <div className="min-w-0 flex-1 text-sm font-medium text-[#003153]">{children}</div>
    </div>
  )
}

export default async function VendorPage({ params }: { params: { id: string; locale: string } }) {
  // Admin routes skip the next-intl middleware header, so the locale must be set explicitly
  setRequestLocale(params.locale)
  const t = await getTranslations('admin.org.vendors')
  const vendor = await getVendor(params.id)

  if (!vendor) {
    notFound()
  }

  const CategoryIcon = categoryIcons[vendor.category] || Store
  const categoryLabel = t.has(`categories.${vendor.category}`)
    ? t(`categories.${vendor.category}`)
    : vendor.category
  const priceRangeLabel = vendor.price_range
    ? t.has(`priceRanges.${vendor.price_range}`)
      ? t(`priceRanges.${vendor.price_range}`)
      : vendor.price_range
    : null

  return (
    <div className="space-y-4">
      <AdminPageHeader title={vendor.name} backHref="/admin/vendors" />

      {/* Header card */}
      <section className="space-y-4 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#87CEEB]/30 px-[7px] py-0.5 text-[11px] font-semibold text-[#003153]">
            <CategoryIcon className="h-3 w-3" aria-hidden="true" />
            {categoryLabel}
          </span>
          {priceRangeLabel && (
            <StatusPill tone="neutral">
              <DollarSign className="me-0.5 h-3 w-3" aria-hidden="true" />
              {priceRangeLabel}
            </StatusPill>
          )}
          {vendor.overall_rating && vendor.overall_rating > 0 && (
            <StatusPill tone="warning">
              <Star className="me-0.5 h-3 w-3 fill-[#FFBA00] text-[#FFBA00]" aria-hidden="true" />
              {vendor.overall_rating.toFixed(1)}
            </StatusPill>
          )}
        </div>

        {vendor.description && (
          <p className="leading-relaxed text-gray-600">{vendor.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {vendor.phone && (
            <Button asChild size="sm" className="min-h-[44px]">
              <a href={`tel:${vendor.phone}`}>
                <Phone className="h-4 w-4 me-2" aria-hidden="true" />
                {t('detail.call')}
              </a>
            </Button>
          )}
          {vendor.email && (
            <Button variant="outline" asChild size="sm" className="min-h-[44px]">
              <a href={`mailto:${vendor.email}`}>
                <Mail className="h-4 w-4 me-2" aria-hidden="true" />
                {t('detail.sendEmail')}
              </a>
            </Button>
          )}
          {vendor.website && (
            <Button variant="outline" asChild size="sm" className="min-h-[44px]">
              <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 me-2" aria-hidden="true" />
                {t('detail.website')}
              </a>
            </Button>
          )}
          <ShareButton
            shareData={formatVendorShareData(vendor)}
            variant="outline"
            size="sm"
            className="min-h-[44px]"
          />
        </div>
      </section>

      {/* Contact Information */}
      <AdminFormSection title={t('detail.contactTitle')}>
        {vendor.contact_person && (
          <DetailRow label={t('detail.contactPerson')}>{vendor.contact_person}</DetailRow>
        )}
        {vendor.phone && (
          <DetailRow label={t('detail.phone')}>
            <a href={`tel:${vendor.phone}`} className="hover:text-[#0D98BA]" dir="ltr">
              {vendor.phone}
            </a>
          </DetailRow>
        )}
        {vendor.email && (
          <DetailRow label={t('detail.email')}>
            <a href={`mailto:${vendor.email}`} className="break-all hover:text-[#0D98BA]" dir="ltr">
              {vendor.email}
            </a>
          </DetailRow>
        )}
        {vendor.website && (
          <DetailRow label={t('detail.websiteLabel')}>
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all hover:text-[#0D98BA]"
              dir="ltr"
            >
              {vendor.website}
            </a>
          </DetailRow>
        )}
        {vendor.address && (
          <DetailRow label={t('detail.address')} multiline>
            {vendor.address}
          </DetailRow>
        )}
      </AdminFormSection>

      {/* Business Details */}
      <AdminFormSection title={t('detail.businessTitle')}>
        {vendor.business_number && (
          <DetailRow label={t('detail.businessNumber')}>{vendor.business_number}</DetailRow>
        )}
        {vendor.license_number && (
          <DetailRow label={t('detail.licenseNumber')}>{vendor.license_number}</DetailRow>
        )}
        {vendor.payment_terms && (
          <DetailRow label={t('detail.paymentTerms')} multiline>
            <span className="whitespace-pre-wrap">{vendor.payment_terms}</span>
          </DetailRow>
        )}
        {vendor.notes && (
          <DetailRow label={t('detail.notes')} multiline>
            <span className="whitespace-pre-wrap font-normal text-gray-600">{vendor.notes}</span>
          </DetailRow>
        )}
      </AdminFormSection>

      {/* Metadata */}
      <section className="space-y-2 rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 flex-none" aria-hidden="true" />
          <span>{t('detail.createdAt', { date: formatHebrewDate(new Date(vendor.created_at)) })}</span>
        </div>
        {vendor.updated_at && vendor.updated_at !== vendor.created_at && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-none" aria-hidden="true" />
            <span>
              {t('detail.updatedAt', { date: formatHebrewDate(new Date(vendor.updated_at)) })}
            </span>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button asChild className="min-h-[44px] w-full">
          <Link href={`/admin/vendors/${vendor.id}/edit`}>
            <Pencil className="h-4 w-4 me-2" aria-hidden="true" />
            {t('detail.edit')}
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-[44px] w-full">
          <Link href="/admin/vendors">{t('detail.backToList')}</Link>
        </Button>
        <DeleteVendorButton vendorId={vendor.id} vendorName={vendor.name} />
      </div>
    </div>
  )
}
