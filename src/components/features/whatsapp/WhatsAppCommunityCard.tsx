'use client'

import { useState } from 'react'
import { MessageCircle, ChevronDown, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WHATSAPP_COMMUNITY } from './WhatsAppCommunityLinks'
import { useTranslations } from 'next-intl'

export function WhatsAppCommunityCard() {
  const [showGrades, setShowGrades] = useState(false)
  const t = useTranslations('whatsapp')

  return (
    <Card className="border-2 border-[#25D366]/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-[#25D366]" />
          {t('title')}
        </CardTitle>
        <CardDescription className="text-xs">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Grades Toggle */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowGrades(!showGrades)}
            className="w-full px-3 py-2 bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between text-sm"
          >
            <span className="font-medium">{t('groupsByGrade')}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showGrades ? 'rotate-180' : ''}`} />
          </button>

          {showGrades && (
            <div className="p-2 space-y-1 bg-card">
              {WHATSAPP_COMMUNITY.grades.map((grade) => (
                <a
                  key={grade.grade}
                  href={grade.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-muted/50 transition-colors group text-sm"
                >
                  <span className="text-lg">{grade.emoji}</span>
                  <span className="font-medium flex-1">{t('gradePrefix')} {grade.grade}</span>
                  <ExternalLink className="h-3 w-3 text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
