import { ArrowRight, ChevronDown, Download } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { PointList } from '@/components/features/committee-corner/MankalCircularContent'
import { MUNICIPAL_BYLAWS_PDF, municipalBylawsSections } from '@/lib/data/netanya-municipal-bylaws'

export async function MunicipalBylawsContent({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'municipalBylawsPage' })
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-[#003153] text-white">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <Link
            href="/committee-corner"
            className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
            {t('backToCorner')}
          </Link>
          <h1 className="text-2xl font-bold leading-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-white/80">{t('subtitle')}</p>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-6">
        {locale !== 'he' && (
          <p className="mb-4 rounded-lg border border-[#FFBA00]/40 bg-[#FFBA00]/10 px-4 py-3 text-sm text-gray-800">
            {t('hebrewOnlyNote')}
          </p>
        )}

        {/* The bylaws themselves are Hebrew-only, so the document card is always RTL */}
        <div lang="he" dir="rtl" className="rounded-xl border border-[#0D98BA]/15 bg-white p-4 shadow-sm sm:p-6">
          <details className="group rounded-lg border border-[#0D98BA]/20 bg-[#0D98BA]/[0.04]">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-4 font-bold text-[#003153] [&::-webkit-details-marker]:hidden">
              {t('sectionsNav')}
              <ChevronDown
                className="h-4 w-4 text-[#0D98BA] transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <nav aria-label={t('sectionsNav')} className="border-t border-[#0D98BA]/15 py-1">
              {municipalBylawsSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex min-h-[44px] items-center px-4 text-sm text-gray-800 hover:bg-[#0D98BA]/5"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </details>

          {municipalBylawsSections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mt-8 scroll-mt-4"
              aria-labelledby={`${section.id}-title`}
            >
              <h2
                id={`${section.id}-title`}
                className="mb-4 border-b border-[#0D98BA]/20 pb-2 text-lg font-bold text-[#003153]"
              >
                {section.title}
              </h2>
              <PointList points={section.points} />
            </section>
          ))}
        </div>

        <a
          href={MUNICIPAL_BYLAWS_PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex min-h-[44px] items-start gap-2 text-sm text-gray-600 hover:text-[#0D98BA]"
        >
          <Download className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('sourceNote')}</span>
        </a>
      </main>
    </div>
  )
}
