import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Providers } from '@/components/providers'
import { type Locale } from '@/i18n/config'

export const metadata: Metadata = {
  title: 'בית ספר בארי - נתניה | חינוך חדשני ומעורב',
  description: 'בית ספר בארי - חינוך חדשני המפתח לומדים עצמאיים ובעלי יוזמה. 438 תלמידים, תכנית אנגלית מורחבת, חינוך יזמי וסביבתי. הצטרפו אלינו!',
  keywords: ['בית ספר בארי', 'נתניה', 'חינוך חדשני', 'בית ספר יסודי', 'הרשמה לבית ספר', 'חינוך יזמי'],
}

export default async function LandingLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  setRequestLocale(locale as Locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  )
}
