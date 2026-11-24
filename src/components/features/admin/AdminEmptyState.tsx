import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface AdminEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function AdminEmptyState({ icon: Icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      data-testid="admin-empty-state"
    >
      {Icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef0f2] text-[#003153]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <p className="text-[15px] font-semibold text-[#003153]">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
