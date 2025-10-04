'use client'

import Script from 'next/script'

export function GoogleAnalytics() {
  // Hardcode for testing - env vars don't work in client components the same way
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9RS38VPXEZ'

  if (!measurementId) {
    return null
  }

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
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
