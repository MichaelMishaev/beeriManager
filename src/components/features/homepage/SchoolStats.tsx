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
      <div className="flex items-center justify-center gap-6 mb-6">
        {stats.map((stat) => (
          <div key={stat.labelKey} className="flex items-center gap-2">
            <span className="text-xl">{stat.icon}</span>
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
