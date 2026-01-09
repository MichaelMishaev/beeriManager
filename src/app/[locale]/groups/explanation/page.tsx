'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { MessageCircle, ChevronDown, ExternalLink, Shield, Clock, Users, Megaphone } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ShareButton } from '@/components/ui/share-button'
import { formatWhatsAppGroupsExplanationShareData } from '@/lib/utils/share-formatters'
import type { Locale } from '@/i18n/config'

// Custom hook for scroll-triggered animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return { ref, isVisible }
}

// WhatsApp group data
const grades = [
  {
    id: 'grade-1',
    emoji: '📘',
    nameKey: 'grade1',
    gradeHe: 'א׳',
    url: 'https://chat.whatsapp.com/E3t0BQwhj0PCT4YjI1EfKg',
    color: '#87CEEB'
  },
  {
    id: 'grade-2',
    emoji: '📗',
    nameKey: 'grade2',
    gradeHe: 'ב׳',
    url: 'https://chat.whatsapp.com/J8OF6XOfESbG6icg5fcgbo',
    color: '#0D98BA'
  },
  {
    id: 'grade-3',
    emoji: '📙',
    nameKey: 'grade3',
    gradeHe: 'ג׳',
    url: 'https://chat.whatsapp.com/LBOfq7prC7N7cwoEEnR1xD',
    color: '#FFBA00'
  },
  {
    id: 'grade-4',
    emoji: '📒',
    nameKey: 'grade4',
    gradeHe: 'ד׳',
    url: 'https://chat.whatsapp.com/EHmRK5ArSlt2rnQwiJ2y6I',
    color: '#FF8200'
  },
  {
    id: 'grade-5',
    emoji: '📔',
    nameKey: 'grade5',
    gradeHe: 'ה׳',
    url: 'https://chat.whatsapp.com/EaxwgHvtr3r7PPGLaeGG8Z',
    color: '#003153'
  },
  {
    id: 'grade-6',
    emoji: '📕',
    nameKey: 'grade6',
    gradeHe: 'ו׳',
    url: 'https://chat.whatsapp.com/H1BvuS4Fcv09sLRNujLauj',
    color: '#8B5CF6'
  }
]

const russianGroup = {
  id: 'russian-group',
  iconUrl: '/images/ru-icon.png',
  nameKey: 'russianGroup',
  url: 'https://chat.whatsapp.com/G9bcGHURhgiLp8TgVLQomn',
  color: '#0088cc'
}

