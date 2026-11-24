import {
  Bus,
  Camera,
  Drama,
  Eye,
  Filter,
  Landmark,
  Mail,
  Package,
  Phone,
  Plus,
  Printer,
  Search,
  Star,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/ui/share-button'
import { formatVendorShareData } from '@/lib/utils/share-formatters'
import { AdminEmptyState, AdminGroup, AdminPageHeader } from '@/components/features/admin'
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
  contact_name?: string | null
  average_rating?: number | null
  services?: string[] | null
}

async function getVendors(): Promise<Vendor[]> {
  const supabase = createClient()

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching vendors:', error)
    return []
  }

  return (vendors || []) as Vendor[]
}

async function getVendorStats() {
  const supabase = createClient()

  const [totalCount, categoriesData, avgRating] = await Promise.all([
    supabase.from('vendors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('vendors').select('category').eq('status', 'active'),
    supabase.from('vendors').select('rating').eq('status', 'active'),
  ])

  const categories = new Set(categoriesData.data?.map((v) => v.category) || []).size

  const ratings: number[] = avgRating.data?.map((v) => v.rating).filter(Boolean) || []
  const avgRatingValue =
    ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0

  return {
    total: totalCount.count || 0,
    categories,
    averageRating: avgRatingValue.toFixed(1),
  }
}

export default async function VendorsPage({ params }: { params: { locale: string } }) {
  // Admin routes skip the next-intl middleware header, so the locale must be set explicitly
  setRequestLocale(params.locale)
  const t = await getTranslations('admin.org.vendors')
  const [vendors, stats] = await Promise.all([getVendors(), getVendorStats()])

  // Group vendors by category
  const vendorsByCategory = vendors.reduce(
    (acc, vendor) => {
      const category = vendor.category || 'other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(vendor)
      return acc
    },
    {} as Record<string, Vendor[]>
  )

  const newAction = (
    <Link
      href="/admin/vendors/new"
      aria-label={t('newVendor')}
      data-testid="admin-vendors-new"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </Link>
  )

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        backHref="/admin/more"
        action={newAction}
      />

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="text-xl font-bold text-[#003153]">{stats.total}</div>
          <div className="mt-0.5 text-[11.5px] text-gray-500">{t('stats.total')}</div>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="text-xl font-bold text-[#003153]">{stats.categories}</div>
          <div className="mt-0.5 text-[11.5px] text-gray-500">{t('stats.categories')}</div>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-center gap-1 text-xl font-bold text-[#003153]">
            <Star className="h-4 w-4 fill-[#FFBA00] text-[#FFBA00]" aria-hidden="true" />
            {stats.averageRating}
          </div>
          <div className="mt-0.5 text-[11.5px] text-gray-500">{t('stats.averageRating')}</div>
        </div>
      </div>

      {/* Search / filter buttons (unchanged: they have no handler today) */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="min-h-[44px] flex-1">
          <Search className="h-4 w-4 me-2" aria-hidden="true" />
          {t('search')}
        </Button>
        <Button variant="outline" size="sm" className="min-h-[44px] flex-1">
          <Filter className="h-4 w-4 me-2" aria-hidden="true" />
          {t('filter')}
        </Button>
      </div>

      {vendors.length === 0 ? (
        <AdminEmptyState
          icon={Store}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <Button asChild size="sm">
              <Link href="/admin/vendors/new">
                <Plus className="h-4 w-4 me-2" aria-hidden="true" />
                {t('addVendor')}
              </Link>
            </Button>
          }
        />
      ) : (
        Object.entries(vendorsByCategory).map(([category, categoryVendors]) => {
          const CategoryIcon = categoryIcons[category] || Store
          const categoryLabel = t.has(`categories.${category}`)
            ? t(`categories.${category}`)
            : category

          return (
            <AdminGroup
              key={category}
              title={categoryLabel}
              description={t('vendorsCount', { count: categoryVendors.length })}
            >
              {categoryVendors.map((vendor) => (
                <article key={vendor.id} className="space-y-3 p-3" data-testid="admin-vendor-card">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[#87CEEB]/30 text-[#003153]">
                      <CategoryIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/vendors/${vendor.id}`}
                        className="block truncate text-[14.5px] font-bold text-[#003153] hover:underline"
                      >
                        {vendor.name}
                      </Link>
                      {vendor.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                          {vendor.description}
                        </p>
                      )}
                    </div>
                    {vendor.average_rating && vendor.average_rating > 0 && (
                      <span className="flex flex-none items-center gap-1 rounded-md bg-[#fff3cd] px-2 py-0.5">
                        <Star
                          className="h-3.5 w-3.5 fill-[#FFBA00] text-[#FFBA00]"
                          aria-hidden="true"
                        />
                        <span className="text-xs font-semibold text-[#8a5a00]">
                          {vendor.average_rating.toFixed(1)}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600">
                    {vendor.contact_name && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('contactLabel')}</span>
                        <span>{vendor.contact_name}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-none" aria-hidden="true" />
                        <a href={`tel:${vendor.phone}`} className="hover:text-[#0D98BA]" dir="ltr">
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-none" aria-hidden="true" />
                        <a
                          href={`mailto:${vendor.email}`}
                          className="min-w-0 truncate text-xs hover:text-[#0D98BA]"
                          dir="ltr"
                        >
                          {vendor.email}
                        </a>
                      </div>
                    )}
                    {vendor.services && vendor.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {vendor.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {vendor.services.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{vendor.services.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" asChild className="min-h-[44px] flex-1" size="sm">
                      <Link href={`/vendors/${vendor.id}`}>
                        <Eye className="h-4 w-4 me-2" aria-hidden="true" />
                        {t('view')}
                      </Link>
                    </Button>
                    {vendor.phone && (
                      <Button variant="default" asChild className="min-h-[44px] flex-1" size="sm">
                        <a href={`tel:${vendor.phone}`}>
                          <Phone className="h-4 w-4 me-2" aria-hidden="true" />
                          {t('call')}
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
                </article>
              ))}
            </AdminGroup>
          )
        })
      )}
    </div>
  )
}
