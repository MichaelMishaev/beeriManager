'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Calendar, CheckSquare, MessageSquare, DollarSign, AlertCircle, FileText, Building2, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

// Public navigation for parents
const publicNavItems = [
  { href: '/', label: 'בית', icon: Home },
  { href: '/events', label: 'אירועים', icon: Calendar },
  { href: '/calendar', label: 'לוח שנה', icon: Calendar },
]

// Committee navigation (authenticated)
const committeeNavItems = [
  { href: '/admin', label: 'בית', icon: Home },
  { href: '/events', label: 'אירועים', icon: Calendar },
  { href: '/calendar', label: 'לוח שנה', icon: Calendar },
  { href: '/tasks', label: 'משימות', icon: CheckSquare },
  { href: '/finances', label: 'כספים', icon: DollarSign },
  { href: '/issues', label: 'בעיות', icon: AlertCircle },
  { href: '/protocols', label: 'פרוטוקולים', icon: FileText },
  { href: '/vendors', label: 'ספקים', icon: Building2 },
  { href: '/admin/feedback', label: 'משוב מהורים', icon: MessageSquare },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setIsAuthenticated(data.authenticated && data.user?.role === 'admin')
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const handleNavClick = (href: string, label: string) => {
    logger.userAction('Navigate from menu', { to: href, label })
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      window.location.href = '/'
    } catch (error) {
      logger.error('Logout failed', { error })
    }
  }

  const isActive = (href: string) => {
    if (href === '/' || href === '/admin') return pathname === href
    return pathname.startsWith(href)
  }

  const navItems = isAuthenticated ? committeeNavItems : publicNavItems

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <Link
            href={isAuthenticated ? "/admin" : "/"}
            className="flex items-center space-x-2 space-x-reverse"
            onClick={() => handleNavClick(isAuthenticated ? '/admin' : '/', 'בית')}
          >
            <span className="text-lg md:text-xl font-bold">ועד הורים</span>
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

            {/* Login/Logout Button */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                יציאה
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="flex items-center gap-2"
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  כניסת ועד
                </Link>
              </Button>
            )}
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

            {/* Mobile Login/Logout */}
            <div className="pt-2 border-t">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
                >
                  <LogOut className="h-5 w-5" />
                  יציאה
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => handleNavClick('/login', 'כניסת ועד')}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogIn className="h-5 w-5" />
                  כניסת ועד
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}