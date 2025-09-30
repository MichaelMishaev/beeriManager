import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/layout/Navigation'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen bg-background font-sans antialiased" style={{ fontFamily: 'var(--font-hebrew), system-ui, sans-serif' }}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}