'use client'

import type { ReactNode } from 'react'
import { Users, TrendingUp, Phone, Award } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { SkillResponseStats, SkillCategory } from '@/types/parent-skills'

interface Props {
  stats: SkillResponseStats
}

function StatCell({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        {icon}
      </div>
      {children}
    </div>
  )
}

export function SkillsStatsCards({ stats }: Props) {
  const t = useTranslations('admin.inbox.survey')

  // Top 3 skills
  const topSkills = Object.entries(stats.skill_breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[#eef0f2] shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:grid-cols-4">
      {/* Total Responses */}
      <StatCell title={t('statsTotal')} icon={<Users className="h-4 w-4 text-blue-600" aria-hidden="true" />}>
        <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.total_responses}</p>
        <p className="text-xs text-gray-500">{t('statsAnonymous', { count: stats.anonymous_count })}</p>
      </StatCell>

      {/* Recent Responses */}
      <StatCell title={t('statsWeek')} icon={<TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />}>
        <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.recent_responses}</p>
        <p className="text-xs text-gray-500">{t('statsWeekHint')}</p>
      </StatCell>

      {/* WhatsApp Preferred */}
      <StatCell title={t('statsWhatsapp')} icon={<Phone className="h-4 w-4 text-orange-600" aria-hidden="true" />}>
        <p className="mt-1 text-2xl font-bold text-[#003153]">{stats.contact_breakdown.whatsapp || 0}</p>
        <p className="text-xs text-gray-500">{t('statsPhone', { count: stats.contact_breakdown.phone || 0 })}</p>
      </StatCell>

      {/* Top Skills */}
      <StatCell title={t('statsTopSkills')} icon={<Award className="h-4 w-4 text-purple-600" aria-hidden="true" />}>
        <div className="mt-1 space-y-1">
          {topSkills.length > 0 ? (
            topSkills.map(([skill, count], index) => (
              <div key={skill} className="flex justify-between gap-2 text-xs">
                <span className="min-w-0 truncate font-medium text-[#003153]">
                  #{index + 1} {t(`skills.${skill as SkillCategory}`)}
                </span>
                <span className="text-gray-500">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">{t('noData')}</p>
          )}
        </div>
      </StatCell>
    </div>
  )
}
