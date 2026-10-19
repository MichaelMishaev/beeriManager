'use client'

import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { FileDown, ChevronDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { Frank_Ruhl_Libre, David_Libre, Secular_One, Noto_Serif } from 'next/font/google'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShareButton } from '@/components/ui/share-button'
import { toast } from 'sonner'
// html2canvas and jspdf loaded dynamically in exportToPDF
import { useTranslations, useLocale } from 'next-intl'
import { getRegulationsByLocale, regulationsStatus } from './regulations-content'
import type { RegulationSection, AppendixSection } from './regulations-content'
import { GazetteStamp } from './GazetteStamp'
import styles from './regulations-gazette.module.css'

// Loaded here (not via the layout's --font-formal) so the page never depends on that var being set.
const gazetteHead = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  variable: '--font-gz-head',
  display: 'swap',
  weight: ['400', '700', '900'],
  preload: false,
})

const gazetteBody = David_Libre({
  subsets: ['hebrew', 'latin'],
  variable: '--font-gz-body',
  display: 'swap',
  weight: ['400', '500', '700'],
  preload: false,
})

const gazetteLabel = Secular_One({
  subsets: ['hebrew', 'latin'],
  variable: '--font-gz-label',
  display: 'swap',
  weight: '400',
  preload: false,
})

// Cyrillic fallback: the Hebrew serif faces above have no Cyrillic glyphs (ru locale)
const gazetteCyrillic = Noto_Serif({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-gz-cyr',
  display: 'swap',
  weight: ['400', '700', '900'],
  preload: false,
})

const FONT_VARS = `${gazetteHead.variable} ${gazetteBody.variable} ${gazetteLabel.variable} ${gazetteCyrillic.variable}`

const APPENDIX_KEY = -1
const FLEURONS = ['❦', '✤', '❧', '✾', '✦', '❀', '✣', '✧', '❖']
const HEBREW_BULLET_KEYS = 'אבגדהוזחטיכלמנסעפצקרשת'
const BULLET_RE = /^‏?•\s*/

type TFn = ReturnType<typeof useTranslations>

interface RegulationsModalContentProps {
  standalone?: boolean
}

// ─── Content helpers ────────────────────────────────────────────────

interface Clause {
  text: string | null
  bullets: string[]
}

/**
 * Source content is a flat string[]: blank strings are spacers and lines that
 * start with a bullet belong to the paragraph before them. Group them so each
 * paragraph (plus its bullet list) renders as one numbered clause.
 */
function groupContent(lines: string[]): Clause[] {
  const clauses: Clause[] = []
  for (const raw of lines) {
    if (!raw.trim()) continue
    if (BULLET_RE.test(raw)) {
      const bullet = raw.replace(BULLET_RE, '')
      const last = clauses[clauses.length - 1]
      if (last) last.bullets.push(bullet)
      else clauses.push({ text: null, bullets: [bullet] })
    } else {
      clauses.push({ text: raw, bullets: [] })
    }
  }
  return clauses
}

function bulletKey(index: number, locale: string): string {
  if (locale === 'he' && index < HEBREW_BULLET_KEYS.length) return `${HEBREW_BULLET_KEYS[index]}.`
  return '•'
}

/** 5787 → תשפ״ז (thousands dropped, standard gematria with 15/16 exceptions). */
function toHebrewYear(year: number): string {
  const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט']
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ']
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת']
  let rest = year % 1000
  let out = ''
  while (rest >= 400) {
    out += 'ת'
    rest -= 400
  }
  out += hundreds[Math.floor(rest / 100)]
  rest %= 100
  if (rest === 15) out += 'טו'
  else if (rest === 16) out += 'טז'
  else out += tens[Math.floor(rest / 10)] + units[rest % 10]
  return out.length > 1 ? `${out.slice(0, -1)}״${out.slice(-1)}` : `${out}׳`
}

