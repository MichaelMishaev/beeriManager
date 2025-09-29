'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, CheckSquare, AlertCircle, FileText, Settings, LogOut, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/', label: 'לוח בקרה', icon: Home },
  { href: '/events', label: 'אירועים', icon: Calendar },
  { href: '/tasks', label: 'משימות', icon: CheckSquare },
  { href: '/issues', label: 'בעיות ותקלות', icon: AlertCircle },
  { href: '/protocols', label: 'פרוטוקולים', icon: FileText },
]

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'ניהול כללי', icon: Settings, adminOnly: true },
  { href: '/admin/events', label: 'ניהול אירועים', icon: Calendar, adminOnly: true },
  { href: '/admin/expenses', label: 'ניהול הוצאות', icon: FileText, adminOnly: true },
  { href: '/admin/vendors', label: 'ספקים', icon: Users, adminOnly: true },
]

interface DesktopSidebarProps {
  isAdmin?: boolean
  onLogout?: () => void
  className?: string
}

export function DesktopSidebar({ isAdmin = false, onLogout, className }: DesktopSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "hidden md:flex md:flex-col md:w-64 bg-white border-l border-gray-200 h-screen",
      className
    )}>
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ב</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">BeeriManager</h1>
            <p className="text-sm text-gray-500">ועד הורים</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Public Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="pt-4">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ניהול
              </h3>
            </div>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {isAdmin && onLogout && (
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span>התנתק</span>
          </Button>
        )}

        {/* Version info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">BeeriManager v1.0</p>
        </div>
      </div>
    </aside>
  )
}