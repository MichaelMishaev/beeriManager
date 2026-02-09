import type { Metadata } from 'next'
import { RegulationsModalContent } from '@/components/features/protocols/RegulationsModalContent'

export const metadata: Metadata = {
  title: 'תקנון הנהגת הורים | בית ספר בארי נתניה',
  description: 'תקנון הנהגת ההורים - בית ספר בארי, נתניה | צפו במסמך הרשמי המלא לשנת הלימודים תשפ״ה-תשפ״ו',
  openGraph: {
    title: 'תקנון הנהגת הורים - בית ספר בארי נתניה',
    description: 'צפו בתקנון הרשמי של הנהגת ההורים | מסמך מלא ומעודכן לשנת תשפ״ה-תשפ״ו',
    type: 'article',
    locale: 'he_IL',
    url: 'https://beeri.online/he/regulations',
    siteName: 'בית ספר בארי נתניה',
    images: [
      {
        url: 'https://beeri.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'תקנון הנהגת הורים - בית ספר בארי',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'תקנון הנהגת הורים - בית ספר בארי',
    description: 'צפו בתקנון הרשמי של הנהגת ההורים | מסמך מלא ומעודכן',
  },
}

export default function RegulationsPage() {
  return <RegulationsModalContent standalone={true} />
}
