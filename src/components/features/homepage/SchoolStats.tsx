'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Users, BookOpen } from 'lucide-react'

interface SchoolStat {
  value: string
  labelKey: string
  icon: React.ElementType
  color: string
}

interface SchoolStatsProps {
  variant?: 'banner' | 'inline' | 'footer' | 'cards'
}

export function SchoolStats({ variant = 'cards' }: SchoolStatsProps) {
  const t = useTranslations('schoolStats')

  const stats: SchoolStat[] = [
    { value: '562', labelKey: 'students', icon: Users, color: 'text-[#0D98BA]' },
    { value: '22', labelKey: 'classes', icon: BookOpen, color: 'text-[#0D98BA]' }
  ]

  if (variant === 'cards') {
    return (
      <div className="container mx-auto px-4 -mt-12 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.labelKey}
                className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="pt-4 pb-4">
                  <div className="text-center">
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {t(stat.labelKey)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className="flex items-center justify-center gap-6 mb-6">
        {stats.map((stat) => (
          <div key={stat.labelKey} className="flex items-center gap-2">
            <span className="text-xl">{stat.labelKey === 'students' ? '👥' : '📚'}</span>
            <div>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{t(stat.labelKey)}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <p className="text-sm text-muted-foreground text-center mb-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <React.Fragment key={s.labelKey}>
              {i > 0 && ' • '}
              <Icon className="inline h-4 w-4" /> <strong>{s.value}</strong> {t(s.labelKey)}
            </React.Fragment>
          )
        })}
      </p>
    )
  }

  // footer variant
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center flex-wrap">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <span key={s.labelKey}>
            <Icon className="inline h-3 w-3" /> {s.value} {t(s.labelKey)}
          </span>
        )
      })}
    </div>
  )
}
