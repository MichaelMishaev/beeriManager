'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">אופס! משהו השתבש</CardTitle>
          <CardDescription className="text-center">
            אירעה שגיאה לא צפויה במערכת. אנא נסה שנית או חזור לדף הבית.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">פרטי שגיאה (מצב פיתוח):</h4>
              <code className="text-xs text-muted-foreground break-all">
                {error.message}
              </code>
              {error.digest && (
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">
                    מזהה שגיאה: {error.digest}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button size="sm" onClick={reset} className="w-full">
              <RefreshCw className="h-4 w-4 ml-2" />
              נסה שנית
            </Button>

            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 ml-2" />
                חזור לדף הבית
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              אם הבעיה נמשכת, אנא פנה למנהל המערכת
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}