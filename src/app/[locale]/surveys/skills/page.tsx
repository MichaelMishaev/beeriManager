import { Metadata } from 'next'
import { SkillSurveyForm } from '@/components/features/surveys/SkillSurveyForm'

export const metadata: Metadata = {
  title: 'הורי תלמידים למען בית הספר | BeeriManager',
  description: 'מחפשים הורים שרוצים לעזור – בדרך שמתאימה להם. אין התחייבות, פניות נקודתיות בלבד.',
  openGraph: {
    title: 'הורי תלמידים למען בית הספר',
    description: 'מחפשים הורים שרוצים לעזור – בדרך שמתאימה להם. אין התחייבות, פניות נקודתיות בלבד.',
    url: 'https://beeri.online/he/surveys/skills',
    siteName: 'BeeriManager',
    images: [
      {
        url: 'https://beeri.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'סקר הורים - כישורים ומקצועות',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'הורי תלמידים למען בית הספר',
    description: 'מחפשים הורים שרוצים לעזור – בדרך שמתאימה להם',
    images: ['https://beeri.online/og-image.png'],
  },
}

export default function SkillSurveyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SkillSurveyForm />
    </div>
  )
}
