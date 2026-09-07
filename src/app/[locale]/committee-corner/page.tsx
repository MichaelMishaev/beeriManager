import type { Metadata } from 'next'
import { CommitteeCornerContent } from '@/components/features/committee-corner/CommitteeCornerContent'

export const metadata: Metadata = {
  title: 'פינת ועד ההורים של בארי | בית ספר בארי נתניה',
  description: 'תקנון, פרוטוקולים, נציגי ועד לפי כיתה ויצירת קשר עם ועד ההורים של בית ספר בארי נתניה',
  openGraph: {
    title: 'פינת ועד ההורים של בארי',
    description: 'כל המידע על הנהגת ההורים במקום אחד: תקנון, פרוטוקולים, נציגים ויצירת קשר',
    type: 'website',
    locale: 'he_IL',
    url: 'https://beeri.online/he/committee-corner',
    siteName: 'בית ספר בארי נתניה',
  },
}

export default function CommitteeCornerPage() {
  return <CommitteeCornerContent />
}
