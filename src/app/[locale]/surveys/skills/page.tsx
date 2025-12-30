import { Metadata } from 'next'
import { SkillSurveyForm } from '@/components/features/surveys/SkillSurveyForm'

export const metadata: Metadata = {
  title: 'הורי תלמידים למען בית הספר | בארי נתניה',
  description: 'ועד ההורים בונה מאגר קטן של הורים עם תחומי ידע וניסיון שונים. הרעיון פשוט: אם עולה צורך נקודתי בבית הספר – נדע למי אפשר לפנות, רק אם זה מתאים ובזמן שנוח לכם. נשמח אם תמלאו כמה פרטים קצרים 🙏',
  openGraph: {
    title: 'הורי תלמידים למען בית הספר',
    description: 'מחפשים הורים שרוצים לעזור – בדרך שמתאימה להם\n\nועד ההורים בונה מאגר קטן של הורים עם תחומי ידע וניסיון שונים. הרעיון פשוט: אם עולה צורך נקודתי בבית הספר – נדע למי אפשר לפנות, רק אם זה מתאים ובזמן שנוח לכם. נשמח אם תמלאו כמה פרטים קצרים 🙏',
    url: 'https://beeri.online/he/surveys/skills',
    siteName: 'בארי נתניה',
    images: [
      {
        url: 'https://beeri.online/logo-square.png',
        width: 512,
        height: 512,
        alt: 'בארי נתניה - סקר הורים',
        type: 'image/png',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'הורי תלמידים למען בית הספר',
    description: 'מחפשים הורים שרוצים לעזור – בדרך שמתאימה להם. ועד ההורים בונה מאגר קטן של הורים עם תחומי ידע וניסיון שונים.',
    images: ['https://beeri.online/logo-square.png'],
  },
}

export default function SkillSurveyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SkillSurveyForm />
    </div>
  )
}
