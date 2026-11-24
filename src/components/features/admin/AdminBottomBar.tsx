'use client'

import { Calendar, LayoutGrid, MessageSquare, Sparkles, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { useAdminCounts } from '@/hooks/useAdminCounts'
import { cn } from '@/lib/utils/cn'

type BarKey = 'home' | 'events' | 'highlights' | 'inbox' | 'tickets'

const items: { key: BarKey; href: string; icon: LucideIcon }[] = [
  { key: 'home', href: '/admin', icon: LayoutGrid },
  { key: 'events', href: '/admin/events', icon: Calendar },
  { key: 'highlights', href: '/admin/highlights', icon: Sparkles },
  { key: 'inbox', href: '/admin/inbox', icon: MessageSquare },
  { key: 'tickets', href: '/admin/tickets', icon: Ticket },
]

// Pages that bring their own fixed bottom bar (prom quotes) must not get a second one.
const HIDDEN_ON = /^\/admin\/prom\/[^/]+\/quotes\/?$/

export function AdminBottomBar() {
  const t = useTranslations('admin.nav')
  const pathname = usePathname()
  const { counts } = useAdminCounts()

  if (HIDDEN_ON.test(pathname)) return null

  const hasNew = counts ? counts.inbox.feedback + counts.inbox.ideas > 0 : false

  return (
    <nav
      aria-label={t('ariaLabel')}
      data-testid="admin-bottom-bar"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
    >
      <ul className="pointer-events-auto flex gap-0.5 rounded-full bg-white p-1.5 shadow-[0_6px_18px_rgba(0,49,83,0.18)]">
        {items.map(({ key, href, icon: Icon }) => {
          const active = key === 'home' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <li key={key}>
              <Link
                href={href}
                aria-label={t(key)}
                aria-current={active ? 'page' : undefined}
                data-testid={`admin-bar-${key}`}
                className={cn(
                  'relative flex h-11 w-12 items-center justify-center rounded-full transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]',
                  active
                    ? 'bg-[#0D98BA]/15 text-[#0D98BA] ring-[1.5px] ring-[#0D98BA]'
                    : 'text-[#003153]/70 hover:bg-gray-100'
                )}
              >
                <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                {key === 'inbox' && hasNew && (
                  <span
                    data-testid="admin-bar-inbox-dot"
                    className="absolute end-2 top-1.5 h-[9px] w-[9px] rounded-full border-2 border-white bg-[#FF8200]"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
