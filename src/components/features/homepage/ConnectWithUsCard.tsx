'use client'

import { MessageSquare, Lightbulb, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

/**
 * 2025 Bento Box Layout - Connect With Us Card
 * Consolidates WhatsApp + Feedback + Ideas into single card with 3 direct actions
 * Follows progressive disclosure + reduce clicks principle
 * No modal needed - actions are visible and accessible immediately
 */
export function ConnectWithUsCard() {
  const t = useTranslations('feedbackAndIdeas')

  return (
    <Card className="bg-gradient-to-br from-[#0D98BA]/5 to-[#FFBA00]/5 border-[#0D98BA]/20 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D98BA]/10 to-[#FFBA00]/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-[#0D98BA]" />
          </div>
          <CardTitle className="text-xl text-[#003153]">
            {t('title')}
          </CardTitle>
        </div>
        <CardDescription className="text-base mt-2">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* 2025 Bento Box Grid - 3 Direct Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* WhatsApp Community Button */}
          <a
            href="https://wa.me/972544345287?text=יש%20לי%20שאלה%3A%0A"
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            data-testid="connect-whatsapp-button"
          >
            <div className="h-full min-h-[120px] p-4 rounded-xl
                          border-2 border-green-300 bg-green-50
                          hover:bg-green-100 hover:border-green-500 hover:shadow-lg
                          hover:-translate-y-1
                          active:scale-[0.98]
                          transition-all duration-200 ease-out
                          cursor-pointer
                          flex flex-col items-center justify-center text-center gap-2">
              <div className="w-14 h-14 rounded-full bg-green-200
                            flex items-center justify-center flex-shrink-0
                            group-hover:bg-green-300 group-hover:scale-110
                            transition-all duration-200">
                <MessageSquare className="h-7 w-7 text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#003153] mb-1
                             group-hover:text-green-700 transition-colors">
                  💬 WhatsApp
                </h3>
                <p className="text-xs text-gray-600">
                  {t('whatsappDescription')}
                </p>
              </div>
            </div>
          </a>

          {/* Feedback Button */}
          <Link
            href="/complaint"
            className="group block"
            data-testid="connect-feedback-button"
          >
            <div className="h-full min-h-[120px] p-4 rounded-xl
                          border-2 border-[#0D98BA]/30 bg-[#0D98BA]/5
                          hover:bg-[#0D98BA]/10 hover:border-[#0D98BA] hover:shadow-lg
                          hover:-translate-y-1
                          active:scale-[0.98]
                          transition-all duration-200 ease-out
                          cursor-pointer
                          flex flex-col items-center justify-center text-center gap-2">
              <div className="w-14 h-14 rounded-full bg-[#0D98BA]/20
                            flex items-center justify-center flex-shrink-0
                            group-hover:bg-[#0D98BA]/30 group-hover:scale-110
                            transition-all duration-200">
                <MessageSquare className="h-7 w-7 text-[#0D98BA]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#003153] mb-1
                             group-hover:text-[#0D98BA] transition-colors">
                  💭 {t('feedbackTitle')}
                </h3>
                <p className="text-xs text-gray-600">
                  {t('feedbackDescription')}
                </p>
              </div>
            </div>
          </Link>

          {/* Ideas Button */}
          <Link
            href="/ideas"
            className="group block"
            data-testid="connect-ideas-button"
          >
            <div className="h-full min-h-[120px] p-4 rounded-xl
                          border-2 border-[#FFBA00]/30 bg-[#FFBA00]/5
                          hover:bg-[#FFBA00]/10 hover:border-[#FFBA00] hover:shadow-lg
                          hover:-translate-y-1
                          active:scale-[0.98]
                          transition-all duration-200 ease-out
                          cursor-pointer
                          flex flex-col items-center justify-center text-center gap-2">
              <div className="w-14 h-14 rounded-full bg-[#FFBA00]/20
                            flex items-center justify-center flex-shrink-0
                            group-hover:bg-[#FFBA00]/30 group-hover:scale-110
                            transition-all duration-200">
                <Lightbulb className="h-7 w-7 text-[#FFBA00]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#003153] mb-1
                             group-hover:text-[#FFBA00] transition-colors">
                  💡 {t('ideaTitle')}
                </h3>
                <p className="text-xs text-gray-600">
                  {t('ideaDescription')}
                </p>
              </div>
            </div>
          </Link>

        </div>
      </CardContent>
    </Card>
  )
}
