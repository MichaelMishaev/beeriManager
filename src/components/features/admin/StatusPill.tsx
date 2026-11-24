import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Tone = 'success' | 'neutral' | 'warning' | 'danger' | 'info'

const tones: Record<Tone, string> = {
  success: 'bg-[#d1fae5] text-[#065f46]',
  neutral: 'bg-[#e5e7eb] text-[#4b5563]',
  warning: 'bg-[#fff3cd] text-[#8a5a00]',
  danger: 'bg-[#fee2e2] text-[#991b1b]',
  info: 'bg-[#87CEEB]/30 text-[#003153]',
}

export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex flex-none items-center whitespace-nowrap rounded-md px-[7px] py-0.5 text-[11px] font-semibold',
        tones[tone]
      )}
    >
      {children}
    </span>
  )
}
