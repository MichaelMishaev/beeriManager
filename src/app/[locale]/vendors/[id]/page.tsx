import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, Star, MapPin, Globe, ArrowRight, Share2, DollarSign, Building2, FileText, Edit, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/ui/share-button'
import { formatVendorShareData } from '@/lib/utils/share-formatters'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth/jwt'
import { DeleteVendorButton } from '@/components/features/vendors/DeleteVendorButton'

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

async function getVendorReviews(id: string) {
  const supabase = createClient()

  const { data: reviews, error } = await supabase
    .from('vendor_reviews')
    .select('*')
    .eq('vendor_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return reviews || []
}

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const vendor = await getVendor(params.id)

  if (!vendor) {
    notFound()
  }

  const reviews = await getVendorReviews(params.id)

  // Check if user is admin
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')
  const isAdmin = token ? await verifyJWT(token.value) : false

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Back Button - Mobile First */}
        <Button variant="ghost" asChild className="mb-4 -mx-2">
          <Link href="/vendors">
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה לכל הספקים
          </Link>
        </Button>

        {/* Vendor Header Card - Mobile Optimized */}
        <Card className="border-2 shadow-lg mb-6">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-2xl">{categoryIcons[vendor.category] || '🏪'}</span>
                  <Badge variant="secondary">
                    {categoryLabels[vendor.category] || vendor.category}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold">{vendor.name}</h1>
                {vendor.description && (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {vendor.description}
                  </p>
                )}
              </div>

              {/* Rating Badge */}
              {vendor.overall_rating && vendor.overall_rating > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-50 to-yellow-100 px-4 py-3 rounded-xl border-2 border-yellow-200 self-start">
                  <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-900">{vendor.overall_rating.toFixed(1)}</div>
                    <div className="text-xs text-yellow-700">{vendor.total_reviews || 0} ביקורות</div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Quick Actions - Mobile First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendor.phone && (
                <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <a href={`tel:${vendor.phone}`}>
                    <Phone className="h-5 w-5 ml-2" />
                    התקשר עכשיו
                  </a>
                </Button>
              )}
              <ShareButton
                shareData={formatVendorShareData(vendor)}
                variant="outline"
                size="lg"
                className="w-full border-2"
              >
                <Share2 className="h-5 w-5 ml-2" />
                שתף ספק
              </ShareButton>
            </div>

            <Separator />

            {/* Contact Information - Mobile Optimized Grid */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                פרטי קשר
              </h3>
              <div className="grid gap-4">
                {vendor.contact_person && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-sm text-muted-foreground min-w-[100px]">איש קשר:</span>
                    <span className="font-medium">{vendor.contact_person}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground sm:hidden" />
                    <span className="font-medium text-sm text-muted-foreground min-w-[100px]">טלפון:</span>
                    <a href={`tel:${vendor.phone}`} className="font-medium hover:text-primary text-lg" dir="ltr">
                      {vendor.phone}
                    </a>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground sm:hidden" />
                    <span className="font-medium text-sm text-muted-foreground min-w-[100px]">אימייל:</span>
                    <a href={`mailto:${vendor.email}`} className="hover:text-primary break-all">
                      {vendor.email}
                    </a>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Globe className="h-4 w-4 text-muted-foreground sm:hidden" />
                    <span className="font-medium text-sm text-muted-foreground min-w-[100px]">אתר:</span>
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary break-all underline"
                    >
                      {vendor.website}
                    </a>
                  </div>
                )}
                {vendor.address && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground sm:mt-1" />
                    <span className="font-medium text-sm text-muted-foreground min-w-[100px]">כתובת:</span>
                    <span className="flex-1">{vendor.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Business Details */}
            {(vendor.business_number || vendor.license_number || vendor.price_range || vendor.payment_terms) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    פרטים עסקיים
                  </h3>
                  <div className="grid gap-3">
                    {vendor.business_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-muted-foreground min-w-[120px]">ח.פ / ע.מ:</span>
                        <span>{vendor.business_number}</span>
                      </div>
                    )}
                    {vendor.license_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-muted-foreground min-w-[120px]">רישיון:</span>
                        <span>{vendor.license_number}</span>
                      </div>
                    )}
                    {vendor.price_range && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground min-w-[120px]">טווח מחירים:</span>
                        <span>{vendor.price_range}</span>
                      </div>
                    )}
                    {vendor.payment_terms && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="font-medium text-muted-foreground min-w-[120px]">תנאי תשלום:</span>
                        <span className="flex-1">{vendor.payment_terms}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Services Offered */}
            {vendor.services_offered && vendor.services_offered.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">שירותים מוצעים</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.services_offered.map((service: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {vendor.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">הערות</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ביקורות ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold mb-1">{review.title}</h4>
                  )}
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.review_text}
                    </p>
                  )}
                  {review.reviewer_name && (
                    <p className="text-xs text-muted-foreground mt-2">
                      - {review.reviewer_name}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Admin Controls - Only visible to logged-in admins */}
        {isAdmin && (
          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Settings className="h-5 w-5" />
                פקדי מנהל
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/admin/vendors/${vendor.id}`}>
                    <Edit className="h-4 w-4 ml-2" />
                    ערוך ספק
                  </Link>
                </Button>
                <DeleteVendorButton vendorId={vendor.id} vendorName={vendor.name} />
              </div>
              <p className="text-xs text-amber-700 mt-3">
                💡 אתה רואה את הכפתורים האלה כי אתה מנהל מחובר
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
