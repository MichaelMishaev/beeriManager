'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView, detectUserType } from '@/lib/analytics'

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

  useEffect(() => {
    // Skip if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[RouteChangeTracker] Route changed:', pathname)
      return
    }

    // Build full path including query params
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    // Detect user type for better analytics segmentation
    const userType = detectUserType()

    // Send page_view event to GA4
    trackPageView(url, document.title, userType)

    // Also send to gtag directly for immediate tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_title: document.title,
        user_type: userType,
      })
    }
  }, [pathname, searchParams])

  return null
}
