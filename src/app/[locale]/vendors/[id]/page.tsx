import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Store, Phone, Mail, Globe, MapPin, DollarSign, FileText, ArrowRight, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/ui/share-button'
import { formatVendorShareData } from '@/lib/utils/share-formatters'

const categoryLabels: Record<string, string> = {
  catering: '🍕 קייטרינג',
  equipment: '📦 ציוד',
  entertainment: '🎭 בידור',
  transportation: '🚌 הסעות',
  venue: '🏛️ אולמות',
  photography: '📷 צילום',
  printing: '🖨️ הדפסה',
  other: '🏪 אחר'
}

const priceRangeLabels: Record<string, string> = {
  budget: 'חסכוני (₪)',
  moderate: 'בינוני (₪₪)',
  premium: 'פרימיום (₪₪₪)',
  luxury: 'יוקרה (₪₪₪₪)'
}

async function getVendor(id: string) {
  const supabase = createClient()

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !vendor) {
    return null
  }

  return vendor
}

function VendorDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

async function VendorDetail({ id }: { id: string }) {
  const vendor = await getVendor(id)

  if (!vendor) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Store className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">{vendor.name}</CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="text-sm">
                  {categoryLabels[vendor.category] || vendor.category}
                </Badge>
                {vendor.price_range && (
                  <Badge variant="secondary" className="text-sm">
                    <DollarSign className="h-3 w-3 ml-1" />
                    {priceRangeLabels[vendor.price_range] || vendor.price_range}
                  </Badge>
                )}
                {vendor.overall_rating && vendor.overall_rating > 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-sm">
                    <Star className="h-3 w-3 ml-1 fill-yellow-400 text-yellow-400" />
                    {vendor.overall_rating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {vendor.description && (
            <p className="text-muted-foreground leading-relaxed mb-4">
              {vendor.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {vendor.phone && (
              <Button asChild size="sm">
                <a href={`tel:${vendor.phone}`}>
                  <Phone className="h-4 w-4 ml-2" />
                  התקשר
                </a>
              </Button>
            )}
            {vendor.email && (
              <Button variant="outline" asChild size="sm">
                <a href={`mailto:${vendor.email}`}>
                  <Mail className="h-4 w-4 ml-2" />
                  שלח מייל
                </a>
              </Button>
            )}
            {vendor.website && (
              <Button variant="outline" asChild size="sm">
                <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 ml-2" />
                  אתר אינטרנט
                </a>
              </Button>
            )}
            <ShareButton
                shareData={formatVendorShareData(vendor)}
                variant="outline"
                size="sm"
              />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            פרטי התקשרות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vendor.contact_person && (
            <div className="flex items-center gap-3">
              <div className="w-32 text-muted-foreground">איש קשר:</div>
              <div className="font-medium">{vendor.contact_person}</div>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-3">
              <div className="w-32 text-muted-foreground">טלפון:</div>
              <a href={`tel:${vendor.phone}`} className="font-medium hover:text-primary">
                {vendor.phone}
              </a>
            </div>
          )}
          {vendor.email && (
            <div className="flex items-center gap-3">
              <div className="w-32 text-muted-foreground">אימייל:</div>
              <a href={`mailto:${vendor.email}`} className="font-medium hover:text-primary break-all">
                {vendor.email}
              </a>
            </div>
          )}
          {vendor.website && (
            <div className="flex items-center gap-3">
              <div className="w-32 text-muted-foreground">אתר אינטרנט:</div>
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary break-all">
                {vendor.website}
              </a>
            </div>
          )}
          {vendor.address && (
            <div className="flex items-start gap-3">
              <div className="w-32 text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                כתובת:
              </div>
              <div className="font-medium">{vendor.address}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Details - Only show if has content */}
      {(vendor.business_number || vendor.license_number || vendor.payment_terms) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              פרטים נוספים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.business_number && (
              <div className="flex items-center gap-3">
                <div className="w-32 text-muted-foreground">ח.פ / ע.מ:</div>
                <div className="font-medium">{vendor.business_number}</div>
              </div>
            )}
            {vendor.license_number && (
              <div className="flex items-center gap-3">
                <div className="w-32 text-muted-foreground">מספר רישיון:</div>
                <div className="font-medium">{vendor.license_number}</div>
              </div>
            )}
            {vendor.payment_terms && (
              <div className="flex items-start gap-3">
                <div className="w-32 text-muted-foreground">תנאי תשלום:</div>
                <div className="font-medium whitespace-pre-wrap">{vendor.payment_terms}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                ספק מומלץ מטעם ועד ההורים
              </p>
              <p className="text-sm text-blue-700">
                הספק הוסף למאגר הספקים המומלצים שלנו. לפרטים נוספים על ספקים נוספים, צור קשר עם ועד ההורים.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה לעמוד הבית
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function VendorPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Suspense fallback={<VendorDetailSkeleton />}>
        <VendorDetail id={params.id} />
      </Suspense>
    </div>
  )
}
