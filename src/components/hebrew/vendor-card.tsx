import * as React from "react"
import { Phone, Mail, MapPin, Star, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Vendor {
  id: string
  name: string
  category: 'catering' | 'equipment' | 'transportation' | 'venue' | 'services' | 'supplies' | 'other'
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  rating?: number
  total_jobs?: number
  average_cost?: number
  last_used?: string
  notes?: string
  status: 'active' | 'inactive' | 'preferred' | 'blacklisted'
  specialties?: string[]
  availability?: 'available' | 'busy' | 'unavailable'
}

interface VendorCardProps {
  vendor: Vendor
  variant?: 'full' | 'compact'
  showActions?: boolean
  onEdit?: () => void
  onContact?: () => void
  onHire?: () => void
  onView?: () => void
  className?: string
}

const categoryLabels = {
  catering: 'קייטרינג',
  equipment: 'ציוד',
  transportation: 'הסעות',
  venue: 'מקום',
  services: 'שירותים',
  supplies: 'ציוד ואביזרים',
  other: 'אחר'
}

const statusLabels = {
  active: 'פעיל',
  inactive: 'לא פעיל',
  preferred: 'מועדף',
  blacklisted: 'ברשימה שחורה'
}

const statusColors = {
  active: 'default',
  inactive: 'secondary',
  preferred: 'default',
  blacklisted: 'destructive'
} as const

const availabilityLabels = {
  available: 'זמין',
  busy: 'עסוק',
  unavailable: 'לא זמין'
}

const availabilityColors = {
  available: 'default',
  busy: 'warning',
  unavailable: 'secondary'
} as const

export function VendorCard({
  vendor,
  variant = 'full',
  showActions = true,
  onEdit,
  onContact,
  onHire,
  onView,
  className
}: VendorCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 border-r-4",
        vendor.status === 'preferred' && "border-r-green-500 shadow-green-100",
        vendor.status === 'blacklisted' && "border-r-red-500 shadow-red-100 opacity-75",
        vendor.status === 'active' && "border-r-blue-500",
        vendor.status === 'inactive' && "border-r-gray-400 opacity-75",
        className
      )}
      data-testid="vendor-card"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-right leading-tight">
              {vendor.name}
            </CardTitle>
            {vendor.contact_person && (
              <p className="text-sm text-muted-foreground text-right mt-1">
                איש קשר: {vendor.contact_person}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 justify-end flex-wrap">
              <Badge variant={statusColors[vendor.status]} className="text-xs">
                {statusLabels[vendor.status]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {categoryLabels[vendor.category]}
              </Badge>
              {vendor.availability && (
                <Badge variant={availabilityColors[vendor.availability]} className="text-xs">
                  {availabilityLabels[vendor.availability]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {vendor.rating !== undefined && (
            <div className="flex items-center gap-2 justify-end">
              <span className="font-medium text-right">
                {vendor.rating.toFixed(1)}
              </span>
              <div className="flex gap-1">
                {renderStars(vendor.rating)}
              </div>
            </div>
          )}

          {vendor.phone && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-right" dir="ltr">{vendor.phone}</span>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {vendor.email && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-right text-sm" dir="ltr">{vendor.email}</span>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {vendor.address && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-right text-sm">{vendor.address}</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {vendor.average_cost && (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-right font-medium">
                ₪{vendor.average_cost.toLocaleString()} ממוצע
              </span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {vendor.total_jobs && (
            <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
              <span className="text-right">
                {vendor.total_jobs} עבודות שבוצעו
              </span>
              <Calendar className="h-3 w-3" />
            </div>
          )}

          {variant === 'full' && vendor.specialties && vendor.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end mt-2">
              {vendor.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          {variant === 'full' && vendor.notes && (
            <div className="mt-3 p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground text-right">
                {vendor.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 justify-start pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            פרטים
          </Button>

          {vendor.status !== 'blacklisted' && (
            <>
              {vendor.phone && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onContact}
                  className="flex-1"
                >
                  יצירת קשר
                </Button>
              )}

              {vendor.availability === 'available' && (
                <Button
                  size="sm"
                  onClick={onHire}
                  className="flex-1"
                  variant={vendor.status === 'preferred' ? 'default' : 'outline'}
                >
                  שכר
                </Button>
              )}
            </>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              עריכה
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// Compact version for mobile or lists
export function VendorCardCompact({ vendor, ...props }: VendorCardProps) {
  return (
    <VendorCard
      {...props}
      vendor={vendor}
      variant="compact"
      className={cn("p-3", props.className)}
    />
  )
}