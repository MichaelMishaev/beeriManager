'use client'

import Script from 'next/script'
import { RouteChangeTracker } from './RouteChangeTracker'

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // CRITICAL: Don't load GA in development environment
  // This prevents localhost:4500 traffic from being tracked
  if (process.env.NODE_ENV === 'development') {
    console.log('[GA] Skipping GA in development mode')
    // Still render RouteChangeTracker for console logging in dev
    return <RouteChangeTracker />
  }

  // Don't load GA if no measurement ID configured
  if (!measurementId) {
    console.warn('[GA] No NEXT_PUBLIC_GA_MEASUREMENT_ID found - GA disabled')
    return null
  }

  // Only load GA in production with proper domain restriction
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Configure GA with production domain restriction
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            // Restrict tracking to production domain only
            cookie_domain: 'beeri.online',
            cookie_flags: 'SameSite=None;Secure',
            // CRITICAL: Disable automatic page_view on initial load
            // We'll handle all page views manually via RouteChangeTracker
            send_page_view: false
          });
        `}
      </Script>
      {/* Track all route changes including initial page load */}
      <RouteChangeTracker />
    </>
  )
}
