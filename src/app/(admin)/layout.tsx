'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.authenticated && data.role === 'admin') {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        toast.error('נדרשת הרשאת מנהל לגישה לעמוד זה')
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      router.push('/login')
    }
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">בודק הרשאות...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">אזור מנהלים</h2>
          <p className="text-muted-foreground">נדרשת הרשאת מנהל לגישה לעמוד זה</p>
        </div>
      </div>
    )
  }

  // Authenticated - show admin content with indicator
  return (
    <div className="min-h-screen">
      {/* Admin indicator banner */}
      <div className="bg-primary text-white py-2 px-4 text-center text-sm">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          <span>מצב ניהול - יש לך הרשאות עריכה מלאות</span>
        </div>
      </div>

      {/* Admin content */}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
}