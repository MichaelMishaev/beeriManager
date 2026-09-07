'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { ScrollText, ArrowRight, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { ShareButton } from '@/components/ui/share-button'
import { getClassCommitteeBylawsByLocale } from '@/lib/data/class-committee-bylaws'
import type { BylawsSection } from '@/lib/data/class-committee-bylaws'
import type { Locale } from '@/i18n/config'

export function ClassCommitteeBylawsContent() {
  const locale = useLocale()
  const t = useTranslations('committeeCorner')
  const params = useParams()
  const pathLocale = (params.locale || 'he') as Locale
  const printRef = useRef<HTMLDivElement>(null)

  const data = useMemo(() => getClassCommitteeBylawsByLocale(locale), [locale])

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + `/${locale}/class-committee-bylaws`
    : `https://beeri.online/${locale}/class-committee-bylaws`

  async function exportToPDF() {
    if (!printRef.current) {
      toast.error(locale === 'ru' ? 'Ошибка загрузки содержимого' : 'שגיאה בטעינת התוכן')
      return
    }

    try {
      toast.loading(locale === 'ru' ? 'Создание PDF...' : 'מכין PDF...')

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageWidth = pdf.internal.pageSize.getWidth()
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = locale === 'ru'
        ? `proekt_ustava_klassnyh_komitetov_${new Date().getFullYear()}.pdf`
        : `הצעה_לתקנון_ועדי_כיתות_${new Date().getFullYear()}.pdf`

      pdf.save(fileName)
      toast.dismiss()
      toast.success(locale === 'ru' ? 'Файл успешно экспортирован' : 'הקובץ יוצא בהצלחה')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error(locale === 'ru' ? 'Ошибка при создании PDF' : 'שגיאה ביצירת PDF')
    }
  }

  return (
    <div className="min-h-screen bg-[#F4EFE4]">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {/* Back link */}
        <Link
          href={`/${pathLocale}/committee-corner`}
          className="inline-flex items-center gap-1.5 text-sm text-[#003153]/60 hover:text-[#003153] mb-6 transition-colors"
        >
          <ArrowRight className="h-4 w-4 ltr:rotate-180" />
          {t('backToCorner')}
        </Link>

        {/* ── Certificate frame ── */}
        <div className="relative rounded-lg border-[3px] border-[#003153] p-1.5">
          <div className="rounded-md border border-[#FFBA00]/70 px-5 py-8 md:px-12 md:py-12 bg-[#FBF7EC]">
            {/* Seal */}
            <div className="flex justify-center mb-5">
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center
                           bg-[#003153] shadow-[0_0_0_3px_#FBF7EC,0_0_0_4px_#FFBA00]"
                style={{ transform: 'rotate(-8deg)' }}
                aria-hidden="true"
              >
                <ScrollText className="h-8 w-8 text-[#FFBA00]" />
              </div>
            </div>

            {/* Status ribbon + actions */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                           bg-amber-50 border border-amber-200/60
                           text-[11px] font-medium text-amber-700"
                role="status"
              >
                {t('proposalBadge')}
              </span>

              <div className="w-px h-4 bg-[#003153]/15" aria-hidden="true" />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={exportToPDF}
                  className="h-7 w-7 flex items-center justify-center rounded-full text-[#003153]/50 hover:text-[#003153] hover:bg-[#003153]/5 transition-colors"
                  aria-label={locale === 'ru' ? 'Экспорт в PDF' : 'ייצוא ל-PDF'}
                >
                  <FileDown className="h-3.5 w-3.5" />
                </button>
                <ShareButton
                  shareData={{
                    title: data.title,
                    text: data.intro,
                    url: shareUrl,
                  }}
                  variant="ghost"
                  size="icon"
                  locale={locale === 'ru' ? 'ru' : 'he'}
                  className="h-7 w-7 text-[#003153]/50 hover:text-[#003153] hover:bg-[#003153]/5 rounded-full"
                  aria-label={locale === 'ru' ? 'Поделиться' : 'שיתוף'}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl md:text-4xl font-bold text-[#003153] text-center tracking-tight leading-snug mb-4">
              {data.title}
            </h1>

            {/* Double rule */}
            <div className="flex flex-col items-center gap-1 mb-6" aria-hidden="true">
              <div className="h-px w-24 bg-[#003153]/40" />
              <div className="h-px w-16 bg-[#FFBA00]" />
            </div>

            {/* Intro / preamble */}
            <p className="font-serif italic text-center text-[15px] md:text-base text-[#003153]/80 leading-relaxed max-w-xl mx-auto mb-10">
              {data.intro}
            </p>

            {/* Sections */}
            <div className="space-y-5">
              {data.sections.map((section) => (
                <BylawsSectionCard key={section.number} section={section} />
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-10 pt-6 border-t border-[#003153]/15">
              <p className="text-center text-xs md:text-sm text-[#003153]/60 italic leading-relaxed">
                {data.footer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden print content for PDF export */}
      <div ref={printRef} className="fixed -left-[9999px] top-0 w-[800px] bg-white p-12" dir="rtl">
        <div className="text-center mb-10 pb-6 border-b-2 border-black">
          <h1 className="text-3xl font-bold text-black mb-2">{data.title}</h1>
          <p className="text-sm text-black mt-2">{t('proposalBadge')}</p>
        </div>
        <p className="text-sm text-black italic mb-8 leading-relaxed">{data.intro}</p>
        <div className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.number} className="mb-6">
              <h2 className="text-lg font-bold text-black mb-3">
                {section.number}. {section.title}
              </h2>
              <div className="space-y-2 text-sm leading-relaxed mr-4">
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="text-black text-sm">{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 mt-8 border-t border-gray-400">
          <p className="text-center text-xs text-gray-700">{data.footer}</p>
        </div>
      </div>
    </div>
  )
}

function BylawsSectionCard({ section }: { section: BylawsSection }) {
  return (
    <article
      className="relative rounded-xl bg-white/60 border border-[#003153]/10 shadow-sm overflow-hidden"
      aria-label={`${section.number}. ${section.title}`}
    >
      <div className="absolute top-0 start-0 bottom-0 w-1 bg-[#FFBA00]" aria-hidden="true" />
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-9 h-9 rounded-full border-2 border-[#003153] flex items-center justify-center flex-shrink-0">
            <span className="font-serif font-bold text-sm text-[#003153]">{section.number}</span>
          </div>
          <h2 className="font-serif text-lg font-bold text-[#003153] leading-snug">
            {section.title}
          </h2>
        </div>
        <div className="ps-[48px] space-y-2">
          {section.content.map((paragraph, idx) => (
            <p key={idx} className="text-sm md:text-[15px] leading-relaxed text-[#003153]/85">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  )
}
