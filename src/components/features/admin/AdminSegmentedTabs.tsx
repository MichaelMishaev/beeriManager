'use client'

import { cn } from '@/lib/utils/cn'

interface AdminSegmentedTabsProps<T extends string> {
  tabs: { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
}

export function AdminSegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: AdminSegmentedTabsProps<T>) {
  return (
    <div role="tablist" className="mb-3 flex gap-0.5 rounded-xl bg-[#e4e7ea] p-[3px]">
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`admin-tab-${tab.value}`}
            onClick={() => onChange(tab.value)}
            className={cn(
              'min-h-[44px] min-w-0 flex-1 rounded-[9px] px-1 py-1 text-[13px] font-semibold leading-tight transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]',
              active
                ? 'bg-white text-[#003153] shadow-[0_1px_2px_rgba(0,0,0,0.1)]'
                : 'text-[#5b6570] hover:text-[#003153]'
            )}
          >
            {/* Label and count wrap onto two lines instead of being cut off (long Russian labels) */}
            <span className="[overflow-wrap:anywhere]">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ms-1 whitespace-nowrap">({tab.count})</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
