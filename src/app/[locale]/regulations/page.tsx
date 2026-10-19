import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RegulationsModalContent } from '@/components/features/protocols/RegulationsModalContent'
import { getRegulationsByLocale } from '@/components/features/protocols/regulations-content'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'regulations' })
  // "תשפ״ו–תשפ״ז (2026)" → "תשפ״ו–תשפ״ז"; the year comes from the content so metadata never goes stale
  const year = getRegulationsByLocale(locale).academicYear.replace(/\s*\(.*\)\s*$/, '')

  return {
    title: t('metaTitle'),
    description: t('metaDescription', { year }),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription', { year }),
      type: 'article',
      locale: locale === 'ru' ? 'ru_RU' : 'he_IL',
      url: `https://beeri.online/${locale}/regulations`,
      siteName: locale === 'ru' ? 'Школа Баари Нетания' : 'בית ספר בארי נתניה',
      images: [
        {
          url: 'https://beeri.online/og-image.png',
          width: 1200,
          height: 630,
          alt: t('ogTitle'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription', { year }),
    },
  }
}

export default function RegulationsPage() {
  return <RegulationsModalContent standalone={true} />
}
