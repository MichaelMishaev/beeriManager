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
      <div className="flex gap-1.5 bg-white rounded-3xl p-1.5 pb-2 border-2 border-[#e5e5e5] shadow-[0_4px_0_#e5e5e5,0_12px_32px_rgba(0,49,83,0.18)]">
        <Button
          size="sm"
          onClick={() => scrollToSection('events-section')}
          className="rounded-2xl gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-2 h-auto text-xs whitespace-nowrap font-extrabold shadow-[0_3px_0_#1e3a8a] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-75"
        >
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{t('events')}</span>
        </Button>

        <Button
          size="sm"
          onClick={() => scrollToSection('whatsapp-section')}
          className="rounded-2xl gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-2 h-auto text-xs whitespace-nowrap font-extrabold shadow-[0_3px_0_#14532d] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-75"
        >
          <MessageCircle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{t('whatsapp')}</span>
        </Button>

        <Button
          size="sm"
          onClick={() => scrollToSection('survey-section')}
          className="rounded-2xl gap-1 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-2 h-auto text-xs whitespace-nowrap font-extrabold shadow-[0_3px_0_#581c87] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-75"
        >
          <GraduationCap className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{t('survey')}</span>
        </Button>
      </div>
    </div>
  )
}
