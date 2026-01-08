'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { MessageCircle, ChevronDown, ExternalLink, Shield, Clock, Users, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
  emoji: '🇷🇺',
  nameKey: 'russianGroup',
  url: 'https://chat.whatsapp.com/G9bcGHURhgiLp8TgVLQomn',
  color: '#0088cc'
}

export default function GroupsExplanationPage() {
  const t = useTranslations('groups')
  const tExp = useTranslations('groupsExplanation')
  const locale = useLocale()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 pb-24">
      {/* Hero Section - Above the fold with Glassmorphism */}
      <div className="relative bg-[#25D366] text-white pt-8 pb-6 px-4 overflow-hidden">
        {/* Decorative background elements for depth */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-lg mx-auto text-center space-y-4">
          {/* WhatsApp Icon with enhanced glassmorphism */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <MessageCircle className="h-10 w-10 drop-shadow-lg" />
          </div>

          {/* Headline */}
          <h1 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-md">
            {tExp('title')}
          </h1>

          {/* Punchline - Key Message with enhanced glassmorphism */}
          <div className="inline-block px-6 py-3 bg-white/25 backdrop-blur-xl rounded-full border-2 border-white/40 shadow-lg">
            <p className="text-base md:text-lg font-bold text-white drop-shadow-sm">
              {tExp('punchline')}
            </p>
          </div>

          {/* Subheadline */}
          <p className="text-green-50 text-sm md:text-base drop-shadow">
            {tExp('subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* No Spam Guarantee - Prominent with Glassmorphism */}
        <div className="relative bg-gradient-to-br from-yellow-50/90 to-orange-50/90 backdrop-blur-lg rounded-2xl border-2 border-yellow-400/60 p-5 shadow-xl overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-md transform hover:scale-110 transition-transform duration-200">
              <span className="text-2xl" role="img" aria-label="No spam">📵</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {tExp('noSpamTitle')}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tExp('noSpamText')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Benefits - Bento Grid Layout (varied sizes) */}
        <div className="grid grid-cols-4 gap-3 auto-rows-[80px]">
          {/* Benefit 1 - Spans 2 columns */}
          <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-full mb-1">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit1Title')}</p>
          </div>

          {/* Benefit 2 - Spans 2 columns */}
          <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 rounded-full mb-1">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit2Title')}</p>
          </div>

          {/* Benefit 3 - Spans 2 columns */}
          <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-50 rounded-full mb-1">
              <Megaphone className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit3Title')}</p>
          </div>

          {/* Benefit 4 - Spans 2 columns */}
          <div className="col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-50 rounded-full mb-1">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">{tExp('benefit4Title')}</p>
          </div>
        </div>

        {/* Call to Action - Choose Your Grade */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-100 p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {tExp('step1')}
            </h2>
            <p className="text-sm text-gray-600">
              {tExp('step2')}
            </p>
          </div>

          {/* Grade Buttons - Large, thumb-friendly with micro-interactions */}
          <div className="grid grid-cols-2 gap-3">
            {grades.map((grade, index) => (
              <a
                key={grade.id}
                href={grade.url}
                target="_blank"
                rel="noopener noreferrer"
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

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Emoji with bounce on hover */}
                  <span className="text-4xl mb-2 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                    {grade.emoji}
                  </span>

                  {/* Grade Label */}
                  <span className="font-bold text-lg text-gray-900 mb-1">
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
                <span className="text-4xl group-hover:scale-110 group-active:scale-95 transition-transform duration-200">{russianGroup.emoji}</span>
                <div>
                  <p className="font-bold text-lg">{t(russianGroup.nameKey)}</p>
                  <p className="text-sm text-blue-100">{t('russianGroupSubtitle')}</p>
                </div>
              </div>
              <ExternalLink className="h-6 w-6 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          )}
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

        {/* Trust Badge */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2 transform hover:scale-110 transition-transform duration-200">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            ועד הורים בית ספר בארי נתניה
          </p>
          <p className="text-xs text-gray-500 mt-1">
            קבוצות רשמיות ומאובטחות
          </p>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-4 pb-8">
          <Link
            href="/groups"
            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors duration-200"
          >
            חזרה לעמוד הקבוצות
          </Link>
        </div>
      </div>

      {/* Sticky Bottom CTA Bar - Thumb Zone Optimization */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl p-4 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => {
              const gradeButtons = document.querySelector('[aria-label*="הצטרפות"]')
              gradeButtons?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
            aria-label="גלול לבחירת שכבה"
            className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1fa855] hover:to-[#0e6b61]
                       text-white font-bold py-4 px-6 rounded-xl
                       shadow-lg hover:shadow-xl
                       transform active:scale-95 hover:scale-[1.02]
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-4 focus:ring-green-500/50
                       flex items-center justify-center gap-3"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-lg">בחרו את השכבה שלכם</span>
          </button>
        </div>
      </div>
    </div>
  )
}
