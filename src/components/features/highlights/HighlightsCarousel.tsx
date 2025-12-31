'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronRight, ChevronLeft, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShareButton } from '@/components/ui/share-button'
import { formatHighlightShareData } from '@/lib/utils/share-formatters'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import type { Highlight } from '@/types'
import { logger } from '@/lib/logger'

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
  created_at?: string
}

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
    created_at: highlight.created_at,
  }
}

function HighlightsSkeleton() {
  return (
    <div className="mb-6 space-y-3">
      <div className="relative min-h-[320px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/50 rounded-2xl animate-pulse" />
        </div>
      </div>
      <div className="h-1 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex items-center justify-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export function HighlightsCarousel() {
  const params = useParams()
  const currentLocale = (params.locale as Locale) || 'he'
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [highlights, setHighlights] = useState<DisplayHighlight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHighlight, setSelectedHighlight] = useState<DisplayHighlight | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalSlides = highlights.length

  // Fetch highlights from API
  useEffect(() => {
    async function fetchHighlights() {
      try {
        const response = await fetch('/api/highlights?limit=10')
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          const displayHighlights = data.data.map(convertToDisplay)
          setHighlights(displayHighlights)
          logger.info('Highlights loaded from API', { count: displayHighlights.length })
        } else {
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
    setProgress(0)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
    setProgress(0)
  }, [totalSlides])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setProgress(0)
    setIsAutoPlaying(false)
  }, [])

  // Progress bar - increments from 0 to 100
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    if (!isAutoPlaying || totalSlides === 0) {
      setProgress(0)
      return
    }

    // Increment progress every 100ms
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100 // Cap at 100, don't reset here
        }
        return prev + 1.25 // 1.25% every 100ms = 8 seconds total
      })
    }, 100)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isAutoPlaying, totalSlides])

  // Auto-advance when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && isAutoPlaying) {
      nextSlide()
    }
  }, [progress, isAutoPlaying, nextSlide])

  // Touch handlers
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
      if (isLeftSwipe) prevSlide()
      if (isRightSwipe) nextSlide()
    } else {
      if (isLeftSwipe) nextSlide()
      if (isRightSwipe) prevSlide()
    }

    setIsAutoPlaying(false)
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

  if (isLoading) {
    return <HighlightsSkeleton />
  }

  if (highlights.length === 0) {
    return null
  }

  const currentHighlight = highlights[currentSlide]

  return (
    <>
      <div className="mb-6 space-y-3 animate-in fade-in-50 duration-700">
        {/* Carousel Card - Clean, no overlapping controls */}
        <div
          className="relative min-h-[320px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            setSelectedHighlight(currentHighlight)
            setIsModalOpen(true)
            setIsAutoPlaying(false)
          }}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D98BA]/5 via-purple-500/5 to-pink-500/5 animate-gradient" />

          {/* Navigation Arrows - On sides, not overlapping content */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              prevSlide()
              setIsAutoPlaying(false)
            }}
            className="absolute top-1/2 -translate-y-1/2 left-3 z-20 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 border border-gray-200/50"
            aria-label={currentLocale === 'ru' ? 'Предыдущий' : 'הקודם'}
          >
            <ChevronLeft className="h-5 w-5 text-gray-900" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextSlide()
              setIsAutoPlaying(false)
            }}
            className="absolute top-1/2 -translate-y-1/2 right-3 z-20 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 border border-gray-200/50"
            aria-label={currentLocale === 'ru' ? 'Следующий' : 'הבא'}
          >
            <ChevronRight className="h-5 w-5 text-gray-900" />
          </button>

          {/* Content - Centered, no controls blocking */}
          <div className="relative min-h-[320px] flex items-center justify-center px-16 py-6">
            <div
              className="flex transition-transform duration-700 ease-out w-full"
              style={{ transform: `translateX(${currentLocale === 'he' ? currentSlide * 100 : -currentSlide * 100}%)` }}
            >
              {highlights.map((highlight, index) => {
                const title = currentLocale === 'ru' ? highlight.title_ru : highlight.title_he
                const description = currentLocale === 'ru' ? highlight.description_ru : highlight.description_he
                const category = currentLocale === 'ru' ? highlight.category_ru : highlight.category_he
                const ctaText = currentLocale === 'ru' ? highlight.cta_text_ru : highlight.cta_text_he

                return (
                  <div
                    key={highlight.id}
                    className="min-w-full flex flex-col items-center justify-center text-center px-4 space-y-2.5"
                    style={{
                      opacity: index === currentSlide ? 1 : 0,
                      transition: 'opacity 0.7s ease-out'
                    }}
                  >
                    {/* Category Badge */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-md ${highlight.badge_color}`}>
                      {category}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                      {highlight.image_placeholder || highlight.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight max-w-2xl px-2">
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-gray-700 line-clamp-3 max-w-xl leading-relaxed px-2">
                      {description}
                    </p>

                    {/* CTA Button */}
                    {ctaText && highlight.cta_link && index === currentSlide && (
                      <Button
                        variant="default"
                        size="lg"
                        asChild
                        className="bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#0D98BA]/90 hover:to-[#003153]/90 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      >
                        <a
                          href={highlight.cta_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ctaText}
                        </a>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Linear Progress Bar - Below carousel, never overlaps */}
        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0D98BA] via-[#FFBA00] to-[#FF8200] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${isAutoPlaying ? progress : 0}%` }}
          />
        </div>

        {/* Controls Row - Clean separation from content */}
        <div className="flex items-center justify-center gap-4">
          {/* Previous Arrow */}
          <button
            onClick={() => {
              prevSlide()
              setIsAutoPlaying(false)
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label={currentLocale === 'ru' ? 'Предыдущий' : 'הקודם'}
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          {/* Dot Indicators */}
          <div className="flex gap-2">
            {highlights.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-[#0D98BA] to-[#003153] w-8'
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
                aria-label={`${currentLocale === 'ru' ? 'Слайд' : 'שקופית'} ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <span className="text-xs font-medium text-gray-500 min-w-[3ch] text-center">
            {currentSlide + 1}/{totalSlides}
          </span>

          {/* Play/Pause */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label={isAutoPlaying ? (currentLocale === 'ru' ? 'Пауза' : 'השהה') : (currentLocale === 'ru' ? 'Играть' : 'נגן')}
          >
            {isAutoPlaying ? (
              <Pause className="h-4 w-4 text-gray-700" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4 text-gray-700" fill="currentColor" />
            )}
          </button>

          {/* Next Arrow */}
          <button
            onClick={() => {
              nextSlide()
              setIsAutoPlaying(false)
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label={currentLocale === 'ru' ? 'Следующий' : 'הבא'}
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Accessibility */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {currentLocale === 'ru'
          ? `Слайд ${currentSlide + 1} из ${totalSlides}. ${isAutoPlaying ? 'Автоматическая смена включена' : 'Автоматическая смена выключена'}.`
          : `שקופית ${currentSlide + 1} מתוך ${totalSlides}. ${isAutoPlaying ? 'מעבר אוטומטי פעיל' : 'מעבר אוטומטי מושהה'}.`
        }
      </div>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedHighlight && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="flex items-center gap-3 text-2xl flex-1">
                    <span className="text-4xl">{selectedHighlight.image_placeholder || selectedHighlight.icon}</span>
                    {currentLocale === 'ru' ? selectedHighlight.title_ru : selectedHighlight.title_he}
                  </DialogTitle>
                  <ShareButton
                    shareData={formatHighlightShareData(selectedHighlight, currentLocale)}
                    variant="ghost"
                    size="icon"
                    locale={currentLocale}
                    className="flex-shrink-0"
                    onShareSuccess={() => {
                      logger.userAction('Share highlight', {
                        highlightId: selectedHighlight.id,
                        locale: currentLocale
                      })
                    }}
                  />
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${selectedHighlight.badge_color} shadow-sm`}>
                    {currentLocale === 'ru' ? selectedHighlight.category_ru : selectedHighlight.category_he}
                  </span>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {currentLocale === 'ru' ? selectedHighlight.description_ru : selectedHighlight.description_he}
                  </p>
                </div>

                {selectedHighlight.cta_link && (currentLocale === 'ru' ? selectedHighlight.cta_text_ru : selectedHighlight.cta_text_he) && (
                  <div className="pt-4">
                    <Button
                      variant="default"
                      size="lg"
                      asChild
                      className="w-full bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#0D98BA]/90 hover:to-[#003153]/90 shadow-lg hover:shadow-xl transition-all"
                    >
                      <a
                        href={selectedHighlight.cta_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {currentLocale === 'ru' ? selectedHighlight.cta_text_ru : selectedHighlight.cta_text_he}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
