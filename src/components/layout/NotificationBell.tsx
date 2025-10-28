'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckSquare, Lightbulb, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NotificationCounts {
  total: number
  tasks: number
  ideas: number
  feedback: number
  latestTimestamps: {
    task: string | null
    idea: string | null
    feedback: string | null
  }
}

const STORAGE_KEY = 'admin_notifications_last_viewed'
const POLLING_INTERVAL = 30000 // 30 seconds

export function NotificationBell() {
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    tasks: 0,
    ideas: 0,
    feedback: 0,
    latestTimestamps: { task: null, idea: null, feedback: null }
  })
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Set up polling
    const interval = setInterval(fetchNotifications, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    try {
      // Get last viewed timestamp from localStorage
      const lastViewed = localStorage.getItem(STORAGE_KEY)
      const url = lastViewed
        ? `/api/notifications/counts?lastViewed=${encodeURIComponent(lastViewed)}`
        : '/api/notifications/counts'

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setCounts(data.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open)

    // When opening the popover, mark all current notifications as viewed
    if (open) {
      markAsViewed()
    }
  }

  function markAsViewed() {
    // Store current timestamp as last viewed
    const now = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, now)

    // Reset counts immediately for better UX
    setCounts({
      total: 0,
      tasks: 0,
      ideas: 0,
      feedback: 0,
      latestTimestamps: { task: null, idea: null, feedback: null }
    })
  }

  function handleNavigation() {
    // Close the popover when navigating
    setIsOpen(false)
  }

  const hasNotifications = counts.total > 0

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label="התראות"
        >
          <Bell className={cn(
            "h-4 w-4",
            hasNotifications && "animate-pulse text-primary"
          )} />
          {hasNotifications && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600"
              variant="destructive"
            >
              {counts.total > 9 ? '9+' : counts.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">התראות</h3>
            {hasNotifications && (
              <Badge variant="secondary">{counts.total}</Badge>
            )}
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              טוען...
            </div>
          ) : !hasNotifications ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                אין התראות חדשות
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Tasks Notification */}
              {counts.tasks > 0 && (
                <Link
                  href="/admin/tasks/new"
                  onClick={handleNavigation}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">משימות חדשות</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {counts.tasks}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      יש {counts.tasks} משימות ממתינות
                    </p>
                  </div>
                </Link>
              )}

              {/* Ideas Notification */}
              {counts.ideas > 0 && (
                <Link
                  href="/admin/ideas"
                  onClick={handleNavigation}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">רעיונות חדשים</p>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {counts.ideas}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {counts.ideas} רעיונות ממתינים לבדיקה
                    </p>
                  </div>
                </Link>
              )}

              {/* Feedback Notification */}
              {counts.feedback > 0 && (
                <Link
                  href="/admin/feedback"
                  onClick={handleNavigation}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">משוב חדש</p>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                        {counts.feedback}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {counts.feedback} משובים חדשים מהורים
                    </p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
