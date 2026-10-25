import type { Metadata } from 'next'
import { KissAndRideContent } from '@/components/features/kiss-and-ride/KissAndRideContent'

export const metadata: Metadata = {
  title: 'נשק וסע — לוח תורנויות | בית ספר בארי נתניה',
  description: 'איזו כיתה תורנית בנשק וסע ומתי — בחרו את הכיתה שלכם וראו את התאריכים',
  openGraph: {
    title: 'נשק וסע — לוח תורנויות',
    description: 'הורי הכיתה התורנית עוזרים לילדים לרדת מהרכב, והכביש נשאר פנוי. בחרו את הכיתה שלכם וראו מתי התור שלה.',
    type: 'website',
    locale: 'he_IL',
    url: 'https://beeri.online/he/kiss-and-ride',
    siteName: 'בית ספר בארי נתניה',
  },
}

export default function KissAndRidePage() {
  return <KissAndRideContent />
}
