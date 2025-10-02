import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-primary mb-4">404</CardTitle>
          <CardTitle className="text-xl">העמוד לא נמצא</CardTitle>
          <CardDescription className="text-center">
            מצטערים, הדף שחיפשת לא קיים או הועבר למקום אחר
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              אולי תרצה לבקר באחד מהמקומות הבאים:
            </p>

            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href="/">
                  <Home className="h-4 w-4 ml-2" />
                  דף הבית
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href="/events">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  אירועים
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href="/tasks">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  משימות
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href="/feedback">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  משוב אנונימי
                </Link>
              </Button>
            </div>

            <div className="pt-4">
              <Button asChild className="w-full" size="sm">
                <Link href="/">
                  <Home className="h-4 w-4 ml-2" />
                  חזור לדף הבית
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}