/**
 * "2026-10" → "תשרי–חשוון תשפ״ז". A Gregorian month usually straddles two Hebrew months,
 * so we show the range rather than pretending to know the day. Browser-only (Intl output can
 * differ between Node and browsers), so callers must run it after mount.
 */
function formatHebrewMonthYear(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const part = (d: Date, opts: Intl.DateTimeFormatOptions, locale: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }).format(d)
  const first = new Date(Date.UTC(y, m - 1, 1, 12))
  const last = new Date(Date.UTC(y, m, 0, 12))
  const year = (d: Date) => toHebrewYear(Number(part(d, { year: 'numeric' }, 'en-u-ca-hebrew').replace(/\D/g, '')))
  const month = (d: Date) => part(d, { month: 'long' }, 'he-IL-u-ca-hebrew')

  const [m1, m2, y1, y2] = [month(first), month(last), year(first), year(last)]
  if (y1 !== y2) return `${m1} ${y1} – ${m2} ${y2}`
  return m1 === m2 ? `${m1} ${y1}` : `${m1}–${m2} ${y1}`
}

export function RegulationsModalContent({ standalone = false }: RegulationsModalContentProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map())
  const t = useTranslations('regulations')
  const locale = useLocale()
  const dir = locale === 'he' ? 'rtl' : 'ltr'
  const router = useRouter()

  const [currentSection, setCurrentSection] = useState(1)
  // After an index click the smooth scroll passes (or never reaches, near the page end) other sections;
  // hold the clicked one as current so the highlight matches what the reader chose.
  const indexLockUntil = useRef(0)
  const [indexOpen, setIndexOpen] = useState(false)

  const regulationsContent = useMemo(() => getRegulationsByLocale(locale), [locale])

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + `/${locale}/regulations`
    : `https://beeri.online/${locale}/regulations`

  const shareTitle = locale === 'ru'
    ? 'Устав родительского комитета - Школа Баари Нетания'
    : 'תקנון הנהגת הורים - בית ספר בארי נתניה'

  const shareText = locale === 'ru'
    ? 'Ознакомьтесь с официальным уставом родительского комитета'
    : 'צפו בתקנון הרשמי של הנהגת ההורים'

  // "2026-10" → "10.2026". Read from the string (no Date) so the month can't shift with timezone.
  const formatApprovalDate = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-')
    return `${month}.${year}`
  }

  // Reading progress ruler — written straight to the DOM so scrolling doesn't re-render the page
  useEffect(() => {
    if (!standalone) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
      if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${progress})`
      progressRef.current?.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [standalone])

  // Current section = the last one whose top has passed 35% of the viewport. Position-based (not
  // IntersectionObserver) so the highlight is deterministic however fast or slowly the reader scrolls.
  useEffect(() => {
    if (!standalone) return

    let frame = 0
    const update = () => {
      frame = 0
      if (Date.now() < indexLockUntil.current) return
      const line = window.innerHeight * 0.35
      const entries = Array.from(sectionRefs.current.entries())
      let best = 1
      let bestTop = -Infinity
      for (let i = 0; i < entries.length; i++) {
        const top = entries[i][1].getBoundingClientRect().top
        if (top <= line && top > bestTop) {
          best = entries[i][0]
          bestTop = top
        }
      }
      setCurrentSection(best)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [standalone, regulationsContent])

  const registerSection = useCallback((number: number, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(number, el)
    }
  }, [])

  const scrollToSection = useCallback((sectionNumber: number) => {
    const el = sectionRefs.current.get(sectionNumber)
    if (el) {
      indexLockUntil.current = Date.now() + 1500
      setCurrentSection(sectionNumber)
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIndexOpen(false)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIndexOpen(false)
  }, [])

  // Page is mostly opened from WhatsApp links: only go "back" in history when the previous
  // page is ours, otherwise history.back() would drop the reader out of the app.
  const goBack = useCallback(() => {
    let cameFromApp = false
    try {
      const ref = document.referrer ? new URL(document.referrer) : null
      // a self-referrer (page reloaded itself) is not a previous page: going "back" would leave the app
      cameFromApp = !!ref && ref.origin === window.location.origin && ref.pathname !== window.location.pathname
    } catch {
      cameFromApp = false
    }
    if (cameFromApp) router.back()
    else router.push('/')
  }, [router])

  async function exportToPDF() {
    if (!printRef.current) {
      toast.error(t('loadError'))
      return
    }

    try {
      toast.loading(t('exportLoading'))

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
      toast.success(t('exportSuccess'))
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error(t('exportError'))
    }
  }

  const currentLabel = currentSection === APPENDIX_KEY
    ? t('appendixLabel')
    : regulationsContent.sections.find((s) => s.number === currentSection)?.title ?? ''

  const content = (
    <div
      dir={dir}
      className={`${styles.root} ${FONT_VARS} ${standalone ? styles.standalone : styles.compact} ${locale === 'he' ? '' : styles.cyr}`}
    >
      {/* ── Reading progress ruler ── */}
      {standalone && (
        <div
          ref={progressRef}
          className={styles.progress}
          role="progressbar"
          aria-label={t('progressLabel')}
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            ref={progressBarRef}
            className={styles.progressBar}
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      )}

      {/* Skip to content */}
      <a href="#regulations-content" className={styles.skip}>
        {t('skipToContent')}
      </a>

      <div className={styles.sheet}>
        {/* ── Gazette masthead ── */}
        <GazetteHeader
          compact={!standalone}
          onBack={standalone ? goBack : undefined}
          locale={locale}
          regulationsContent={regulationsContent}
          formatApprovalDate={formatApprovalDate}
          exportToPDF={exportToPDF}
          shareTitle={shareTitle}
          shareText={shareText}
          shareUrl={shareUrl}
          t={t}
        />

        <div className={styles.layout}>
          {/* ── Index: sticky bar on mobile, side panel on desktop ── */}
          {standalone && (
            <GazetteIndex
              sections={regulationsContent.sections}
              currentSection={currentSection}
              currentLabel={currentLabel}
              indexOpen={indexOpen}
              setIndexOpen={setIndexOpen}
              scrollToSection={scrollToSection}
              scrollToTop={scrollToTop}
              t={t}
            />
          )}

          {/* ── Articles ── */}
          <main id="regulations-content" ref={contentRef} className={styles.main} aria-label={t('mainLabel')}>
            {regulationsContent.sections.map((section, idx) => (
              <div
                key={section.number}
                ref={(el) => registerSection(section.number, el)}
                data-section={section.number}
                className={styles.anchor}
              >
                <SectionArticle section={section} locale={locale} withDropCap={idx === 0} t={t} />
              </div>
            ))}

            {/* ── Appendix ── */}
            <div
              ref={(el) => registerSection(APPENDIX_KEY, el)}
              data-section={APPENDIX_KEY}
              className={styles.anchor}
            >
              <section className={styles.appendixBlock} aria-labelledby="regulations-appendix-title">
                <hr className={styles.dbl} />
                <div className={styles.orn} aria-hidden="true">❦ ❦ ❦</div>
                <h2 id="regulations-appendix-title">{regulationsContent.appendix.title}</h2>
                <hr className={`${styles.dbl} ${styles.dblRev}`} />
              </section>

              {regulationsContent.appendix.sections.map((section) => (
                <AppendixArticle key={section.number} section={section} locale={locale} t={t} />
              ))}
            </div>
          </main>
        </div>

        {/* ── Document footer ── */}
        <footer className={styles.footer}>
          <hr className={styles.dbl} />
          {regulationsStatus.isApproved && <p>{regulationsContent.footer}</p>}
          <p>
            {t('footerLine', {
              subtitle: regulationsContent.subtitle,
              year: regulationsContent.academicYear,
            })}
          </p>
        </footer>
      </div>

      {/* ── Hidden print content for PDF export ── */}
      <div
        ref={printRef}
        className="fixed -left-[9999px] top-0 w-[800px] bg-white p-12"
        dir={dir}
        aria-hidden="true"
      >
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
                  <PrintBlock key={idx} text={paragraph} />
                ))}
                {section.subsections?.map((subsection, idx) => (
                  <div key={idx} className="mr-4 space-y-2 mt-2">
                    {subsection.title && (
                      <p className="font-bold text-black">{subsection.title}</p>
                    )}
                    {subsection.content.map((c, contentIdx) => (
                      <PrintBlock key={contentIdx} text={c} />
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
                    <PrintBlock key={idx} text={paragraph} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {regulationsStatus.isApproved && (
          <div className="pt-6 mt-8 border-t border-gray-400">
            <p className="text-center text-xs text-gray-700">{regulationsContent.footer}</p>
          </div>
        )}
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

// ─── Gazette Masthead ───────────────────────────────────────────────

function GazetteHeader({
  compact,
  onBack,
  locale,
  regulationsContent,
  formatApprovalDate,
  exportToPDF,
  shareTitle,
  shareText,
  shareUrl,
  t,
}: {
  compact: boolean
  onBack?: () => void
  locale: string
  regulationsContent: ReturnType<typeof getRegulationsByLocale>
  formatApprovalDate: (d: string) => string
  exportToPDF: () => void
  shareTitle: string
  shareText: string
  shareUrl: string
  t: TFn
}) {
  const { isApproved, approvalDate } = regulationsStatus
  const statusText = isApproved
    ? t('approvedByCommittee', { date: formatApprovalDate(approvalDate) })
    : t('draftAwaitingApproval')
  // "תשפ״ו–תשפ״ז (2026)" → "תשפ״ו–תשפ״ז" for the seal ribbon
  const yearShort = regulationsContent.academicYear.replace(/\s*\(.*\)\s*$/, '')
  // "Back" points toward the start of the line: right in RTL, left in LTR
  const BackIcon = locale === 'he' ? ArrowRight : ArrowLeft

  // Hebrew-calendar date is computed after mount: Intl's Hebrew output can differ server vs browser
  const [hebrewDate, setHebrewDate] = useState('')
  useEffect(() => {
    if (locale !== 'he' || !isApproved) return
    try {
      setHebrewDate(formatHebrewMonthYear(approvalDate))
    } catch {
      setHebrewDate('')
    }
  }, [locale, isApproved, approvalDate])

  return (
    <header>
      {onBack && (
        <div className={styles.backRow}>
          <button type="button" className={styles.backLink} onClick={onBack}>
            <span className={styles.backArrow} aria-hidden="true">
              <BackIcon size={16} />
            </span>
            <span>{t('back')}</span>
          </button>
        </div>
      )}

      <div className={styles.ears} aria-hidden="true">
        {isApproved && <span>{formatApprovalDate(approvalDate)}</span>}
        <span>{isApproved ? t('earApproved') : t('earDraft')}</span>
      </div>

      <div className={styles.masthead}>
        <p className={styles.kicker}>✦ {t('kicker')} ✦</p>
        <h1>{regulationsContent.title}</h1>
        <p className={styles.mastheadSub}>{regulationsContent.subtitle}</p>
      </div>

      <hr className={styles.dbl} />
      <div className={styles.edition}>
        <span>{regulationsContent.academicYear}</span>
        <span className={styles.sep} aria-hidden="true">✶</span>
        <span>{t('editionLine', { count: regulationsContent.sections.length })}</span>
      </div>
      <hr className={`${styles.dbl} ${styles.dblRev}`} />

      <section className={styles.lead}>
        <div className={styles.leadBy}>
          <p className={styles.byline}>
            <small>{t('signedBy')}</small>
            {regulationsContent.chairman}
          </p>
          <span
            className={`${styles.badge} ${isApproved ? '' : styles.badgeDraft}`}
            role="status"
          >
            {isApproved && <span aria-hidden="true">✔</span>}
            {statusText}
            {hebrewDate && <span className={styles.badgeHebrew}>({hebrewDate})</span>}
          </span>
        </div>

        {!compact && (
          <GazetteStamp
            className={styles.stamp}
            ink={isApproved ? 'blue' : 'red'}
            label={isApproved ? t('sealApproved') : t('sealPending')}
            org={t('sealOrg')}
            year={isApproved ? approvalDate.slice(0, 4) : (regulationsContent.academicYear.match(/\d{4}/)?.[0] ?? '')}
            ribbon={yearShort}
            microText={`${t('sealOrg')} · ${isApproved ? t('earApproved') : t('earDraft')}`}
            ariaLabel={isApproved ? t('sealApproved') : t('sealPending')}
            size={160}
          />
        )}

        <div className={styles.leadAct}>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnInk}`}
              onClick={exportToPDF}
            >
              <FileDown aria-hidden="true" />
              {t('exportPdf')}
            </button>
            <ShareButton
              shareData={{ title: shareTitle, text: shareText, url: shareUrl }}
              label={t('share')}
              locale={locale === 'ru' ? 'ru' : 'he'}
              variant="link"
              size="icon"
              iconSize="h-[18px] w-[18px]"
              className={styles.btn}
            />
          </div>
        </div>
      </section>
    </header>
  )
}

