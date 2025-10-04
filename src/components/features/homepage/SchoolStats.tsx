'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

interface SchoolStat {
  value: string
  labelKey: string
  icon: string
}

interface SchoolStatsProps {
  variant?: 'banner' | 'inline' | 'footer'
}

export function SchoolStats({ variant = 'banner' }: SchoolStatsProps) {
  const t = useTranslations('schoolStats')

  const stats: SchoolStat[] = [
    { value: '562', labelKey: 'students', icon: '👥' },
    { value: '22', labelKey: 'classes', icon: '📚' }
  ]

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-3 mb-4 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="text-center py-1">
              <div className="text-2xl mb-0.5">{stat.icon}</div>
              <div className="text-2xl font-bold text-sky-700">{stat.value}</div>
              <div className="text-xs text-sky-600 mt-0.5">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <p className="text-sm text-muted-foreground text-center mb-4">
        {stats.map((s, i) => (
          <React.Fragment key={s.labelKey}>
            {i > 0 && ' • '}
            {s.icon} <strong>{s.value}</strong> {t(s.labelKey)}
          </React.Fragment>
        ))}
      </p>
    )
  }

  // footer variant
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center flex-wrap">
      {stats.map((s) => (
        <span key={s.labelKey}>
          {s.icon} {s.value} {t(s.labelKey)}
        </span>
      ))}
    </div>
  )
}
