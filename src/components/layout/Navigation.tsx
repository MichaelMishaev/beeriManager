'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Calendar, CheckSquare, MessageSquare, DollarSign, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

const navItems = [
  { href: '/', label: 'בית', icon: Home },
  { href: '/events', label: 'אירועים', icon: Calendar },
  { href: '/calendar', label: 'לוח שנה', icon: Calendar },
  { href: '/tasks', label: 'משימות', icon: CheckSquare },
  { href: '/feedback', label: 'משוב', icon: MessageSquare },
  { href: '/finances', label: 'כספים', icon: DollarSign },
  { href: '/issues', label: 'בעיות', icon: AlertCircle },
  { href: '/protocols', label: 'פרוטוקולים', icon: FileText },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleNavClick = (href: string, label: string) => {
    logger.userAction('Navigate from menu', { to: href, label })
    setIsOpen(false)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <Link
            href="/"
            className="flex items-center space-x-2 space-x-reverse"
            onClick={() => handleNavClick('/', 'בית')}
          >
            <span className="text-xl font-bold">ועד הורים</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href, item.label)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => {
              setIsOpen(!isOpen)
              logger.userAction('Toggle mobile menu', { isOpen: !isOpen })
            }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href, item.label)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}