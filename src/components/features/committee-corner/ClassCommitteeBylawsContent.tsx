'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, FileDown } from 'lucide-react'
import { Frank_Ruhl_Libre, David_Libre, Secular_One, Noto_Serif } from 'next/font/google'
import { toast } from 'sonner'
import { Link, useRouter } from '@/i18n/navigation'
import { ShareButton } from '@/components/ui/share-button'
import { GazetteStamp } from '@/components/features/protocols/GazetteStamp'
import { getClassCommitteeBylawsByLocale } from '@/lib/data/class-committee-bylaws'
import type { BylawsSection } from '@/lib/data/class-committee-bylaws'
// Shared "Official Gazette" theme (paper, rules, index, buttons) — same as /regulations
import gz from '@/components/features/protocols/regulations-gazette.module.css'
// Only what is new here: letterhead, title block, article frames, notice, signature block
import styles from './class-bylaws-gazette.module.css'

// Loaded in this module (not via a layout var) so the page never depends on --font-formal.
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

/** Index key for the approval / signature block (sections use their own numbers 1..n). */
const SIGNATURES_KEY = -1

type TFn = ReturnType<typeof useTranslations>

export function ClassCommitteeBylawsContent() {
  const locale = useLocale()
  const t = useTranslations('classBylawsPage')
  const dir = locale === 'he' ? 'rtl' : 'ltr'
  const router = useRouter()

  const printRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map())

  const [currentSection, setCurrentSection] = useState(1)
  // After an index click the smooth scroll passes (or never reaches, near the page end) other sections;
  // hold the clicked one as current so the highlight matches what the reader chose.
  const indexLockUntil = useRef(0)
  const [indexOpen, setIndexOpen] = useState(false)

  const data = useMemo(() => getClassCommitteeBylawsByLocale(locale), [locale])

  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin + `/${locale}/class-committee-bylaws`
    : `https://beeri.online/${locale}/class-committee-bylaws`

  // Reading progress ruler — written straight to the DOM so scrolling doesn't re-render
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0
      if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${progress})`
      progressRef.current?.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Current section = the last one whose top has passed 35% of the viewport. Position-based (not
  // IntersectionObserver) so the highlight is deterministic however fast or slowly the reader scrolls.
  useEffect(() => {
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
  }, [data])

  const registerSection = useCallback((n: number, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(n, el)
  }, [])

  const scrollToSection = useCallback((n: number) => {
    const el = sectionRefs.current.get(n)
    if (el) {
      indexLockUntil.current = Date.now() + 1500
      setCurrentSection(n)
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIndexOpen(false)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIndexOpen(false)
  }, [])

  // Mostly opened from WhatsApp links: only go "back" when the previous page is ours,
  // otherwise history.back() would drop the reader out of the app.
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
        import('jspdf'),
      ])

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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
      toast.success(t('exportSuccess'))
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.dismiss()
      toast.error(t('exportError'))
    }
  }

  const currentLabel = currentSection === SIGNATURES_KEY
    ? t('signaturesIndex')
    : data.sections.find((s) => s.number === currentSection)?.title ?? ''

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft
  const signatories = [t('signatoryChair'), t('signatoryClassRep')]

  return (
    <div dir={dir} className={`${gz.root} ${gz.standalone} ${styles.doc} ${locale === 'ru' ? styles.cyr : ''} ${FONT_VARS}`}>
      {/* ── Reading progress ruler ── */}
      <div
        ref={progressRef}
        className={gz.progress}
        role="progressbar"
        aria-label={t('progressLabel')}
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div ref={progressBarRef} className={gz.progressBar} style={{ transform: 'scaleX(0)' }} />
      </div>

      <a href="#bylaws-content" className={gz.skip}>
        {t('skipToContent')}
      </a>

      <div className={gz.sheet}>
        <header>
          {/* ── Navigation row ── */}
          <div className={`${gz.backRow} ${styles.navRow}`}>
            <button type="button" className={gz.backLink} onClick={goBack}>
              <span className={gz.backArrow} aria-hidden="true">
                <BackIcon size={16} />
              </span>
              <span>{t('back')}</span>
            </button>
            <Link href="/committee-corner" className={styles.cornerLink}>
              {t('backToCorner')}
            </Link>
          </div>

          {/* ── Letterhead ── */}
          <div className={styles.letterhead}>
            <div className={styles.crest} aria-hidden="true">
              <span>❖</span>
            </div>
            <div className={styles.letterheadText}>
              <p className={styles.letterheadOrg}>{t('letterheadOrg')}</p>
              <p className={styles.letterheadSub}>{t('letterheadSub')}</p>
            </div>
            <dl className={styles.letterheadMeta}>
              <div>
                <dt>{t('metaDocType')}</dt>
                <dd>{t('metaDocTypeValue')}</dd>
              </div>
              <div>
                <dt>{t('metaStatus')}</dt>
                <dd className={styles.metaRed}>{t('metaStatusValue')}</dd>
              </div>
            </dl>
          </div>
          <hr className={gz.dbl} />

          {/* ── Formal title block ── */}
          <section className={styles.titleBlock} aria-labelledby="bylaws-title">
            <span className={styles.corner} aria-hidden="true" />
            <span className={styles.corner} aria-hidden="true" />
            <span className={styles.corner} aria-hidden="true" />
            <span className={styles.corner} aria-hidden="true" />

            <p className={styles.kicker}>{t('kicker')}</p>
            <h1 id="bylaws-title" className={styles.title}>{data.title}</h1>
            <div className={styles.titleRule} aria-hidden="true">
              <span>✦</span>
            </div>
            <p className={styles.edition}>{t('editionLine', { count: data.sections.length })}</p>

            <div className={styles.preamble}>
              <p className={styles.preambleLabel}>{t('preambleLabel')}</p>
              <p className={styles.preambleText}>{data.intro}</p>
            </div>

            {/* Proposal stamp: seal at the foot of the block on mobile, free corner on desktop */}
            <div className={styles.stampWrap}>
              <GazetteStamp
                label={t('stampLabel')}
                org={t('stampOrg')}
                year={t('stampBottom')}
                ribbon={t('stampRibbon')}
                ariaLabel={t('stampAria')}
                ink="red"
                microText={t('stampMicro')}
                size={140}
              />
            </div>
          </section>

          {/* ── Status + actions ── */}
          <section className={styles.statusRow}>
            <span className={`${gz.badge} ${gz.badgeDraft} ${styles.badgeRed}`} role="status">
              {t('statusBadge')}
            </span>
            <div className={`${gz.actions} ${styles.actions}`}>
              <button type="button" className={`${gz.btn} ${gz.btnInk}`} onClick={exportToPDF}>
                <FileDown aria-hidden="true" />
                {t('exportPdf')}
              </button>
              <ShareButton
                shareData={{ title: data.title, text: data.intro, url: shareUrl }}
                label={t('share')}
                locale={locale === 'ru' ? 'ru' : 'he'}
                variant="link"
                size="icon"
                iconSize="h-[18px] w-[18px]"
                className={gz.btn}
              />
            </div>
          </section>

          {/* ── Formal notice (data footer, verbatim) ── */}
          <aside className={styles.notice} aria-labelledby="bylaws-notice-title">
            <p id="bylaws-notice-title" className={styles.noticeTitle}>
              <span aria-hidden="true">!</span>
              {t('noticeTitle')}
            </p>
            <p className={styles.noticeText}>{data.footer}</p>
          </aside>
        </header>

        <div className={gz.layout}>
          {/* ── Index: sticky bar on mobile, side panel on desktop ── */}
          <BylawsIndex
            sections={data.sections}
            currentSection={currentSection}
            currentLabel={currentLabel}
            indexOpen={indexOpen}
            setIndexOpen={setIndexOpen}
            scrollToSection={scrollToSection}
            scrollToTop={scrollToTop}
            t={t}
          />

          <main id="bylaws-content" className={gz.main} aria-label={t('mainLabel')}>
            {data.sections.map((section) => (
              <div
                key={section.number}
                ref={(el) => registerSection(section.number, el)}
                data-section={section.number}
                className={gz.anchor}
              >
                <BylawsArticle section={section} t={t} />
              </div>
            ))}

            {/* ── Approval / signature block (empty placeholders — proposal not approved) ── */}
            <div
              ref={(el) => registerSection(SIGNATURES_KEY, el)}
              data-section={SIGNATURES_KEY}
              className={gz.anchor}
            >
              <section className={styles.signatures} aria-labelledby="bylaws-signatures-title">
                <h2 id="bylaws-signatures-title" className={styles.signaturesTitle}>
                  {t('signaturesTitle')}
                </h2>
                <p className={styles.signaturesNote}>{t('signaturesNote')}</p>
                <div className={styles.signGrid}>
                  {signatories.map((role) => (
                    <div key={role} className={styles.signCard}>
                      <p className={styles.signRole}>{role}</p>
                      {[t('fieldName'), t('fieldSignature'), t('fieldDate')].map((field) => (
                        <div key={field} className={styles.signField}>
                          <span className={styles.signLabel}>{field}</span>
                          <span
                            className={styles.signLine}
                            role="img"
                            aria-label={t('blankFieldAria', { field })}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>

        {/* ── Document footer ── */}
        <footer className={gz.footer}>
          <hr className={gz.dbl} />
          <p>{t('footerLine', { title: data.title })}</p>
        </footer>
      </div>

      {/* ── Hidden print layout for PDF export ── */}
      <div ref={printRef} className="fixed -left-[9999px] top-0 w-[800px] bg-white p-12" dir={dir} aria-hidden="true">
        <div className="text-center mb-8 pb-6 border-b-2 border-black">
          <p className="text-sm text-black mb-2">{t('letterheadOrg')}</p>
          <h1 className="text-3xl font-bold text-black mb-2">{data.title}</h1>
          <p className="text-sm text-black mt-2">{t('statusBadge')}</p>
        </div>
        <p className="text-sm text-black italic mb-6 leading-relaxed">{data.intro}</p>
        <div className="border-2 border-black p-4 mb-8">
          <p className="text-sm font-bold text-black mb-1">{t('noticeTitle')}</p>
          <p className="text-sm text-black">{data.footer}</p>
        </div>
        <div className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.number} className="mb-6">
              <h2 className="text-lg font-bold text-black mb-3">
                {t('sectionLabel', { number: section.number })} — {section.title}
              </h2>
              <div className="space-y-2 text-sm leading-relaxed">
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="text-black text-sm">
                    {section.number}.{idx + 1}&nbsp;&nbsp;{paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 mt-8 border-t-2 border-black">
          <h2 className="text-lg font-bold text-black mb-2">{t('signaturesTitle')}</h2>
          <p className="text-xs text-black mb-6">{t('signaturesNote')}</p>
          <div className="grid grid-cols-2 gap-10">
            {signatories.map((role) => (
              <div key={role}>
                <p className="text-sm font-bold text-black mb-4">{role}</p>
                {[t('fieldName'), t('fieldSignature'), t('fieldDate')].map((field) => (
                  <div key={field} className="flex items-end gap-3 mb-5">
                    <span className="text-xs text-black w-14">{field}</span>
                    <span className="flex-1 border-b border-black h-5" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Index (sticky bar on mobile / side panel on desktop) ───────────

function BylawsIndex({
  sections,
  currentSection,
  currentLabel,
  indexOpen,
  setIndexOpen,
  scrollToSection,
  scrollToTop,
  t,
}: {
  sections: BylawsSection[]
  currentSection: number
  currentLabel: string
  indexOpen: boolean
  setIndexOpen: (v: boolean) => void
  scrollToSection: (n: number) => void
  scrollToTop: () => void
  t: TFn
}) {
  const linkClass = (active: boolean) => `${gz.indexLink} ${active ? gz.indexLinkActive : ''}`

  return (
    <div className={`${gz.index} ${indexOpen ? gz.indexOpen : ''}`}>
      <button
        type="button"
        className={gz.indexToggle}
        aria-expanded={indexOpen}
        aria-controls="bylaws-index-body"
        onClick={() => setIndexOpen(!indexOpen)}
      >
        <span>{t('indexTitle')}</span>
        <span className={gz.indexNow}>{currentLabel}</span>
        <ChevronDown className={gz.chev} size={18} aria-hidden="true" />
      </button>
      <p className={gz.indexHeading}>{t('indexTitle')}</p>

      <nav id="bylaws-index-body" className={gz.indexBody} aria-label={t('indexNavLabel')}>
        <ol className={gz.indexList}>
          {sections.map((section) => (
            <li key={section.number}>
              <button
                type="button"
                className={linkClass(currentSection === section.number)}
                onClick={() => scrollToSection(section.number)}
                aria-current={currentSection === section.number ? 'true' : undefined}
              >
                <span className={gz.indexNum}>§{section.number}</span>
                <span>{section.title}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={linkClass(currentSection === SIGNATURES_KEY)}
              onClick={() => scrollToSection(SIGNATURES_KEY)}
              aria-current={currentSection === SIGNATURES_KEY ? 'true' : undefined}
            >
              <span className={gz.indexNum} aria-hidden="true">✍</span>
              <span>{t('signaturesIndex')}</span>
            </button>
          </li>
        </ol>
        <div className={gz.indexTop}>
          <button type="button" className={gz.indexLink} onClick={scrollToTop}>
            <ArrowUp size={16} aria-hidden="true" />
            <span>{t('backToTop')}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

// ─── Article (one bylaw section, strictly numbered clauses) ─────────

function BylawsArticle({ section, t }: { section: BylawsSection; t: TFn }) {
  const titleId = `bylaws-section-${section.number}`

  return (
    <article className={styles.article} aria-labelledby={titleId}>
      <header className={styles.artHead}>
        <span className={styles.artNum} aria-hidden="true">{section.number}</span>
        <div className={styles.artHeadText}>
          <span className={styles.artNo}>{t('sectionLabel', { number: section.number })}</span>
          <h2 id={titleId} className={styles.artTitle}>{section.title}</h2>
        </div>
      </header>

      <ol className={styles.clauses}>
        {section.content.map((paragraph, i) => (
          <li key={i} className={styles.clauseRow}>
            <span className={styles.clauseNum}>{`${section.number}.${i + 1}`}</span>
            <p>{paragraph}</p>
          </li>
        ))}
      </ol>
    </article>
  )
}
