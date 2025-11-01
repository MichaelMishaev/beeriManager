'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronRight, ChevronLeft, Sparkles, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import type { Highlight } from '@/types'
import { logger } from '@/lib/logger'
import { useTranslations } from 'next-intl'

// Local interface for backward compatibility with mock data
interface DisplayHighlight {
  id: string
  type: 'achievement' | 'sports' | 'award' | 'event' | 'announcement'
  icon: string
  title_he: string
  title_ru: string
  description_he: string
  description_ru: string
  event_date?: string
  category_he: string
  category_ru: string
  badge_color: string
  cta_text_he?: string
  cta_text_ru?: string
  cta_link?: string
  image_placeholder?: string
}

// Convert Highlight from DB to DisplayHighlight for rendering
function convertToDisplay(highlight: Highlight): DisplayHighlight {
  return {
    id: highlight.id,
    type: highlight.type,
    icon: highlight.icon,
    title_he: highlight.title_he,
    title_ru: highlight.title_ru,
    description_he: highlight.description_he,
    description_ru: highlight.description_ru,
    event_date: highlight.event_date,
    category_he: highlight.category_he,
    category_ru: highlight.category_ru,
    badge_color: highlight.badge_color,
    cta_text_he: highlight.cta_text_he,
    cta_text_ru: highlight.cta_text_ru,
    cta_link: highlight.cta_link,
    image_placeholder: highlight.image_placeholder,
  }
}

