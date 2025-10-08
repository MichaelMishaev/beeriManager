'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X, Home, Users, HelpCircle, LogOut, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { InstallButton } from '@/components/pwa/InstallButton'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

// Navigation items - simplified menu
function useNavItems() {
  const t = useTranslations('navigation')

  return {
    committee: [
      { href: '/admin', label: t('adminHome'), icon: Home },
      { href: '/', label: t('parentsHome'), icon: Users },
      { href: '/help', label: t('help'), icon: HelpCircle },
    ]
  }
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('common')
  const tAuth = useTranslations('auth')
  const navItems = useNavItems()

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

  const items = isAuthenticated ? navItems.committee : []

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title, Language Switcher & Install Button */}
          <div className="flex items-center gap-3">
            <Link
              href={isAuthenticated ? "/admin" : "/"}
              className="flex items-center space-x-2 space-x-reverse"
              onClick={() => handleNavClick(isAuthenticated ? '/admin' : '/', 'בית')}
            >
              <span className="text-lg md:text-xl font-bold">ועד הורים</span>
            </Link>
            {/* Language Switcher & PWA Install - Always visible */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <InstallButton variant="compact" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {items.map((item) => {
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
                {tAuth('logout')}
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
                  {t('committeeLogin')}
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
          <div className="md:hidden py-4 space-y-2">
            {isAuthenticated ? (
              <>
                {items.map((item) => {
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

                {/* Install PWA Button - Prominent */}
                <div className="px-4 py-2">
                  <InstallButton variant="full" />
                </div>

                {/* Logout */}
                <div className="pt-2 border-t">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    {tAuth('logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Install PWA Button - Prominent */}
                <div className="px-4 py-2">
                  <InstallButton variant="full" />
                </div>

                {/* Login Button */}
                <Link
                  href="/login"
                  onClick={() => handleNavClick('/login', t('committeeLogin'))}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogIn className="h-5 w-5" />
                  {t('committeeLogin')}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}