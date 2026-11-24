'use client'

import {
  AlertTriangle,
  BarChart3,
  Bell,
  BellRing,
  CalendarDays,
  CheckSquare,
  FileText,
  GraduationCap,
  Phone,
  Receipt,
  Settings,
  Store,
  Tags,
  Users,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminGroup, AdminPageHeader, AdminRow } from '@/components/features/admin'

type Tool = { key: string; href: string; icon: LucideIcon; hasSubtitle?: boolean }
type ToolGroup = { key: string; tools: Tool[] }

// Every href below points to an existing page file under (admin)/admin/.
const groups: ToolGroup[] = [
  {
    key: 'messages',
    tools: [
      { key: 'urgent', href: '/admin/urgent', icon: BellRing, hasSubtitle: true },
      { key: 'notifications', href: '/admin/notifications', icon: Bell },
    ],
  },
  {
    key: 'work',
    tools: [
      { key: 'tasks', href: '/admin/tasks', icon: CheckSquare },
      { key: 'meetings', href: '/admin/meetings', icon: UsersRound },
      { key: 'protocols', href: '/admin/protocols/new', icon: FileText },
      { key: 'issuesNew', href: '/admin/issues/new', icon: AlertTriangle },
      { key: 'issuesStats', href: '/admin/issues/stats', icon: BarChart3 },
    ],
  },
  {
    key: 'people',
    tools: [
      { key: 'committees', href: '/admin/committees', icon: Users },
      { key: 'contacts', href: '/admin/contacts', icon: Phone },
      { key: 'vendors', href: '/admin/vendors', icon: Store },
    ],
  },
  {
    key: 'planning',
    tools: [
      { key: 'prom', href: '/admin/prom', icon: GraduationCap },
      { key: 'expenses', href: '/admin/expenses', icon: Receipt },
      { key: 'calendar', href: '/admin/calendar', icon: CalendarDays },
    ],
  },
  {
    key: 'system',
    tools: [
      { key: 'settings', href: '/admin/settings', icon: Settings },
      { key: 'tags', href: '/admin/tags', icon: Tags },
    ],
  },
]

export default function AdminMorePage() {
  const t = useTranslations('admin.more')

  return (
    <div className="space-y-5">
      <AdminPageHeader title={t('title')} />

      {groups.map((group) => (
        <AdminGroup key={group.key} title={t(`groups.${group.key}`)}>
          {group.tools.map((tool) => (
            <AdminRow
              key={tool.key}
              href={tool.href}
              testId={`more-row-${tool.key}`}
              icon={tool.icon}
              title={t(`tools.${tool.key}.title`)}
              subtitle={tool.hasSubtitle ? t(`tools.${tool.key}.subtitle`) : undefined}
            />
          ))}
        </AdminGroup>
      ))}
    </div>
  )
}