// Loading Skeleton Component
function HighlightsSkeleton() {
  return (
    <div className="mb-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Card Skeleton */}
      <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function HighlightsCarousel() {
  const t = useTranslations('homepage')
  const params = useParams()
  const currentLocale = (params.locale as Locale) || 'he'
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [highlights, setHighlights] = useState<DisplayHighlight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const totalSlides = highlights.length

  // Fetch highlights from API
  useEffect(() => {
    async function fetchHighlights() {
      try {
        const response = await fetch('/api/highlights?limit=10')
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          // Convert DB highlights to display format
          const displayHighlights = data.data.map(convertToDisplay)
          setHighlights(displayHighlights)
          logger.info('Highlights loaded from API', { count: displayHighlights.length })
        } else {
          // No highlights in database
          logger.info('No highlights in database')
          setHighlights([])
        }
      } catch (error) {
        logger.error('Failed to load highlights', { error })
        setHighlights([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHighlights()
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }, [])

  // Auto-rotation
  useEffect(() => {
    if (!isAutoPlaying || totalSlides === 0) return

    const interval = setInterval(() => {
      nextSlide()
    }, 6000) // 6 seconds per slide

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, totalSlides])

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (currentLocale === 'he') {
      if (isLeftSwipe) {
        prevSlide()
        setIsAutoPlaying(false)
      }
      if (isRightSwipe) {
        nextSlide()
        setIsAutoPlaying(false)
      }
    } else {
      if (isLeftSwipe) {
        nextSlide()
        setIsAutoPlaying(false)
      }
      if (isRightSwipe) {
        prevSlide()
        setIsAutoPlaying(false)
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        currentLocale === 'he' ? nextSlide() : prevSlide()
        setIsAutoPlaying(false)
      } else if (e.key === 'ArrowRight') {
        currentLocale === 'he' ? prevSlide() : nextSlide()
        setIsAutoPlaying(false)
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsAutoPlaying((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide, currentLocale])


  // Show loading skeleton
  if (isLoading) {
    return <HighlightsSkeleton />
  }

  // Show nothing if no highlights
  if (highlights.length === 0) {
    return null
  }

  const currentHighlight = highlights[currentSlide]
  if (!currentHighlight) return null

  const title = currentLocale === 'ru' ? currentHighlight.title_ru : currentHighlight.title_he
  const description = currentLocale === 'ru' ? currentHighlight.description_ru : currentHighlight.description_he
  const category = currentLocale === 'ru' ? currentHighlight.category_ru : currentHighlight.category_he
  const ctaText = currentLocale === 'ru' ? currentHighlight.cta_text_ru : currentHighlight.cta_text_he

  return (
    <div className="mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-700">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#0D98BA] to-[#003153] p-2 rounded-xl shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#003153] flex items-center gap-2">
              {t('highlights')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('highlightsSubtitle')}
            </p>
          </div>
        </div>

        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-gray-500 hover:text-[#0D98BA] transition-colors"
          aria-label={isAutoPlaying ? (currentLocale === 'ru' ? 'Пауза' : 'השהה') : (currentLocale === 'ru' ? 'Воспроизвести' : 'הפעל')}
        >
          {isAutoPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Enhanced Carousel Card */}
      <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
        <Card className="border-0 shadow-none overflow-hidden bg-transparent">
          {/* Carousel Container */}
          <div
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Slides */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${currentLocale === 'he' ? currentSlide * 100 : -currentSlide * 100}%)` }}
            >
              {highlights.map((highlight, index) => {
                const slideTitle = currentLocale === 'ru' ? highlight.title_ru : highlight.title_he
                const slideDescription = currentLocale === 'ru' ? highlight.description_ru : highlight.description_he
                const slideCategory = currentLocale === 'ru' ? highlight.category_ru : highlight.category_he
                const slideCtaText = currentLocale === 'ru' ? highlight.cta_text_ru : highlight.cta_text_he

                return (
                  <div
                    key={highlight.id}
                    className="min-w-full px-6 py-5"
                    style={{ opacity: index === currentSlide ? 1 : 0.3 }}
                  >
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${highlight.badge_color} shadow-sm`}>
                        {slideCategory}
                      </span>
                      {highlight.event_date && (
                        <span className="text-xs text-muted-foreground font-medium" dir="ltr">
                          {new Date(highlight.event_date).toLocaleDateString(currentLocale === 'ru' ? 'ru-RU' : 'he-IL', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                    </div>

                    {/* Content - Responsive Layout */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Top row: Icon + Text (always together) */}
                      <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                        {/* Enhanced Icon */}
                        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#0D98BA]/20 to-[#003153]/20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-sm transform transition-transform hover:scale-110">
                          {highlight.image_placeholder || highlight.icon}
                        </div>

                        {/* Enhanced Text */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-[#003153] mb-1 leading-tight">
                            {slideTitle}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {slideDescription}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row on mobile, right side on desktop: Actions */}
                      {slideCtaText && highlight.cta_link && (
                        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0 justify-end">
                          <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#0D98BA]/90 hover:to-[#003153]/90 text-sm px-4 py-2 h-auto shadow-md hover:shadow-lg transition-all flex-1 sm:flex-none"
                          >
                            <a
                              href={highlight.cta_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              {slideCtaText}
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Enhanced Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevSlide()
                setIsAutoPlaying(false)
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute top-1/2 -translate-y-1/2 left-2 z-10 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label={currentLocale === 'ru' ? 'Предыдущий' : 'הקודם'}
            >
              <ChevronLeft className="h-5 w-5 text-[#003153]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextSlide()
                setIsAutoPlaying(false)
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute top-1/2 -translate-y-1/2 right-2 z-10 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
              aria-label={currentLocale === 'ru' ? 'Следующий' : 'הבא'}
            >
              <ChevronRight className="h-5 w-5 text-[#003153]" />
            </button>
          </div>

          {/* Enhanced Dot Indicators */}
          <div className="flex justify-center gap-2 pb-4 pt-2">
            {highlights.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-[#0D98BA] to-[#003153] w-8 shadow-sm'
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
                aria-label={`${currentLocale === 'ru' ? 'Слайд' : 'שקופית'} ${index + 1}`}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Accessibility Info - Hidden but available for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {currentLocale === 'ru'
          ? `Слайд ${currentSlide + 1} из ${totalSlides}. ${isAutoPlaying ? 'Автоматическая смена включена' : 'Автоматическая смена выключена'}.`
          : `שקופית ${currentSlide + 1} מתוך ${totalSlides}. ${isAutoPlaying ? 'מעבר אוטומטי פעיל' : 'מעבר אוטומטי מושהה'}.`
        }
      </div>
    </div>
  )
}
