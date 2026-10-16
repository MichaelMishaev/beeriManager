'use client'

import { MessageSquare, MessagesSquare, Lightbulb, MessageCircle, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { duoCard, duoPress, DuoIconTile } from '@/components/ui/duo'
import { cn } from '@/lib/utils'

/**
 * 2025 Bento Box Layout - Connect With Us Card
 * Consolidates WhatsApp + Feedback + Ideas into single card with 3 direct actions
 * Follows progressive disclosure + reduce clicks principle
 * No modal needed - actions are visible and accessible immediately
 */
export function ConnectWithUsCard() {
  const t = useTranslations('feedbackAndIdeas')

  const actions = [
    {
      key: 'whatsapp',
      href: 'https://wa.me/972544345287?text=יש%20לי%20שאלה%3A%0A',
      external: true,
      icon: MessageSquare,
      tone: 'green' as const,
      title: 'WhatsApp',
      description: t('whatsappDescription'),
    },
    {
      key: 'feedback',
      href: '/complaint',
      external: false,
      icon: MessagesSquare,
      tone: 'teal' as const,
      title: t('feedbackTitle'),
      description: t('feedbackDescription'),
    },
    {
      key: 'ideas',
      href: '/ideas',
      external: false,
      icon: Lightbulb,
      tone: 'yellow' as const,
      title: t('ideaTitle'),
      description: t('ideaDescription'),
    },
  ]

  return (
    <Card className={duoCard}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <DuoIconTile icon={MessageCircle} tone="navy" />
          <CardTitle className="text-xl font-extrabold text-[#003153]">
            {t('title')}
          </CardTitle>
        </div>
        <CardDescription className="text-sm md:text-base font-medium mt-2">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        {/* Duolingo "shop row" list: icon tile · text · chevron; each row sinks on press */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const row = (
              <div className={cn(duoCard, duoPress, 'h-full flex items-center gap-3 p-3 cursor-pointer')}>
                <DuoIconTile icon={action.icon} tone={action.tone} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-base text-[#003153] leading-tight">
                    {action.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-snug mt-0.5">
                    {action.description}
                  </p>
                </div>
                {/* Points "forward": left in RTL, right in LTR */}
                <ChevronLeft className="h-5 w-5 text-[#afafaf] flex-shrink-0 ltr:rotate-180" strokeWidth={3} />
              </div>
            )
            return action.external ? (
              <a
                key={action.key}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                data-testid={`connect-${action.key}-button`}
              >
                {row}
              </a>
            ) : (
              <Link key={action.key} href={action.href} className="block" data-testid={`connect-${action.key}-button`}>
                {row}
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
