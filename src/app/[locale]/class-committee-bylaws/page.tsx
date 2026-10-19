import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ClassCommitteeBylawsContent } from '@/components/features/committee-corner/ClassCommitteeBylawsContent'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'classBylawsPage' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
      locale: locale === 'ru' ? 'ru_RU' : 'he_IL',
      url: `https://beeri.online/${locale}/class-committee-bylaws`,
      siteName: locale === 'ru' ? 'Школа Баари Нетания' : 'בית ספר בארי נתניה',
    },
  }
}

export default function ClassCommitteeBylawsPage() {
  return <ClassCommitteeBylawsContent />
}
