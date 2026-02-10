'use client'

import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FileDown, ChevronDown, CheckCircle, ArrowUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShareButton } from '@/components/ui/share-button'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
// html2canvas and jspdf loaded dynamically in exportToPDF
import { useTranslations, useLocale } from 'next-intl'
import { getRegulationsByLocale, regulationsStatus } from './regulations-content'
import type { RegulationSection, AppendixSection } from './regulations-content'

interface RegulationsModalContentProps {
  standalone?: boolean
}

export function RegulationsModalContent({ standalone = false }: RegulationsModalContentProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map())
  const t = useTranslations('regulations')
  const locale = useLocale()

  const [currentSection, setCurrentSection] = useState(1)
  const [showPill, setShowPill] = useState(false)
  const [showJumpMenu, setShowJumpMenu] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const regulationsContent = useMemo(() => getRegulationsByLocale(locale), [locale])
  const totalSections = regulationsContent.sections.length

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + `/${locale}/regulations`
    : `https://beeri.online/${locale}/regulations`

  const shareTitle = locale === 'ru'
    ? 'Устав родительского комитета - Школа Баари Нетания'
    : 'תקנון הנהגת הורים - בית ספר בארי נתניה'

  const shareText = locale === 'ru'
    ? 'Ознакомьтесь с официальным уставом родительского комитета'
    : 'צפו בתקנון הרשמי של הנהגת ההורים'

  const formatApprovalDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return locale === 'he'
      ? date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Track scroll position for progress bar and floating pill
  useEffect(() => {
    if (!standalone) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(Math.min(progress, 100))
      setShowPill(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [standalone])

  // IntersectionObserver for tracking visible section
  useEffect(() => {
    if (!standalone) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionNum = Number(entry.target.getAttribute('data-section'))
            if (sectionNum) setCurrentSection(sectionNum)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    sectionRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [standalone, regulationsContent])

  const registerSection = useCallback((number: number, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(number, el)
    }
  }, [])

  const scrollToSection = useCallback((sectionNumber: number) => {
    const el = sectionRefs.current.get(sectionNumber)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setShowJumpMenu(false)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowJumpMenu(false)
  }, [])

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

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

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
        ? `ustav_roditelskogo_komiteta_shkola_baari_${new Date().getFullYear()}.pdf`
        : `תקנון_הנהגת_הורים_בית_ספר_בארי_${new Date().getFullYear()}.pdf`

      pdf.save(fileName)
      toast.dismiss()
      toast.success(locale === 'ru' ? 'Файл успешно экспортирован' : 'הקובץ יוצא בהצלחה')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error(locale === 'ru' ? 'Ошибка при создании PDF' : 'שגיאה ביצירת PDF')
    }
  }

  const content = (
    <div dir="rtl">
      {/* ── Scroll Progress Bar ── */}
      {standalone && (
        <div
          className="fixed top-0 start-0 end-0 h-0.5 z-50 bg-black/5"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-[#fdc500] via-[#FFBA00] to-[#fdc500] transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Skip to content */}
      <a
        href="#regulations-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2
                   focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md
                   focus:shadow-lg focus:text-[#00509d] focus:font-medium"
      >
        {locale === 'ru' ? 'Перейти к содержимому' : 'דלג לתוכן'}
      </a>

      {/* ── Navy Gradient Header ── */}
      <RegulationsHeader
        standalone={standalone}
        locale={locale}
        regulationsContent={regulationsContent}
        formatApprovalDate={formatApprovalDate}
        exportToPDF={exportToPDF}
        shareTitle={shareTitle}
        shareText={shareText}
        shareUrl={shareUrl}
        t={t}
      />

      {/* ── Main Content ── */}
      <main
        id="regulations-content"
        ref={contentRef}
        className={`mx-auto px-4 md:px-8 py-6 space-y-4 ${
          standalone ? 'max-w-3xl md:me-56' : 'max-w-3xl'
        }`}
        aria-label={locale === 'ru' ? 'Разделы устава' : 'סעיפי התקנון'}
      >
        {/* Section Cards */}
        {regulationsContent.sections.map((section) => (
          <div
            key={section.number}
            ref={(el) => registerSection(section.number, el)}
            data-section={section.number}
          >
            <SectionCard section={section} locale={locale} />
          </div>
        ))}

        {/* ── Appendix Divider ── */}
        <AppendixDivider label={t('appendixLabel')} />

        {/* ── Appendix Cards ── */}
        <div className="space-y-4">
          {regulationsContent.appendix.sections.map((section) => (
            <AppendixCard key={section.number} section={section} locale={locale} />
          ))}
        </div>

        {/* ── Document Footer ── */}
        <DocumentFooter text={regulationsContent.footer} />
      </main>

      {/* ── Desktop TOC Sidebar ── */}
      {standalone && (
        <SideTableOfContents
          sections={regulationsContent.sections}
          currentSection={currentSection}
          scrollToSection={scrollToSection}
          scrollToTop={scrollToTop}
          t={t}
        />
      )}

      {/* ── Floating Progress Pill (mobile only, standalone only) ── */}
      {standalone && showPill && (
        <FloatingProgressPill
          currentSection={currentSection}
          totalSections={totalSections}
          showJumpMenu={showJumpMenu}
          setShowJumpMenu={setShowJumpMenu}
          locale={locale}
        >
          <JumpMenu
            sections={regulationsContent.sections}
            currentSection={currentSection}
            scrollToSection={scrollToSection}
            scrollToTop={scrollToTop}
            locale={locale}
            t={t}
          />
        </FloatingProgressPill>
      )}

      {/* Close jump menu on outside click */}
      {showJumpMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowJumpMenu(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Hidden print content for PDF export ── */}
      <div ref={printRef} className="fixed -left-[9999px] top-0 w-[800px] bg-white p-12" dir="rtl">
        <div className="text-center mb-10 pb-6 border-b-2 border-black">
          <h1 className="text-3xl font-bold text-black mb-2">{regulationsContent.title}</h1>
          <p className="text-base text-black mt-2">{regulationsContent.subtitle}</p>
          <p className="text-base text-black mt-1">{regulationsContent.academicYear}</p>
          <p className="text-sm text-black mt-1">{regulationsContent.chairman}</p>
        </div>

        <div className="space-y-6">
          {regulationsContent.sections.map((section) => (
            <div key={section.number} className="mb-6">
              <h2 className="text-lg font-bold text-black mb-3">
                {section.number}. {section.title}
              </h2>
              <div className="space-y-2 text-sm leading-relaxed mr-4">
                {section.content.map((paragraph, idx) => (
                  <ContentBlock key={idx} text={paragraph} print />
                ))}
                {section.subsections?.map((subsection, idx) => (
                  <div key={idx} className="mr-4 space-y-2 mt-2">
                    {subsection.title && (
                      <p className="font-bold text-black">{subsection.title}</p>
                    )}
                    {subsection.content.map((c, contentIdx) => (
                      <ContentBlock key={contentIdx} text={c} print />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

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
                    <ContentBlock key={idx} text={paragraph} print />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 mt-8 border-t border-gray-400">
          <p className="text-center text-xs text-gray-700">{regulationsContent.footer}</p>
        </div>
      </div>
    </div>
  )

  // Modal mode wraps in ScrollArea
  if (!standalone) {
    return (
      <div className="h-full max-h-full flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          {content}
        </ScrollArea>
      </div>
    )
  }

  return content
}

// ─── Clean Light Header (2026 Redesign) ────────────────────────────

function RegulationsHeader({
  standalone,
  locale,
  regulationsContent,
  formatApprovalDate,
  exportToPDF,
  shareTitle,
  shareText,
  shareUrl,
  t,
}: {
  standalone: boolean
  locale: string
  regulationsContent: ReturnType<typeof getRegulationsByLocale>
  formatApprovalDate: (d: string) => string
  exportToPDF: () => void
  shareTitle: string
  shareText: string
  shareUrl: string
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <header className={`relative ${!standalone ? 'rounded-t-2xl' : ''} overflow-hidden bg-gradient-to-b from-slate-50/80 to-white backdrop-blur-sm`}>
      {/* Thin accent bar — brand blue gradient */}
      <div className="h-0.5 bg-gradient-to-r from-[#0D98BA] via-[#003f88] to-[#0D98BA]" />

      <div className={`relative ${
        standalone ? 'px-6 py-10 md:px-10 md:py-14' : 'px-5 py-5 md:px-8 md:py-7'
      }`}>
        <div className="relative max-w-3xl mx-auto text-center">
          {/* Logo (standalone only) */}
          {standalone && (
            <div className="flex justify-center mb-5">
              <Image
                src="/logo-small.png"
                alt={locale === 'ru' ? 'Логотип школы Баари' : 'לוגו בית ספר בארי'}
                width={100}
                height={50}
                className="h-10 w-auto md:h-12"
                priority
              />
            </div>
          )}

          {/* Title — bold dark text */}
          <h1 className={`font-bold text-slate-900 leading-tight tracking-tight ${
            standalone ? 'text-2xl md:text-[2.5rem] mb-1.5' : 'text-xl md:text-2xl mb-1'
          }`}>
            {regulationsContent.title}
          </h1>

          {/* Subtitle — muted */}
          <p className={`text-slate-400 font-light ${standalone ? 'text-xs md:text-sm mb-0.5' : 'text-[11px] md:text-xs mb-0.5'}`}>
            {regulationsContent.subtitle}
          </p>

          {/* Year + Chairman — brand accent color */}
          <p className={`text-[#0D98BA] font-medium ${standalone ? 'text-xs md:text-sm' : 'text-[11px] md:text-xs'}`}>
            {regulationsContent.academicYear} &middot; {regulationsContent.chairman}
          </p>

          {/* Approval badge + actions row */}
          <div className={`flex items-center justify-center gap-3 ${standalone ? 'mt-5' : 'mt-3'}`}>
            {/* Approval badge — soft colored pill */}
            {regulationsStatus.isApproved ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                         bg-emerald-50 border border-emerald-200/60
                         text-[11px] font-medium text-emerald-700"
                role="status"
                aria-label={locale === 'ru' ? 'Статус: утверждён' : 'סטטוס: מאושר'}
              >
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {t('approvedByCommittee', {
                  date: formatApprovalDate(regulationsStatus.approvalDate)
                })}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                         bg-amber-50 border border-amber-200/60
                         text-[11px] font-medium text-amber-700"
                role="status"
                aria-label={locale === 'ru' ? 'Статус: черновик' : 'סטטוס: טיוטה'}
              >
                {t('draftAwaitingApproval')}
              </span>
            )}

            {/* Vertical separator */}
            <div className="w-px h-4 bg-slate-200" aria-hidden="true" />

            {/* Action buttons — ghost on light */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={exportToPDF}
                className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                aria-label={locale === 'ru' ? 'Экспорт в PDF' : 'ייצוא ל-PDF'}
              >
                <FileDown className="h-3.5 w-3.5" />
              </Button>
              <ShareButton
                shareData={{
                  title: shareTitle,
                  text: shareText,
                  url: shareUrl
                }}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                aria-label={locale === 'ru' ? 'Поделиться' : 'שיתוף'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom separator — hairline gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </header>
  )
}

// ─── Section Card (Always Visible, Not Collapsible) ─────────────────

function SectionCard({
  section,
  locale,
}: {
  section: RegulationSection
  locale: string
}) {
  return (
    <article
      className="relative rounded-2xl bg-gradient-to-br from-[#00509d]/[0.02] to-[#003f88]/[0.04]
                 border border-[#00509d]/10 shadow-sm hover:shadow-md transition-shadow duration-200
                 overflow-hidden"
      aria-label={`${locale === 'ru' ? 'Раздел' : 'סעיף'} ${section.number}: ${section.title}`}
    >
      {/* Start-edge accent bar (right side in RTL) */}
      <div className="absolute top-0 end-0 bottom-0 w-1 bg-gradient-to-b from-[#00509d] to-[#003f88]" />

      <div className="p-4 md:p-5">
        {/* Section header with badge */}
        <div className="flex items-center gap-3 mb-3">
          {/* Number badge */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00296b] to-[#00509d]
                        flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">{section.number}</span>
            {/* Gold corner dot */}
            <div className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-[#fdc500]" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-[#00296b] leading-snug">
            {section.title}
          </h2>
        </div>

        {/* Content (indented past badge) */}
        <div className="ps-[52px] space-y-2.5">
          {section.content.map((paragraph, idx) => (
            <ContentBlock key={idx} text={paragraph} />
          ))}

          {section.subsections?.map((subsection, idx) => (
            <div key={idx} className="space-y-2 mt-3">
              {subsection.title && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[#0D98BA]" aria-hidden="true" />
                  <p className="font-semibold text-[#003f88] text-sm md:text-[15px]">
                    {subsection.title}
                  </p>
                </div>
              )}
              {subsection.content.map((c, contentIdx) => (
                <ContentBlock key={contentIdx} text={c} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

// ─── Appendix Divider ───────────────────────────────────────────────

function AppendixDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 my-2" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-l from-[#fdc500]/50 to-transparent" />
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rotate-45 bg-[#fdc500]" />
        <span className="text-sm font-bold text-[#fdc500] tracking-wide">{label}</span>
        <div className="w-1.5 h-1.5 rotate-45 bg-[#fdc500]" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-[#fdc500]/50 to-transparent" />
    </div>
  )
}

// ─── Appendix Card ──────────────────────────────────────────────────

function AppendixCard({
  section,
  locale,
}: {
  section: AppendixSection
  locale: string
}) {
  return (
    <article
      className="relative rounded-2xl bg-gradient-to-br from-[#fdc500]/[0.03] to-[#FFBA00]/[0.06]
                 border border-[#fdc500]/15 shadow-sm hover:shadow-md transition-shadow duration-200
                 overflow-hidden"
      aria-label={`${locale === 'ru' ? 'Приложение' : 'נספח'} ${section.number}: ${section.title}`}
    >
      {/* Gold accent bar on start edge */}
      <div className="absolute top-0 end-0 bottom-0 w-1 bg-gradient-to-b from-[#fdc500] to-[#FFBA00]" />

      <div className="p-4 md:p-5">
        {/* Header with gold badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fdc500] to-[#FFBA00]
                        flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-[#00296b] font-bold text-sm">{section.number}</span>
          </div>
          <h3 className="text-base md:text-lg font-bold text-[#00296b] leading-snug">
            {section.title}
          </h3>
        </div>

        {/* Content */}
        <div className="ps-[52px] space-y-2.5">
          {section.content.map((paragraph, idx) => (
            <ContentBlock key={idx} text={paragraph} />
          ))}
        </div>
      </div>
    </article>
  )
}

// ─── Document Footer ────────────────────────────────────────────────

function DocumentFooter({ text }: { text: string }) {
  return (
    <div className="mt-8">
      <div className="relative bg-gradient-to-br from-[#00296b] to-[#003f88] rounded-2xl px-6 py-5 overflow-hidden">
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
          aria-hidden="true"
        />
        <div className="relative">
          {/* Gold diamond */}
          <div className="flex justify-center mb-3">
            <div className="w-2 h-2 rotate-45 bg-[#fdc500]" />
          </div>
          <p className="text-center text-xs md:text-sm text-white/80 italic leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Side Table of Contents (Desktop) ───────────────────────────────

function SideTableOfContents({
  sections,
  currentSection,
  scrollToSection,
  scrollToTop,
  t,
}: {
  sections: RegulationSection[]
  currentSection: number
  scrollToSection: (n: number) => void
  scrollToTop: () => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <nav
      className="hidden md:block fixed top-24 end-4 w-48 z-30
                 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/60
                 p-3 max-h-[calc(100vh-8rem)] overflow-y-auto"
      aria-label={String(t('tableOfContents'))}
    >
      <p className="text-xs font-bold text-[#00296b] mb-2 px-2">{t('tableOfContents')}</p>
      <div className="space-y-0.5">
        {sections.map((section) => (
          <button
            key={section.number}
            onClick={() => scrollToSection(section.number)}
            className={`w-full text-start px-2 py-1.5 rounded-lg text-xs transition-all duration-200
                      flex items-center gap-2 ${
              currentSection === section.number
                ? 'bg-[#00509d]/10 text-[#00509d] font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            aria-current={currentSection === section.number ? 'true' : undefined}
          >
            <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold
                            ${currentSection === section.number
                              ? 'bg-[#00509d] text-white'
                              : 'bg-gray-200 text-gray-500'}`}>
              {section.number}
            </span>
            <span className="truncate leading-tight">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="w-full mt-2 pt-2 border-t border-gray-100 px-2 py-1.5 text-xs text-gray-500
                 hover:text-[#00509d] transition-colors flex items-center gap-1.5 rounded-lg hover:bg-gray-50"
      >
        <ArrowUp className="h-3 w-3" />
        {t('backToTop')}
      </button>
    </nav>
  )
}

// ─── Floating Progress Pill (Mobile) ────────────────────────────────

function FloatingProgressPill({
  currentSection,
  totalSections,
  showJumpMenu,
  setShowJumpMenu,
  locale,
  children,
}: {
  currentSection: number
  totalSections: number
  showJumpMenu: boolean
  setShowJumpMenu: (v: boolean) => void
  locale: string
  children: React.ReactNode
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 md:hidden">
      {/* Quick Jump Menu */}
      {showJumpMenu && children}

      {/* Pill Button */}
      <button
        onClick={() => setShowJumpMenu(!showJumpMenu)}
        className="bg-[#00296b]/95 backdrop-blur-md rounded-full shadow-lg border border-[#00509d]/50
                 px-4 py-2 flex items-center gap-2 text-sm font-medium text-white
                 hover:bg-[#003f88] hover:shadow-xl transition-all duration-200
                 active:scale-95"
        aria-expanded={showJumpMenu}
        aria-haspopup="menu"
        aria-label={locale === 'ru'
          ? `Раздел ${currentSection} из ${totalSections}`
          : `סעיף ${currentSection} מתוך ${totalSections}`}
      >
        <span className="w-6 h-6 rounded-full bg-[#fdc500] text-[#00296b] text-xs
                       flex items-center justify-center font-bold">
          {currentSection}
        </span>
        <span className="text-white/50">/</span>
        <span>{totalSections}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-white/60 transition-transform duration-200
                               ${showJumpMenu ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}

// ─── Jump Menu ──────────────────────────────────────────────────────

function JumpMenu({
  sections,
  currentSection,
  scrollToSection,
  scrollToTop,
  locale,
  t,
}: {
  sections: RegulationSection[]
  currentSection: number
  scrollToSection: (n: number) => void
  scrollToTop: () => void
  locale: string
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200
               p-3 w-72 max-h-80 overflow-y-auto"
      role="menu"
      aria-label={locale === 'ru' ? 'Навигация по разделам' : 'ניווט בין סעיפים'}
    >
      <button
        onClick={scrollToTop}
        className="w-full text-start px-3 py-2 rounded-lg text-sm text-gray-500
                 hover:bg-gray-100 transition-colors flex items-center gap-2"
        role="menuitem"
      >
        <ArrowUp className="h-3.5 w-3.5" />
        {t('backToTop')}
      </button>
      <div className="h-px bg-gray-100 my-1" />
      {sections.map((section) => (
        <button
          key={section.number}
          onClick={() => scrollToSection(section.number)}
          className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors
                    flex items-center gap-2
                    ${currentSection === section.number
                      ? 'bg-[#00509d]/10 text-[#00509d] font-medium'
                      : 'text-gray-700 hover:bg-gray-100'}`}
          role="menuitem"
          aria-current={currentSection === section.number ? 'true' : undefined}
        >
          <span className={`w-5 h-5 rounded-md text-[10px]
                         flex items-center justify-center flex-shrink-0 font-bold
                         ${currentSection === section.number
                           ? 'bg-[#00509d] text-white'
                           : 'bg-gray-200 text-gray-500'}`}>
            {section.number}
          </span>
          <span className="truncate">{section.title}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Content Block ──────────────────────────────────────────────────
// Handles both regular paragraphs and bullet-point lines

function ContentBlock({ text, print = false }: { text: string; print?: boolean }) {
  // Skip empty spacer strings
  if (!text.trim()) return null

  // Check if this is a bullet point (starts with RTL mark + bullet or just bullet)
  const isBullet = text.startsWith('\u200F\u2022') || text.startsWith('\u2022')

  if (isBullet) {
    const cleanText = text.replace(/^\u200F?\u2022\s*/, '')
    if (print) {
      return <p className="text-black text-sm">{'\u200F\u2022 '}{cleanText}</p>
    }
    return (
      <div className="flex items-start gap-2.5 text-sm md:text-[15px] leading-relaxed text-gray-700" dir="rtl">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00509d] mt-2 flex-shrink-0" aria-hidden="true" />
        <span>{cleanText}</span>
      </div>
    )
  }

  if (print) {
    return <p className="text-black text-sm">{text}</p>
  }

  return (
    <p className="text-sm md:text-[15px] leading-relaxed text-gray-700" dir="rtl">
      {text}
    </p>
  )
}
