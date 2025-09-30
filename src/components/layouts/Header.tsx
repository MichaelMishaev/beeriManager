'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  isAdmin?: boolean
  onLogout?: () => void
  className?: string
}

export function Header({ isAdmin = false, onLogout, className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogin = () => {
    router.push('/login')
  }

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        })

        if (response.ok) {
          router.push('/')
          router.refresh()
        }
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-white border-b border-gray-200",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ב</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">BeeriManager</h1>
              <p className="text-sm text-gray-500 -mt-1">ועד הורים</p>
            </div>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="sr-only">התראות</span>
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/settings">
                    <Settings className="w-4 h-4 ml-2" />
                    הגדרות
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 ml-2" />
                  התנתק
                </Button>
              </>
            )}

            {!isAdmin && (
              <Button variant="outline" size="sm" onClick={handleLogin}>
                <User className="w-4 h-4 ml-2" />
                כניסת מנהל
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {isAdmin ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    asChild
                    size="sm" onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/admin/settings">
                      <Settings className="w-4 h-4" />
                      הגדרות
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700"
                    size="sm" onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    התנתק
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  size="sm" onClick={() => {
                    handleLogin()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <User className="w-4 h-4" />
                  כניסת מנהל
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}