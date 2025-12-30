'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Phone, Award } from 'lucide-react'
import type { SkillResponseStats } from '@/types/parent-skills'
import { SKILL_NAMES_HE } from '@/types/parent-skills'

interface Props {
  stats: SkillResponseStats
}

export function SkillsStatsCards({ stats }: Props) {
  // Top 3 skills
  const topSkills = Object.entries(stats.skill_breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Responses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">סך הכל תשובות</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_responses}</div>
          <p className="text-xs text-gray-600 mt-1">{stats.anonymous_count} אנונימיות</p>
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">תשובות השבוע</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recent_responses}</div>
          <p className="text-xs text-gray-600 mt-1">7 ימים אחרונים</p>
        </CardContent>
      </Card>

      {/* WhatsApp Preferred */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">מעדיפי WhatsApp</CardTitle>
          <Phone className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.contact_breakdown.whatsapp || 0}</div>
          <p className="text-xs text-gray-600 mt-1">{stats.contact_breakdown.phone || 0} מעדיפים טלפון</p>
        </CardContent>
      </Card>

      {/* Top Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">מיומנויות פופולריות</CardTitle>
          <Award className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topSkills.length > 0 ? (
              topSkills.map(([skill, count], index) => (
                <div key={skill} className="text-xs flex justify-between">
                  <span className="font-medium">
                    #{index + 1} {SKILL_NAMES_HE[skill as keyof typeof SKILL_NAMES_HE]}
                  </span>
                  <span className="text-gray-600">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">אין נתונים</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
