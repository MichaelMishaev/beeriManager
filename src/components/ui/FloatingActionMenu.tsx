'use client'

import { useState, useEffect } from 'react'
import { Calendar, MessageCircle, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

/**
 * Floating Action Menu - Mobile Only
 * Provides quick access to primary actions after scrolling
 * Shows after user scrolls past hero section (500px)
 */
export function FloatingActionMenu() {
  const [isVisible, setIsVisible] = useState(false)
  const t = useTranslations('floatingMenu')

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (500px)
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden",
        "transition-all duration-300 ease-out",
        "max-w-[calc(100vw-2rem)] px-2",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
    >
      <div className="flex gap-1.5 bg-white rounded-full shadow-2xl p-1.5 border-2 border-gray-200">
        <Button
          size="sm"
          onClick={() => scrollToSection('events-section')}
          className="rounded-full gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-2 h-auto text-xs whitespace-nowrap"
        >
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{t('events')}</span>
        </Button>

        <Button
          size="sm"
          onClick={() => scrollToSection('whatsapp-section')}
          className="rounded-full gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-2 h-auto text-xs whitespace-nowrap"
        >
          <MessageCircle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{t('whatsapp')}</span>
        </Button>

        <Button
          size="sm"
          onClick={() => scrollToSection('survey-section')}
          className="rounded-full gap-1 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-2 h-auto text-xs whitespace-nowrap"
        >
          <GraduationCap className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{t('survey')}</span>
        </Button>
      </div>
    </div>
  )
}
