import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MankalCircularContent } from '@/components/features/committee-corner/MankalCircularContent'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'mankalCircularPage' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('title'),
      description: t('metaDescription'),
      type: 'article',
      locale: locale === 'ru' ? 'ru_RU' : 'he_IL',
      url: `https://beeri.online/${locale}/mankal-circular`,
      siteName: locale === 'ru' ? 'Школа Баари Нетания' : 'בית ספר בארי נתניה',
    },
  }
}

export default function MankalCircularPage({ params }: { params: { locale: string } }) {
  return <MankalCircularContent locale={params.locale} />
}
