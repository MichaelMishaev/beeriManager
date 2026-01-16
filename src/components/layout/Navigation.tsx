'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X, Home, Users, HelpCircle, LogOut, LogIn, Phone, MessageCircle, ClipboardList, Plus, ListChecks, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { InstallButton } from '@/components/pwa/InstallButton'
import { ContactsDialog } from '@/components/features/contacts/ContactsDialog'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { NotificationSubscription } from '@/components/pwa/NotificationSubscription'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { trackNavigation, trackEvent, EventCategory, EventAction, UserType } from '@/lib/analytics'

// Navigation items - simplified menu
function useNavItems() {
  const t = useTranslations('navigation')

  return {
    committee: [
      { href: '/admin', label: t('adminHome'), icon: Home },
      { href: '/', label: t('parentsHome'), icon: Users },
      { href: '/groups/explanation', label: t('groups'), icon: MessageCircle },
      { href: '/help', label: t('help'), icon: HelpCircle },
    ]
  }
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [settings, setSettings] = useState<{ committee_name?: string; school_name?: string } | null>(null)
  const pathname = usePathname()
  const t = useTranslations('common')
  const tAuth = useTranslations('auth')
  const tNav = useTranslations('navigation')
  const navItems = useNavItems()

  useEffect(() => {
    checkAuth()
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success && data.data) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

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
    trackNavigation(href, pathname, 'Navigation')
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      trackEvent({
        category: EventCategory.AUTH,
        action: EventAction.LOGOUT,
        label: 'Logout from navigation',
        userType: UserType.USER,
        componentName: 'Navigation',
        metadata: { from: pathname },
      })
      window.location.href = '/'
    } catch (error) {
      logger.error('Logout failed', { error })
      trackEvent({
        category: EventCategory.AUTH,
        action: EventAction.LOGOUT,
        label: 'Logout failed',
        userType: UserType.USER,
        componentName: 'Navigation',
        metadata: { from: pathname, error: error instanceof Error ? error.message : 'unknown_error' },
      })
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
              className="flex items-center gap-3 min-w-0 flex-shrink"
              onClick={() => handleNavClick(isAuthenticated ? '/admin' : '/', 'בית')}
            >
              {/* Logo Image */}
              <div className="relative flex-shrink-0">
                <Image
                  src="/logo-small.png"
                  alt="לוגו בארי נתניה"
                  width={80}
                  height={32}
                  className="h-8 w-auto md:h-10 md:w-auto"
                  priority
                />
              </div>
              {/* Title - Hidden on mobile to save space */}
              <div className="hidden sm:flex flex-col items-start min-w-0">
                <span className="text-base md:text-lg font-bold">
                  {settings?.school_name ? `${settings.school_name}` : 'בארי נתניה'}
                </span>
                <span className="text-[8px] md:text-[10px] text-muted-foreground leading-tight truncate max-w-[140px] md:max-w-[200px]">
                  {settings?.committee_name && settings?.school_name
                    ? `${settings.committee_name}`
                    : 'הנהגה הורית'}
                </span>
              </div>
            </Link>
            {/* Desktop: Language Switcher & PWA Install */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher variant="full" />
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

            {/* Grocery Lists menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-sm border-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>{tNav('groceryLists')}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link
                    href="/grocery"
                    onClick={() => handleNavClick('/grocery', tNav('groceryList'))}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>{tNav('createNewList')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-grocery"
                    onClick={() => handleNavClick('/my-grocery', tNav('myGrocery'))}
                    className="flex items-center gap-2"
                  >
                    <ListChecks className="h-4 w-4 text-blue-600" />
                    <span>{tNav('myLists')}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications: Show bell with counts for admins, subscription button for public */}
            {isAuthenticated && pathname.includes('/admin') ? (
              <NotificationBell />
            ) : (
              <NotificationSubscription />
            )}

            {/* Contacts Button */}
            <ContactsDialog>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                <span className="hidden lg:inline">אנשי קשר</span>
              </Button>
            </ContactsDialog>

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

          {/* Mobile - Quick Actions & Menu Button */}
          <div className="flex items-center gap-0.5 md:hidden">
            {/* Grocery Lists Dropdown - Single Entry Point */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 px-2 h-9 border-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  aria-label={tNav('groceryLists')}
                >
                  <ClipboardList className="h-5 w-5" />
                  <span className="text-xs font-medium">{tNav('lists')}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    href="/grocery"
                    onClick={() => handleNavClick('/grocery', tNav('groceryList'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>{tNav('createNewList')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-grocery"
                    onClick={() => handleNavClick('/my-grocery', tNav('myGrocery'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ListChecks className="h-4 w-4 text-blue-600" />
                    <span>{tNav('myLists')}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Compact Language Switcher */}
            <LanguageSwitcher variant="compact" />

            {/* Notifications: Show bell with counts for admins, subscription button for public */}
            {isAuthenticated && pathname.includes('/admin') ? (
              <NotificationBell />
            ) : (
              <NotificationSubscription />
            )}

            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(!isOpen)
                logger.userAction('Toggle mobile menu', { isOpen: !isOpen })
              }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3">
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

            {/* Contacts Button (moved into menu) */}
            <div className="px-4 pt-1">
              <ContactsDialog>
                <Button
                  variant="ghost"
                  className="flex w-full items-center gap-3 text-base font-medium"
                >
                  <Phone className="h-5 w-5" />
                  <span className="flex-1 text-left">{t('contactsLabel')}</span>
                </Button>
              </ContactsDialog>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}