'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView, detectUserType } from '@/lib/analytics'
import { useRef } from 'react'

/**
 * RouteChangeTracker - Tracks client-side route changes in Next.js App Router
 *
 * This component monitors route changes and sends page_view events to Google Analytics
 * whenever the user navigates to a new page using client-side navigation.
 *
 * CRITICAL for SPAs: Without this, GA4 only tracks the initial page load,
 * resulting in 100% bounce rate and incorrect page view counts.
 */
export function RouteChangeTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastPageLocationRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[RouteChangeTracker] Route changed:', pathname)
      return
    }

    // Build full path including query params
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const pageLocation = `${origin}${url}`

    // Detect user type for better analytics segmentation
    const userType = detectUserType()

    // Determine referrer: previous in-app location or document.referrer on first hit
    const pageReferrer = lastPageLocationRef.current || (typeof document !== 'undefined' ? document.referrer || undefined : undefined)

    // Send page_view event to GA4 and GTM
    trackPageView({
      page_path: url,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      page_location: pageLocation,
      page_referrer: pageReferrer,
      userType,
    })

    lastPageLocationRef.current = pageLocation
  }, [pathname, searchParams])

  return null
}
