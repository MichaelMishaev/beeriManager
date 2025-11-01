'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import type { Highlight } from '@/types'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

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


export function HighlightsCarousel() {
  const params = useParams()
  const currentLocale = (params.locale as Locale) || 'he'
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [highlights, setHighlights] = useState<DisplayHighlight[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 6000) // 6 seconds per slide

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  const shareHighlight = async (highlight: DisplayHighlight) => {
    const title = currentLocale === 'ru' ? highlight.title_ru : highlight.title_he
    const description = currentLocale === 'ru' ? highlight.description_ru : highlight.description_he
    const url = `${window.location.origin}/${currentLocale}`

    const shareText = `${highlight.icon} ${title}\n\n${description}\n\n🌐 ${url}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: shareText
        })
        logger.userAction('Share highlight', { highlightId: highlight.id, locale: currentLocale })
      } else {
        await navigator.clipboard.writeText(shareText)
        toast.success(currentLocale === 'ru' ? 'Скопировано!' : 'הועתק ללוח!')
        logger.userAction('Copy highlight to clipboard', { highlightId: highlight.id })
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    }
  }

  // Show nothing if no highlights (not even loading)
  if (highlights.length === 0 && !isLoading) {
    return null
  }

  const currentHighlight = highlights[currentSlide]
  if (!currentHighlight) return null

  const title = currentLocale === 'ru' ? currentHighlight.title_ru : currentHighlight.title_he
  const description = currentLocale === 'ru' ? currentHighlight.description_ru : currentHighlight.description_he
  const category = currentLocale === 'ru' ? currentHighlight.category_ru : currentHighlight.category_he
  const ctaText = currentLocale === 'ru' ? currentHighlight.cta_text_ru : currentHighlight.cta_text_he

  return (
    <div className="mb-4 animate-slide-down">
      <div className="relative bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
        <Card className="border-0 shadow-none overflow-hidden bg-transparent">
          {/* Carousel Container */}
          <div className="relative overflow-hidden">
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
                    className="min-w-full px-4 py-3"
                    style={{ opacity: index === currentSlide ? 1 : 0.3 }}
                  >
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${highlight.badge_color}`}>
                        {slideCategory}
                      </span>
                      {highlight.event_date && (
                        <span className="text-xs text-muted-foreground" dir="ltr">
                          {new Date(highlight.event_date).toLocaleDateString(currentLocale === 'ru' ? 'ru-RU' : 'he-IL', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                    </div>

                    {/* Content - Compact Horizontal Layout */}
                    <div className="flex items-center gap-4">
                      {/* Smaller Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0D98BA]/20 to-[#003153]/20 rounded-xl flex items-center justify-center text-3xl">
                        {highlight.image_placeholder || highlight.icon}
                      </div>

                      {/* Compact Text */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-[#003153] mb-1 leading-tight line-clamp-1">
                          {slideTitle}
                        </h2>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-snug">
                          {slideDescription}
                        </p>
                      </div>

                      {/* Compact Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {slideCtaText && (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#0D98BA]/90 hover:to-[#003153]/90 text-xs px-3 py-1 h-auto"
                          >
                            {slideCtaText}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareHighlight(highlight)}
                          className="p-2 h-auto"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation Arrows - Smaller */}
            <button
              onClick={() => {
                prevSlide()
                setIsAutoPlaying(false)
              }}
              className="absolute top-1/2 -translate-y-1/2 left-1 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm transition-all hover:scale-105"
              aria-label={currentLocale === 'ru' ? 'Предыдущий' : 'הקודם'}
            >
              <ChevronLeft className="h-4 w-4 text-[#003153]" />
            </button>
            <button
              onClick={() => {
                nextSlide()
                setIsAutoPlaying(false)
              }}
              className="absolute top-1/2 -translate-y-1/2 right-1 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm transition-all hover:scale-105"
              aria-label={currentLocale === 'ru' ? 'Следующий' : 'הבא'}
            >
              <ChevronRight className="h-4 w-4 text-[#003153]" />
            </button>
          </div>

          {/* Dot Indicators - Minimal */}
          <div className="flex justify-center gap-1.5 pb-3 pt-1">
            {highlights.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-[#0D98BA] w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`${currentLocale === 'ru' ? 'Слайд' : 'שקופית'} ${index + 1}`}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
