import { ArrowRight, ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getMankalCircularByLocale } from '@/lib/data/mankal-parent-committee'
import type { MankalPoint } from '@/lib/data/mankal-parent-committee'

const SOURCE_URL = 'https://apps.education.gov.il/Mankal/horaa.aspx?siduri=525#_Toc256000035'

/**
 * Nested numbered list laid out with flex rows (fixed-width marker + wrapping text) instead of the
 * source page's fixed point indents, so long Hebrew lines wrap inside a 360px viewport.
 */
export function PointList({ points, depth = 0 }: { points: MankalPoint[]; depth?: number }) {
  return (
    <ol className={depth === 0 ? 'space-y-4' : 'mt-3 space-y-3 ps-1'}>
      {points.map((point, i) => (
        <li key={`${point.marker ?? 'p'}-${i}`} className="flex gap-3">
          {point.marker ? (
            <span
              dir="ltr"
              className={`shrink-0 text-end font-semibold text-[#0D98BA] tabular-nums ${
                depth === 0 ? 'w-11' : 'w-6'
              }`}
            >
              {point.marker}
            </span>
          ) : depth > 0 ? (
            <span className="w-6 shrink-0" aria-hidden="true" />
          ) : null}
          <div className="min-w-0 flex-1 break-words leading-relaxed text-gray-800">
            <p>
              {point.lead && <strong className="font-bold text-[#003153]">{point.lead} </strong>}
              {point.text}
            </p>
            {point.children && <PointList points={point.children} depth={depth + 1} />}
          </div>
        </li>
      ))}
    </ol>
  )
}

export async function MankalCircularContent({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'mankalCircularPage' })
  const data = getMankalCircularByLocale(locale)
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
        <div className="rounded-xl border border-[#0D98BA]/15 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[#003153]">
            <span dir="ltr" className="me-2 text-[#0D98BA]">{data.sectionNumber}.</span>
            {data.sectionTitle}
          </h2>
          <p className="mt-3 leading-relaxed text-gray-800">{data.intro}</p>

          {data.subsections.map((sub) => (
            <section key={sub.number} className="mt-8" aria-labelledby={`sub-${sub.number}`}>
              <h3
                id={`sub-${sub.number}`}
                className="mb-4 border-b border-[#0D98BA]/20 pb-2 text-lg font-bold text-[#003153]"
              >
                <span dir="ltr" className="me-2 text-[#0D98BA]">{sub.number}</span>
                {sub.title}
              </h3>
              <PointList points={sub.points} />
            </section>
          ))}
        </div>

        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex min-h-[44px] items-start gap-2 text-sm text-gray-600 hover:text-[#0D98BA]"
        >
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('sourceNote')}</span>
        </a>
      </main>
    </div>
  )
}
