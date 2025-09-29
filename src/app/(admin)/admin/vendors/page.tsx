import { Suspense } from 'react'
import Link from 'next/link'
import { Store, Phone, Mail, Star, Plus, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

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
    .eq('is_active', true)
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
    supabase.from('vendors').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('vendors').select('category').eq('is_active', true),
    supabase.from('vendors').select('average_rating').eq('is_active', true)
  ])

  const categories = new Set(categoriesData.data?.map(v => v.category) || []).size

  const ratings = avgRating.data?.map(v => v.average_rating).filter(Boolean) || []
  const avgRatingValue = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0

  return {
    total: totalCount.count || 0,
    categories,
    averageRating: avgRatingValue.toFixed(1)
  }
}

function VendorsListSkeleton() {
  return (
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

async function VendorsList() {
  const vendors = await getVendors()

  if (vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין ספקים</h3>
        <p className="text-muted-foreground mb-6">
          עדיין לא נוספו ספקים למערכת
        </p>
        <Button asChild>
          <Link href="/admin/vendors/new">
            <Plus className="h-4 w-4 ml-2" />
            הוסף ספק
          </Link>
        </Button>
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
    <div className="space-y-8">
      {Object.entries(vendorsByCategory).map(([category, categoryVendors]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{categoryIcons[category] || '🏪'}</span>
            <h2 className="text-xl font-bold">{categoryLabels[category] || category}</h2>
            <Badge variant="outline" className="text-sm">
              {(categoryVendors as typeof vendors).length} ספקים
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(categoryVendors as typeof vendors).map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{vendor.name}</CardTitle>
                      {vendor.description && (
                        <CardDescription className="mt-2 line-clamp-2">
                          {vendor.description}
                        </CardDescription>
                      )}
                    </div>
                    {vendor.average_rating && vendor.average_rating > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{vendor.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {vendor.contact_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">איש קשר:</span>
                        <span>{vendor.contact_name}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${vendor.phone}`} className="hover:text-primary">
                          {vendor.phone}
                        </a>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${vendor.email}`} className="hover:text-primary text-xs">
                          {vendor.email}
                        </a>
                      </div>
                    )}
                    {vendor.services && vendor.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {vendor.services.slice(0, 3).map((service: string, index: number) => (
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

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" asChild className="flex-1">
                      <Link href={`/admin/vendors/${vendor.id}/edit`}>
                        ערוך
                      </Link>
                    </Button>
                    <Button size="sm" variant="default" asChild className="flex-1">
                      <a href={`tel:${vendor.phone}`}>
                        <Phone className="h-4 w-4 ml-2" />
                        התקשר
                      </a>
                    </Button>
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
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">סה"כ ספקים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">קטגוריות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.categories}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">דירוג ממוצע</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            {stats.averageRating}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VendorsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ספקים ונותני שירותים</h1>
          <p className="text-muted-foreground mt-2">
            מאגר ספקים מאומתים עם פרטי קשר ודירוגים
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 ml-2" />
            חיפוש
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 ml-2" />
            סינון
          </Button>
          <Button asChild>
            <Link href="/admin/vendors/new">
              <Plus className="h-4 w-4 ml-2" />
              ספק חדש
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse" />}>
        <VendorStats />
      </Suspense>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            כל הספקים
          </CardTitle>
          <CardDescription>
            ספקים מאומתים ומומלצים לפעילויות ועד ההורים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<VendorsListSkeleton />}>
            <VendorsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}