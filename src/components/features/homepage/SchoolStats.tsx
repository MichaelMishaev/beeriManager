'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Users, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { CountUp, EASE_OUT } from '@/components/ui/motion'
import { duoCard } from '@/components/ui/duo'

interface SchoolStat {
  value: string
  labelKey: string
  icon: React.ElementType
  color: string
  tile?: string
  tileEdge?: string
}

interface SchoolStatsProps {
  variant?: 'banner' | 'inline' | 'footer' | 'cards'
}

export function SchoolStats({ variant = 'cards' }: SchoolStatsProps) {
  const t = useTranslations('schoolStats')

  const stats: SchoolStat[] = [
    // Number colors chosen for ≥3:1 (large text) on white
    { value: '575', labelKey: 'students', icon: Users, color: 'text-[#087A96]', tile: '#0D98BA', tileEdge: '#08718b' },
    { value: '22', labelKey: 'classes', icon: BookOpen, color: 'text-[#C25E00]', tile: '#FF8200', tileEdge: '#c25e00' }
  ]

  if (variant === 'cards') {
    return (
      <div className="container mx-auto px-4 -mt-4 mb-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease: EASE_OUT }}
              >
              <Card className={duoCard}>
                <CardContent className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    {/* Chunky colored icon tile */}
                    <span
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: stat.tile, boxShadow: `0 3px 0 ${stat.tileEdge}` }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </span>
                    <div className="min-w-0">
                    <div className={`text-3xl md:text-4xl font-extrabold leading-none ${stat.color}`}>
                      <CountUp value={Number(stat.value)} />
                    </div>
                    <div className="mt-1 text-xs md:text-sm text-gray-600 font-bold">
                      {t(stat.labelKey)}
                    </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
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
