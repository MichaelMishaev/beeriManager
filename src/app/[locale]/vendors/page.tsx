import { Suspense } from 'react'
import Link from 'next/link'
import { Store, Phone, Mail, Star, Share2, MapPin, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/ui/share-button'
import { formatVendorShareData } from '@/lib/utils/share-formatters'
import { VendorSearch } from '@/components/features/vendors/VendorSearch'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

const categoryIcons: Record<string, string> = {
  catering: '🍕',
  equipment: '📦',
  entertainment: '🎭',
  transportation: '🚌',
  venue: '🏛️',
  photography: '📷',
  printing: '🖨️',
  other: '🏪'
}

async function getVendors() {
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

  return vendors || []
}

async function getVendorStats() {
  const supabase = createClient()

  const [totalCount, categoriesData, avgRating] = await Promise.all([
    supabase.from('vendors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('vendors').select('category').eq('status', 'active'),
    supabase.from('vendors').select('average_rating').eq('status', 'active')
  ])

  const categories = new Set(categoriesData.data?.map(v => v.category) || []).size

  const ratings = avgRating.data?.map(v => v.average_rating).filter(Boolean) || []
  const avgRatingValue = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r || 0), 0) / ratings.length
    : 0

  return {
    total: totalCount.count || 0,
    categories,
    averageRating: avgRatingValue.toFixed(1)
  }
}

function VendorsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

async function VendorsList() {
  const vendors = await getVendors()

  if (vendors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
          <Store className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">אין ספקים זמינים</h3>
        <p className="text-muted-foreground">
          עדיין לא נוספו ספקים למאגר
        </p>
      </div>
    )
  }

  // Group vendors by category
  const vendorsByCategory = vendors.reduce((acc, vendor) => {
    const category = vendor.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(vendor)
    return acc
  }, {} as Record<string, typeof vendors>)

  return (
    <div className="space-y-10">
      {Object.entries(vendorsByCategory).map(([category, categoryVendors]) => (
        <div key={category} id={category}>
          <div className="flex items-center gap-3 mb-6 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-3 -mt-3">
            <span className="text-3xl">{categoryIcons[category] || '🏪'}</span>
            <h2 className="text-2xl font-bold">{categoryLabels[category] || category}</h2>
            <Badge variant="secondary" className="text-sm">
              {(categoryVendors as typeof vendors).length}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(categoryVendors as typeof vendors).map((vendor) => (
              <Card
                key={vendor.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/vendors/${vendor.id}`}>
                        <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer line-clamp-1">
                          {vendor.name}
                        </CardTitle>
                      </Link>
                      {vendor.description && (
                        <CardDescription className="mt-2 line-clamp-2">
                          {vendor.description}
                        </CardDescription>
                      )}
                    </div>
                    {vendor.average_rating && vendor.average_rating > 0 && (
                      <div className="flex items-center gap-1 bg-gradient-to-br from-yellow-50 to-yellow-100 px-2.5 py-1.5 rounded-lg shrink-0">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-bold text-yellow-900">{vendor.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {vendor.contact_person && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium min-w-[70px]">איש קשר:</span>
                        <span className="truncate">{vendor.contact_person}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`tel:${vendor.phone}`}
                          className="hover:text-primary font-medium transition-colors"
                          dir="ltr"
                        >
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={`mailto:${vendor.email}`}
                          className="hover:text-primary text-xs truncate transition-colors"
                        >
                          {vendor.email}
                        </a>
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground line-clamp-1">{vendor.address}</span>
                      </div>
                    )}
                    {vendor.price_range && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">{vendor.price_range}</span>
                      </div>
                    )}
                  </div>

                  {/* Services Tags */}
                  {vendor.services_offered && vendor.services_offered.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {vendor.services_offered.slice(0, 3).map((service: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs font-normal">
                          {service}
                        </Badge>
                      ))}
                      {vendor.services_offered.length > 3 && (
                        <Badge variant="outline" className="text-xs font-normal bg-muted">
                          +{vendor.services_offered.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" asChild size="sm" className="group-hover:border-primary/50 transition-colors">
                        <Link href={`/vendors/${vendor.id}`}>
                          <Store className="h-4 w-4 ml-2" />
                          פרטים
                        </Link>
                      </Button>
                      {vendor.phone && (
                        <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                          <a href={`tel:${vendor.phone}`}>
                            <Phone className="h-4 w-4 ml-2" />
                            התקשר
                          </a>
                        </Button>
                      )}
                    </div>
                    <ShareButton
                      shareData={formatVendorShareData(vendor)}
                      variant="ghost"
                      size="sm"
                      className="w-full border border-dashed hover:border-solid hover:bg-accent"
                    >
                      <Share2 className="h-4 w-4 ml-2" />
                      שתף ספק
                    </ShareButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

async function VendorStats() {
  const stats = await getVendorStats()

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card className="border-2 bg-gradient-to-br from-blue-50 to-blue-100/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">סה"כ ספקים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
        </CardContent>
      </Card>
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-purple-100/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-900">קטגוריות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-700">{stats.categories}</div>
        </CardContent>
      </Card>
      <Card className="border-2 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-900">דירוג ממוצע</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold flex items-center gap-2 text-yellow-700">
            <Star className="h-7 w-7 fill-yellow-500 text-yellow-500" />
            {stats.averageRating}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function ShareAllButton() {
  const vendors = await getVendors()

  const shareData = {
    title: 'מאגר ספקים - ועד הורים בארי',
    text: `מאגר ספקים מומלצים (${vendors.length} ספקים)\n\nצפו ברשימה המלאה:`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/vendors`
  }

  return (
    <ShareButton
      shareData={shareData}
      variant="default"
      size="default"
      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg"
    >
      <Share2 className="h-4 w-4 ml-2" />
      שתף את כל הספקים
    </ShareButton>
  )
}

export default function VendorsPublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            מאגר ספקים מומלצים
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ספקים מאומתים ומומלצים לאירועי ועד ההורים - עם פרטי קשר, דירוגים וביקורות
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Suspense fallback={
              <Button disabled size="lg">
                <Share2 className="h-4 w-4 ml-2 animate-pulse" />
                טוען...
              </Button>
            }>
              <ShareAllButton />
            </Suspense>
          </div>
        </div>

        {/* Statistics */}
        <Suspense fallback={
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        }>
          <VendorStats />
        </Suspense>

        {/* Category Quick Links */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">קפיצה לקטגוריה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  asChild
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <a href={`#${key}`}>
                    <span className="ml-2">{categoryIcons[key]}</span>
                    {label}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendors List with Search */}
        <div className="space-y-6">
          <Suspense fallback={<VendorsListSkeleton />}>
            <VendorSearch />
            <VendorsList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
