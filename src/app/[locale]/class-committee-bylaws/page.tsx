import type { Metadata } from 'next'
import { ClassCommitteeBylawsContent } from '@/components/features/committee-corner/ClassCommitteeBylawsContent'

export const metadata: Metadata = {
  title: 'הצעה לתקנון ועדי כיתות | בית ספר בארי נתניה',
  description: 'הצעה לתקנון ועדי הכיתות של בית ספר בארי נתניה — כללים ברורים, שקופים ושוויוניים לעבודת ועדי הכיתות',
  openGraph: {
    title: 'הצעה לתקנון ועדי כיתות',
    description: 'כללים מוצעים לבחירת ועד כיתה, סמכויותיו, שקיפות כספית וניגוד עניינים',
    type: 'article',
    locale: 'he_IL',
    url: 'https://beeri.online/he/class-committee-bylaws',
    siteName: 'בית ספר בארי נתניה',
  },
}

export default function ClassCommitteeBylawsPage() {
  return <ClassCommitteeBylawsContent />
}
