'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { FileDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShareButton } from '@/components/ui/share-button'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { regulationsContent } from './regulations-content'

interface RegulationsModalContentProps {
  standalone?: boolean
}

export function RegulationsModalContent({ standalone = false }: RegulationsModalContentProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + '/he/regulations'
    : 'https://beeri.online/he/regulations'

  const shareTitle = 'תקנון הנהגת הורים - בית ספר בארי נתניה'
  const shareText = 'צפו בתקנון הרשמי של הנהגת ההורים | מסמך מלא ומעודכן לשנת תשפ״ה-תשפ״ו'

  async function exportToPDF() {
    if (!printRef.current) {
      toast.error('שגיאה בטעינת התוכן')
      return
    }

    try {
      toast.loading('מכין PDF...')

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

      // Generate filename
      const fileName = `תקנון_הנהגת_הורים_בית_ספר_בארי_${new Date().getFullYear()}.pdf`

      // Save PDF
      pdf.save(fileName)

      toast.dismiss()
      toast.success('הקובץ יוצא בהצלחה')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error('שגיאה ביצירת PDF')
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

          {/* Draft Notice - Semantic and accessible */}
          <div className="flex justify-center mt-2 md:mt-3">
            <aside
              className="inline-flex items-center gap-1.5 md:gap-2 bg-[#fdc500]/20
                       border border-[#fdc500]/40 rounded-full
                       px-2.5 py-0.5 md:px-4 md:py-1.5"
              role="status"
              aria-label="סטטוס מסמך"
            >
              <span className="text-base md:text-xl" aria-hidden="true">📝</span>
              <span className="text-[10px] md:text-sm font-medium text-[#fdc500]">
                טיוטה - ממתין לאישור ועד ההורים
              </span>
            </aside>
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
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-[#fdc500] pb-6">
          <h1 className="text-4xl font-black text-[#00509d] mb-3">{regulationsContent.title}</h1>
          <p className="text-lg font-medium text-gray-700">{regulationsContent.subtitle}</p>
          <p className="text-base font-bold text-[#fdc500] mt-1">{regulationsContent.academicYear}</p>
          <p className="text-sm text-gray-600 mt-1">{regulationsContent.chairman}</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {regulationsContent.sections.map((section) => (
            <div key={section.number} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#00509d] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">{section.number}</span>
                </div>
                <h2 className="text-xl font-bold text-[#00509d]">{section.title}</h2>
              </div>
              <div className="space-y-2 text-sm leading-relaxed">
                {section.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
                {section.subsections?.map((subsection, idx) => (
                  <div key={idx} className="mr-6 space-y-1">
                    {subsection.title && <p className="font-bold text-[#00509d]">{subsection.title}</p>}
                    {subsection.content.map((content, contentIdx) => (
                      <p key={contentIdx}>{content}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Appendix */}
        <div className="bg-[#fdc500]/10 border-r-4 border-[#fdc500] rounded p-6 mt-8">
          <h2 className="text-2xl font-bold text-[#00509d] mb-4 text-center">
            {regulationsContent.appendix.title}
          </h2>
          <div className="space-y-4">
            {regulationsContent.appendix.sections.map((section) => (
              <div key={section.number}>
                <h3 className="text-lg font-bold text-[#00296b] mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdc500] text-white flex items-center justify-center text-xs font-bold">
                    {section.number}
                  </span>
                  {section.title}
                </h3>
                <div className="mr-8 space-y-1 text-sm">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-6 border-t-2 border-[#fdc500]/30">
          <p className="text-center text-xs text-gray-600 italic">{regulationsContent.footer}</p>
        </div>
      </div>
    </div>
  )
}

// Section Header Component - Accessible and compact
function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-3">
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
          className="text-xl md:text-2xl font-bold font-formal text-[#00509d]"
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
