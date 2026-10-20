import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MunicipalBylawsContent } from '@/components/features/committee-corner/MunicipalBylawsContent'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'municipalBylawsPage' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('title'),
      description: t('metaDescription'),
      type: 'article',
      locale: locale === 'ru' ? 'ru_RU' : 'he_IL',
      url: `https://beeri.online/${locale}/municipal-bylaws`,
      siteName: locale === 'ru' ? 'Школа Баари Нетания' : 'בית ספר בארי נתניה',
    },
  }
}

export default function MunicipalBylawsPage({ params }: { params: { locale: string } }) {
  return <MunicipalBylawsContent locale={params.locale} />
}
