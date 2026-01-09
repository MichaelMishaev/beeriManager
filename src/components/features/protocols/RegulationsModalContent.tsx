'use client'

import { useRef, useMemo } from 'react'
import Image from 'next/image'
import { FileDown, CheckCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShareButton } from '@/components/ui/share-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useTranslations, useLocale } from 'next-intl'
import { getRegulationsByLocale, regulationsStatus } from './regulations-content'

interface RegulationsModalContentProps {
  standalone?: boolean
}

export function RegulationsModalContent({ standalone = false }: RegulationsModalContentProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('regulations')
  const locale = useLocale()

  // Get locale-specific content
  const regulationsContent = useMemo(() => getRegulationsByLocale(locale), [locale])

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + `/${locale}/regulations`
    : `https://beeri.online/${locale}/regulations`

  const shareTitle = locale === 'ru'
    ? 'Устав родительского комитета - Школа Баари Нетания'
    : 'תקנון הנהגת הורים - בית ספר בארי נתניה'

  const shareText = locale === 'ru'
    ? 'Ознакомьтесь с официальным уставом родительского комитета | Полный и обновлённый документ на 2025 учебный год'
    : 'צפו בתקנון הרשמי של הנהגת ההורים | מסמך מלא ומעודכן לשנת תשפ״ה-תשפ״ו'

  // Format approval date based on locale
  const formatApprovalDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return locale === 'he'
      ? date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  async function exportToPDF() {
    if (!printRef.current) {
      toast.error(locale === 'ru' ? 'Ошибка загрузки содержимого' : 'שגיאה בטעינת התוכן')
      return
    }

    try {
      toast.loading(locale === 'ru' ? 'Создание PDF...' : 'מכין PDF...')

      // Capture the print content as canvas
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210 // A4 width in mm (portrait)
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Create PDF in portrait mode
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageWidth = pdf.internal.pageSize.getWidth()
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename based on locale
      const fileName = locale === 'ru'
        ? `ustav_roditelskogo_komiteta_shkola_baari_${new Date().getFullYear()}.pdf`
        : `תקנון_הנהגת_הורים_בית_ספר_בארי_${new Date().getFullYear()}.pdf`

      // Save PDF
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
    <div className={standalone ? '' : 'h-full max-h-full flex flex-col overflow-hidden'}>
      {/* Compact Header */}
      <header className="relative bg-gradient-to-br from-[#00509d] to-[#003f88]
                        border-t-4 border-[#fdc500]
                        p-4 md:p-6 text-white">

        {/* Action Buttons - Top Right (RTL) */}
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportToPDF}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            aria-label="ייצוא ל-PDF"
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <ShareButton
            shareData={{
              title: shareTitle,
              text: shareText,
              url: shareUrl
            }}
            variant="ghost"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            aria-label="שיתוף התקנון"
          />
        </div>

        {/* School Logo */}
        <div className="flex justify-center mb-2 md:mb-3">
          <Image
            src="/logo-small.png"
            alt="לוגו בית ספר בארי"
            width={80}
            height={32}
            className="h-6 w-auto md:h-8"
            priority
          />
        </div>

        {/* Title - Improved hierarchy */}
        <h1 className="text-2xl md:text-4xl font-black text-center
                     font-formal text-white drop-shadow-lg leading-tight tracking-tight">
          {regulationsContent.title}
        </h1>

        {/* Subtitle - Compact with better hierarchy */}
        <div className="text-center mt-1.5 md:mt-2 space-y-0">
          <p className="text-sm md:text-lg font-formal font-medium text-white/80">
            {regulationsContent.subtitle}
          </p>
          <p className="text-xs md:text-base font-formal font-bold text-[#fdc500]">
            {regulationsContent.academicYear}
          </p>
          <p className="text-xs md:text-sm font-formal font-normal text-white/70 mt-0.5">
            {regulationsContent.chairman}
          </p>

          {/* Approval Status Badge - Semantic and accessible */}
          <div className="flex justify-center mt-2 md:mt-3">
            {regulationsStatus.isApproved ? (
              <Badge
                variant="default"
                className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2
                         bg-green-500/90 hover:bg-green-600 border-green-600"
                role="status"
                aria-label={locale === 'ru' ? "Статус документа: утверждён" : "סטטוס מסמך מאושר"}
              >
                <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium">
                  {t('approvedByCommittee', {
                    date: formatApprovalDate(regulationsStatus.approvalDate)
                  })}
                </span>
              </Badge>
            ) : (
              <aside
                className="inline-flex items-center gap-1.5 md:gap-2 bg-[#fdc500]/20
                         border border-[#fdc500]/40 rounded-full
                         px-2.5 py-0.5 md:px-4 md:py-1.5"
                role="status"
                aria-label={locale === 'ru' ? "Статус документа: черновик" : "סטטוס מסמך טיוטה"}
              >
                <span className="text-base md:text-xl" aria-hidden="true">📝</span>
                <span className="text-[10px] md:text-sm font-medium text-[#fdc500]">
                  {t('draftAwaitingApproval')}
                </span>
              </aside>
            )}
          </div>
        </div>

        {/* Decorative Divider - Hidden on mobile */}
        <div className="hidden md:flex items-center justify-center gap-3 mt-4">
          <div className="h-px w-16 bg-gradient-to-l from-[#fdc500] to-transparent" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#fdc500]" />
          <div className="h-px w-16 bg-gradient-to-r from-[#fdc500] to-transparent" />
        </div>
      </header>

      {/* Content */}
      <ScrollArea className={standalone ? 'h-auto' : 'flex-1 min-h-0 px-4 md:px-12 py-6'}>
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Main Sections */}
          {regulationsContent.sections.map((section) => (
            <section key={section.number}>
              <SectionHeader number={section.number} title={section.title} />

              <div className="space-y-3">
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="text-sm md:text-base leading-relaxed text-right" dir="rtl">
                    {paragraph}
                  </p>
                ))}

                {section.subsections?.map((subsection, idx) => (
                  <div key={idx} className="mr-4 md:mr-6 space-y-2">
                    {subsection.title && (
                      <p className="font-bold text-[#00509d] text-sm md:text-base" dir="rtl">{subsection.title}</p>
                    )}
                    {subsection.content.map((content, contentIdx) => (
                      <p key={contentIdx} className="text-sm md:text-base leading-relaxed text-right" dir="rtl">
                        {content}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Appendix */}
          <div className="bg-[#fdc500]/5 border-r-4 border-[#fdc500] rounded-lg p-4 md:p-8 mt-10">
            <h2 className="text-2xl md:text-3xl font-bold font-formal text-[#00509d] mb-4 md:mb-6 text-center">
              {regulationsContent.appendix.title}
            </h2>

            <div className="space-y-6">
              {regulationsContent.appendix.sections.map((section) => (
                <div key={section.number}>
                  <h3 className="text-lg md:text-xl font-bold text-[#00296b] mb-2 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#fdc500] text-white
                                   flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {section.number}
                    </span>
                    {section.title}
                  </h3>
                  <div className="mr-9 space-y-2">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-sm md:text-base leading-relaxed text-right" dir="rtl">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-10 border-t-2 border-[#fdc500]/30">
            <p className="text-center text-xs md:text-sm text-muted-foreground italic" dir="rtl">
              {regulationsContent.footer}
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Hidden print content for PDF export */}
      <div ref={printRef} className="fixed -left-[9999px] top-0 w-[800px] bg-white p-12" dir="rtl">
        {/* Header - Formal Document Style */}
        <div className="text-center mb-10 pb-6 border-b-2 border-black">
          <h1 className="text-3xl font-bold text-black mb-2">{regulationsContent.title}</h1>
          <p className="text-base text-black mt-2">{regulationsContent.subtitle}</p>
          <p className="text-base text-black mt-1">{regulationsContent.academicYear}</p>
          <p className="text-sm text-black mt-1">{regulationsContent.chairman}</p>
        </div>

        {/* Sections - Clean Formal Style */}
        <div className="space-y-6">
          {regulationsContent.sections.map((section) => (
            <div key={section.number} className="mb-6">
              <h2 className="text-lg font-bold text-black mb-3">
                {section.number}. {section.title}
              </h2>
              <div className="space-y-2 text-sm leading-relaxed mr-4">
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="text-black">{paragraph}</p>
                ))}
                {section.subsections?.map((subsection, idx) => (
                  <div key={idx} className="mr-4 space-y-2 mt-2">
                    {subsection.title && (
                      <p className="font-bold text-black">{subsection.title}</p>
                    )}
                    {subsection.content.map((content, contentIdx) => (
                      <p key={contentIdx} className="text-black">{content}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Appendix - Formal Style */}
        <div className="mt-10 pt-6 border-t-2 border-black">
          <h2 className="text-xl font-bold text-black mb-6 text-center">
            {regulationsContent.appendix.title}
          </h2>
          <div className="space-y-4">
            {regulationsContent.appendix.sections.map((section) => (
              <div key={section.number} className="mb-4">
                <h3 className="text-base font-bold text-black mb-2">
                  {section.number}. {section.title}
                </h3>
                <div className="mr-4 space-y-2 text-sm">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx} className="text-black">{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Formal */}
        <div className="pt-6 mt-8 border-t border-gray-400">
          <p className="text-center text-xs text-gray-700">{regulationsContent.footer}</p>
        </div>
      </div>
    </div>
  )
}

// Section Header Component - Accessible and compact with RTL support
function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-4" dir="rtl">
      <div className="flex flex-row-reverse items-center gap-3 mb-3">
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-full
                   bg-gradient-to-br from-[#00509d] to-[#00296b]
                   flex items-center justify-center
                   border-2 border-[#003f88] shadow-md flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-white font-black font-formal text-lg md:text-xl">
            {number}
          </span>
        </div>
        <h2
          className="text-xl md:text-2xl font-bold font-formal text-[#00509d] text-right"
          id={`section-${number}`}
        >
          <span className="sr-only">סעיף {number}: </span>
          {title}
        </h2>
      </div>
      <div className="h-px bg-gradient-to-l from-[#fdc500]/30 to-transparent" aria-hidden="true" />
    </div>
  )
}
