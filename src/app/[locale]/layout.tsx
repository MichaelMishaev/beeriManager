import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import { Roboto } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/layout/Navigation'
import { locales, localeDirections, type Locale } from '@/i18n/config'

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
    default: 'ועד הורים - BeeriManager',
    template: '%s | ועד הורים'
  },
  description: 'מערכת ניהול ועד הורים - אירועים, משימות, הוצאות ועוד',
  keywords: ['ועד הורים', 'בית ספר', 'אירועים', 'משימות', 'PWA'],
  authors: [{ name: 'BeeriManager Team' }],
  creator: 'BeeriManager',
  publisher: 'BeeriManager',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ועד הורים',
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

  return (
    <html lang={locale} dir={direction} className={fontClass}>
      <body className="min-h-screen bg-background font-sans antialiased" style={{ fontFamily }}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navigation />
            {children}
          </Providers>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
