import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import { Roboto } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/layout/Navigation'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { HtmlAttributes } from '@/components/HtmlAttributes'
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt'
import { locales, localeDirections, type Locale } from '@/i18n/config'
import { logger } from '@/lib/logger'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-russian',
  display: 'swap',
  weight: ['300', '400', '500', '700', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'בארי נתניה - הנהגה הורית',
    template: '%s | בארי נתניה'
  },
  description: 'בארי נתניה - מערכת ניהול הנהגה הורית - אירועים, משימות, הוצאות ועוד',
  keywords: ['בארי נתניה', 'הנהגה הורית', 'אירועים', 'משימות', 'PWA'],
  authors: [{ name: 'בארי נתניה' }],
  creator: 'בארי נתניה',
  publisher: 'בארי נתניה',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://beeri.online',
    siteName: 'בארי נתניה',
    title: 'בארי נתניה - הנהגה הורית',
    description: 'בארי נתניה - מערכת ניהול הנהגה הורית - אירועים, משימות, ועדות ופרוטוקולים',
    images: [
      {
        url: 'https://beeri.online/og-image.png?v=6',
        width: 1200,
        height: 630,
        alt: 'בארי נתניה - הנהגה הורית',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'בארי נתניה - הנהגה הורית',
    description: 'בארי נתניה - מערכת ניהול הנהגה הורית - אירועים, משימות, ועדות ופרוטוקולים',
    images: ['https://beeri.online/og-image.png?v=6'],
  },
  manifest: '/manifest.json?v=5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'בארי נתניה',
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.png?v=5',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1668-2388.png?v=5',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1536-2048.png?v=5',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1170-2532.png?v=5',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-1125-2436.png?v=5',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png?v=5', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png?v=5', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico?v=5', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png?v=5', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  const messages = await getMessages()
  const direction = localeDirections[locale as Locale]
  const fontClass = locale === 'he' ? heebo.variable : roboto.variable
  const fontFamily = locale === 'he'
    ? 'var(--font-hebrew), system-ui, sans-serif'
    : 'var(--font-russian), system-ui, sans-serif'

  // RUNTIME GUARD 6: RTL Layout Verification
  // Verify Hebrew locale has RTL direction
  if ((locale === 'he' || locale === 'ar') && direction !== 'rtl') {
    logger.error('INVARIANT VIOLATION: Hebrew/Arabic locale without RTL direction', {
      component: 'Layout',
      action: 'LocaleLayout',
      data: { locale, direction }
    })
  }

  return (
    <>
      <GoogleAnalytics />
      <HtmlAttributes lang={locale} dir={direction} className={fontClass} />
      <div className="min-h-screen bg-background font-sans antialiased" style={{ fontFamily }}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navigation />
            {children}
            <IOSInstallPrompt />
          </Providers>
          <Toaster />
        </NextIntlClientProvider>
      </div>
    </>
  )
}
