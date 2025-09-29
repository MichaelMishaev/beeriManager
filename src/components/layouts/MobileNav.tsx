'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, CheckSquare, AlertCircle, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/', label: 'בית', icon: Home },
  { href: '/events', label: 'אירועים', icon: Calendar },
  { href: '/tasks', label: 'משימות', icon: CheckSquare },
  { href: '/issues', label: 'בעיות', icon: AlertCircle },
  { href: '/protocols', label: 'פרוטוקולים', icon: FileText },
]

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'ניהול', icon: Settings, adminOnly: true },
]

interface MobileNavProps {
  isAdmin?: boolean
  className?: string
}

export function MobileNav({ isAdmin = false, className }: MobileNavProps) {
  const pathname = usePathname()

  const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50",
      className
    )}>
      <div className="flex justify-around items-center h-16 px-2">
        {allNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full px-1 py-2',
                'transition-colors duration-200 rounded-lg mx-1',
                'min-w-0', // Prevent flex item from growing too much
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  )
}