export default function GroupsExplanationPage() {
  const t = useTranslations('groups')
  const tExp = useTranslations('groupsExplanation')
  const locale = useLocale() as Locale
  const [showDetails, setShowDetails] = useState(false)

  // Share data for this page
  const shareData = formatWhatsAppGroupsExplanationShareData(locale)

  // Scroll animation hooks for different sections
  const benefitsAnimation = useScrollAnimation()
  const socialProofAnimation = useScrollAnimation()
  const gradeSelectionAnimation = useScrollAnimation()
  const noSpamAnimation = useScrollAnimation()
  const trustBadgeAnimation = useScrollAnimation()

  // Track conversion for analytics
  const trackConversion = (gradeId: string) => {
    // Could be integrated with Google Analytics or custom analytics
    console.log('Conversion tracked:', gradeId)
    // Example: gtag('event', 'whatsapp_group_join', { grade: gradeId })
  }

  return (
    <>
      {/* Respect prefers-reduced-motion for accessibility */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 pb-[100px]">
        {/* Skip to main content link for accessibility */}
      <a
        href="#grade-selection"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500"
      >
        דלג לבחירת כיתה
      </a>
      {/* Hero Section - Above the fold with Glassmorphism */}
      <div className="relative bg-[#25D366] text-white pt-8 pb-12 px-4 overflow-hidden">
        {/* Decorative background elements for depth */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-x-1/3 translate-y-1/3" />

        {/* School Logo Watermark - Subtle brand identity */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <div className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center transform rotate-12">
            <span className="text-[#25D366] font-bold text-[120px]">ב</span>
          </div>
        </div>

        {/* Share Button - Top Right - FIXED: Added focus indicators */}
        <div className="absolute top-4 left-4 z-10">
          <ShareButton
            shareData={shareData}
            variant="ghost"
            size="icon"
            locale={locale}
            aria-label="שתף את הדף"
            title="שתף את הדף"
            className="bg-white/20 backdrop-blur-xl hover:bg-white/30 border border-white/30 text-white hover:text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-green-500"
          />
        </div>

        <div className="relative max-w-lg mx-auto text-center space-y-4 z-10">
          {/* WhatsApp Icon with enhanced glassmorphism - IMPROVED: Reduced size for better balance */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <MessageCircle className="h-8 w-8 drop-shadow-lg" />
          </div>

          {/* Headline - FIXED: Stronger text shadow for better legibility */}
          <h1 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            {tExp('title')}
          </h1>

          {/* Punchline - Key Message with enhanced glassmorphism */}
          <div className="inline-block px-6 py-3 bg-white/25 backdrop-blur-xl rounded-full border-2 border-white/40 shadow-lg">
            <p className="text-base md:text-lg font-bold text-white drop-shadow-sm">
              {tExp('punchline')}
            </p>
          </div>

          {/* Subheadline - IMPROVED: Better contrast for WCAG AAA */}
          <p className="text-white/95 text-sm md:text-base font-medium drop-shadow-lg">
            {tExp('subtitle')}
          </p>

          {/* FEATURE: Explicit CTA - Tells users what to do */}
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-3 border border-white/30 mt-4">
            <p className="text-white text-center font-bold text-sm mb-1">
              👇 בחרו את שכבת ילדכם
            </p>
            <p className="text-white/90 text-xs text-center">
              הצטרפות מהירה בלחיצה אחת
            </p>
          </div>

          {/* FEATURE: Grade Preview - Shows first 3 grades above fold - FIXED: Better contrast */}
          <div className="flex justify-center gap-4 mt-6 px-4">
            {grades.slice(0, 3).map(grade => (
              <a
                key={grade.id}
                href={grade.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversion(grade.id)}
                className="w-16 h-16 bg-white rounded-xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-green-500"
                aria-label={`${t(grade.nameKey)} - הצטרפות מהירה`}
              >
                <span className="text-2xl" aria-hidden="true">{grade.emoji}</span>
                <span className="text-xs text-gray-900 font-bold mt-0.5">{grade.gradeHe}</span>
              </a>
            ))}
            <button
              onClick={() => {
                const gradeSection = document.getElementById('grade-selection')
                gradeSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className="w-16 h-16 bg-white rounded-xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label="הצג את כל 6 הכיתות"
            >
              <ChevronDown className="h-6 w-6 text-gray-700" />
              <span className="text-[10px] text-gray-600 font-bold mt-0.5">עוד 3</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - IMPROVED: White section with rounded corners breaks up green monotony */}
      <div className="relative -mt-8">
        <div className="bg-white rounded-t-3xl shadow-xl">
          <div className="max-w-lg mx-auto px-4 pt-8 pb-6 space-y-6">

        {/* Quick Benefits - Bento Grid Layout (varied sizes) - ANIMATED: Fade-in with stagger */}
        <div
          ref={benefitsAnimation.ref}
          className={cn(
            "grid grid-cols-4 gap-3 auto-rows-[80px] transition-all duration-700",
            benefitsAnimation.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          {/* Benefit 1 - Spans 2 columns */}
          <div
            className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            style={{
              transitionDelay: benefitsAnimation.isVisible ? '100ms' : '0ms'
            }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full mb-1">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit1Title')}</p>
          </div>

          {/* Benefit 2 - Spans 2 columns */}
          <div
            className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            style={{
              transitionDelay: benefitsAnimation.isVisible ? '200ms' : '0ms'
            }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 rounded-full mb-1">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit2Title')}</p>
          </div>

          {/* Benefit 3 - Spans 2 columns */}
          <div
            className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            style={{
              transitionDelay: benefitsAnimation.isVisible ? '300ms' : '0ms'
            }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-50 rounded-full mb-1">
              <Megaphone className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit3Title')}</p>
          </div>

          {/* Benefit 4 - Spans 2 columns */}
          <div
            className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            style={{
              transitionDelay: benefitsAnimation.isVisible ? '400ms' : '0ms'
            }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-50 rounded-full mb-1">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit4Title')}</p>
          </div>
        </div>

        {/* Call to Action - Choose Your Grade - ANIMATED: Fade-in */}
        <div
          ref={gradeSelectionAnimation.ref}
          id="grade-selection"
          className={cn(
            "bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-100 p-6 space-y-4 transition-all duration-700",
            gradeSelectionAnimation.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          {/* FEATURE: Social Proof Counter - Drives urgency - ANIMATED: Scale-in */}
          <div
            ref={socialProofAnimation.ref}
            className={cn(
              "bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-4 transition-all duration-500",
              socialProofAnimation.isVisible
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            )}
          >
            <p className="text-sm font-semibold text-green-900">
              🎉 <span className="font-bold">{tExp('socialProof')}</span>
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {tExp('step1')}
            </h2>
            <p className="text-sm text-gray-600">
              {tExp('step2')}
            </p>
          </div>

          {/* Grade Buttons - IMPROVED: Better text hierarchy */}
          <div className="grid grid-cols-2 gap-3">
            {grades.map((grade, index) => (
              <a
                key={grade.id}
                href={grade.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversion(grade.id)}
                aria-label={`${t(grade.nameKey)} - הצטרפות לקבוצת WhatsApp`}
                className="group relative flex flex-col items-center justify-center
                           bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm
                           hover:from-green-50 hover:to-green-100
                           border-2 border-gray-200 hover:border-green-400
                           rounded-2xl p-4 min-h-[120px]
                           transition-all duration-300 ease-out
                           active:scale-95 hover:scale-[1.02]
                           focus:outline-none focus:ring-4 focus:ring-green-500/50
                           shadow-sm hover:shadow-lg"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/0 to-green-600/0 group-hover:from-green-400/10 group-hover:to-green-600/10 transition-all duration-300" />

                {/* Content - IMPROVED: Larger grade number */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Emoji with bounce on hover */}
                  <span className="text-4xl mb-2 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                    {grade.emoji}
                  </span>

                  {/* Grade number - prominent */}
                  <span className="font-bold text-xl text-gray-900 block mb-0.5">
                    {grade.gradeHe}
                  </span>
                  {/* Full text - secondary */}
                  <span className="text-sm text-gray-600 font-medium">
                    {t(grade.nameKey)}
                  </span>
                </div>

                {/* External Link Icon */}
                <ExternalLink className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-3 left-3" />
              </a>
            ))}
          </div>

          {/* Russian Group - Conditional */}
          {locale === 'ru' && (
            <a
              href={russianGroup.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Русская группа WhatsApp"
              className="group relative flex items-center justify-between
                         bg-gradient-to-r from-blue-500 to-blue-600
                         hover:from-blue-600 hover:to-blue-700
                         text-white rounded-2xl p-5
                         transition-all duration-300 ease-out
                         active:scale-95 hover:scale-[1.02]
                         focus:outline-none focus:ring-4 focus:ring-blue-500/50
                         shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 flex-shrink-0 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                  <Image
                    src={russianGroup.iconUrl}
                    alt="RU"
                    width={56}
                    height={56}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg">{t(russianGroup.nameKey)}</p>
                  <p className="text-sm text-blue-100">{t('russianGroupSubtitle')}</p>
                </div>
              </div>
              <ExternalLink className="h-6 w-6 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          )}
        </div>

        {/* No Spam Guarantee - IMPROVED: Lighter visual weight, moved after CTA - ANIMATED: Fade-in */}
        <div
          ref={noSpamAnimation.ref}
          className={cn(
            "bg-yellow-50/50 rounded-xl border border-yellow-200 p-4 shadow-sm transition-all duration-700",
            noSpamAnimation.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xl" role="img" aria-label="No spam">📵</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base text-gray-900 mb-1">
                {tExp('noSpamTitle')}
              </h3>
              <p className="text-sm text-gray-600 leading-snug">
                {tExp('noSpamText')}
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Details - Progressive Disclosure */}
        <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls="details-content"
            className="w-full flex items-center justify-between p-5 text-left
                       hover:bg-blue-100/80 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center transform transition-transform duration-200 group-hover:scale-110">
                <Shield className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">{tExp('importantTitle')}</p>
                <p className="text-xs text-blue-700">לחץ לקריאה</p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-blue-700 transition-transform duration-300",
                showDetails && "rotate-180"
              )}
            />
          </button>

          {showDetails && (
            <div
              id="details-content"
              className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-300"
            >
              <p className="text-sm text-blue-900 leading-relaxed">
                {tExp('importantText1')}
              </p>
              <p className="text-sm text-blue-900 leading-relaxed">
                {tExp('importantText2')}
              </p>

              {/* How to Join Steps */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="font-semibold text-blue-900 mb-3">{tExp('howToJoinTitle')}</p>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>{tExp('step1')}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>{tExp('step2')}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>{tExp('step3')}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>{tExp('step4')}</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Trust Badge - IMPROVED: Enhanced visual credibility - ANIMATED: Scale-in */}
        <div
          ref={trustBadgeAnimation.ref}
          className={cn(
            "bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-5 shadow-sm transition-all duration-700",
            trustBadgeAnimation.isVisible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          )}
        >
          {/* Trust indicators row */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-900 text-center mb-1">
            ועד הורים בית ספר בארי נתניה
          </p>
          <p className="text-xs text-gray-600 text-center mb-2">
            ✓ קבוצות רשמיות ומאומתות
          </p>
          <p className="text-xs text-gray-500 text-center">
            נוהל פרטיות מלא • ללא שיתוף מידע
          </p>
        </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA Bar - IMPROVED: Benefit-oriented copy */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl p-4 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => {
              const gradeButtons = document.querySelector('[aria-label*="הצטרפות"]')
              gradeButtons?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
            aria-label="גלול לבחירת שכבה והצטרפות לקבוצת WhatsApp"
            className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1fa855] hover:to-[#0e6b61]
                       text-white font-bold py-3.5 px-6 rounded-xl
                       shadow-lg hover:shadow-xl
                       transform active:scale-95 hover:scale-[1.02]
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-4 focus:ring-green-500/50
                       flex flex-col items-center justify-center gap-1"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="text-base font-semibold">הצטרפו עכשיו לקבוצת WhatsApp</span>
            </div>
            <span className="text-sm opacity-95 font-medium">
              וקבלו עדכונים ישירים על אירועי בית הספר
            </span>
          </button>
        </div>
      </div>
      </div>
    </>
  )
}