// ─── Index (sticky bar on mobile / side panel on desktop) ───────────

function GazetteIndex({
  sections,
  currentSection,
  currentLabel,
  indexOpen,
  setIndexOpen,
  scrollToSection,
  scrollToTop,
  t,
}: {
  sections: RegulationSection[]
  currentSection: number
  currentLabel: string
  indexOpen: boolean
  setIndexOpen: (v: boolean) => void
  scrollToSection: (n: number) => void
  scrollToTop: () => void
  t: TFn
}) {
  const linkClass = (active: boolean) =>
    `${styles.indexLink} ${active ? styles.indexLinkActive : ''}`

  return (
    <div className={`${styles.index} ${indexOpen ? styles.indexOpen : ''}`}>
      <button
        type="button"
        className={styles.indexToggle}
        aria-expanded={indexOpen}
        aria-controls="regulations-index-body"
        onClick={() => setIndexOpen(!indexOpen)}
      >
        <span>{t('indexTitle')}</span>
        <span className={styles.indexNow}>{currentLabel}</span>
        <ChevronDown className={styles.chev} size={18} aria-hidden="true" />
      </button>
      <p className={styles.indexHeading}>{t('indexTitle')}</p>

      <nav id="regulations-index-body" className={styles.indexBody} aria-label={t('indexNavLabel')}>
        <ol className={styles.indexList}>
          {sections.map((section) => (
            <li key={section.number}>
              <button
                type="button"
                className={linkClass(currentSection === section.number)}
                onClick={() => scrollToSection(section.number)}
                aria-current={currentSection === section.number ? 'true' : undefined}
              >
                <span className={styles.indexNum}>§{section.number}</span>
                <span>{section.title}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={linkClass(currentSection === APPENDIX_KEY)}
              onClick={() => scrollToSection(APPENDIX_KEY)}
              aria-current={currentSection === APPENDIX_KEY ? 'true' : undefined}
            >
              <span className={styles.indexNum} aria-hidden="true">❦</span>
              <span>{t('appendixLabel')}</span>
            </button>
          </li>
        </ol>
        <div className={styles.indexTop}>
          <button type="button" className={styles.indexLink} onClick={scrollToTop}>
            <ArrowUp size={16} aria-hidden="true" />
            <span>{t('backToTop')}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

// ─── Clause (one paragraph + its bullet list) ───────────────────────

function ClauseView({
  clause,
  number,
  locale,
  dropCap = false,
}: {
  clause: Clause
  number?: string
  locale: string
  dropCap?: boolean
}) {
  return (
    <div className={number ? styles.clause : styles.clauseBare}>
      {number && <span className={styles.clauseNum}>{number}</span>}
      <div>
        {clause.text && <p className={dropCap ? styles.dropcap : undefined}>{clause.text}</p>}
        {clause.bullets.length > 0 && (
          <ul className={styles.subList}>
            {clause.bullets.map((bullet, i) => (
              <li key={i}>
                <span className={styles.bulletKey} aria-hidden="true">{bulletKey(i, locale)}</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── Section Article ────────────────────────────────────────────────

function SectionArticle({
  section,
  locale,
  withDropCap,
  t,
}: {
  section: RegulationSection
  locale: string
  withDropCap: boolean
  t: TFn
}) {
  const titleId = `regulations-section-${section.number}`
  const clauses = groupContent(section.content)

  // Sub-sections with a title but no body ("chairman", "treasurer") read as a list, not headings
  const subsections = section.subsections ?? []
  const blocks: ({ kind: 'list'; titles: string[] } | { kind: 'body'; title: string; clauses: Clause[] })[] = []
  for (const sub of subsections) {
    const subClauses = groupContent(sub.content)
    if (sub.title && subClauses.length === 0) {
      const last = blocks[blocks.length - 1]
      if (last?.kind === 'list') last.titles.push(sub.title)
      else blocks.push({ kind: 'list', titles: [sub.title] })
    } else {
      blocks.push({ kind: 'body', title: sub.title, clauses: subClauses })
    }
  }

  return (
    <article className={styles.article} aria-labelledby={titleId}>
      <header className={styles.artHead}>
        <div className={styles.fleuron} aria-hidden="true">
          {FLEURONS[(section.number - 1) % FLEURONS.length]}
        </div>
        <span className={styles.artNo}>{t('sectionLabel', { number: section.number })}</span>
        <h2 id={titleId}>{section.title}</h2>
      </header>

      <div className={styles.cols}>
        {clauses.map((clause, i) => (
          <ClauseView
            key={i}
            clause={clause}
            number={`${section.number}.${i + 1}`}
            locale={locale}
            dropCap={withDropCap && i === 0}
          />
        ))}

        {blocks.map((block, i) =>
          block.kind === 'list' ? (
            <ul key={i} className={styles.subList}>
              {block.titles.map((title, j) => (
                <li key={j}>
                  <span className={styles.bulletKey} aria-hidden="true">{bulletKey(j, locale)}</span>
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div key={i}>
              {block.title && <p className={styles.subHead}>{block.title}</p>}
              {block.clauses.map((clause, j) => (
                <ClauseView key={j} clause={clause} locale={locale} />
              ))}
            </div>
          )
        )}
      </div>
    </article>
  )
}

// ─── Appendix Article ───────────────────────────────────────────────

function AppendixArticle({
  section,
  locale,
  t,
}: {
  section: AppendixSection
  locale: string
  t: TFn
}) {
  const titleId = `regulations-appendix-${section.number}`

  return (
    <article className={styles.article} aria-labelledby={titleId}>
      <header className={styles.artHead}>
        <div className={styles.fleuron} aria-hidden="true">✦</div>
        <span className={styles.artNo}>{t('appendixLabel')} {section.number}</span>
        <h3 id={titleId}>{section.title}</h3>
      </header>

      <div className={styles.cols}>
        {groupContent(section.content).map((clause, i) => (
          <ClauseView key={i} clause={clause} locale={locale} />
        ))}
      </div>
    </article>
  )
}

// ─── Print Block (hidden PDF export layout) ─────────────────────────

function PrintBlock({ text }: { text: string }) {
  // Skip empty spacer strings
  if (!text.trim()) return null
  return <p className="text-black text-sm">{text}</p>
}
