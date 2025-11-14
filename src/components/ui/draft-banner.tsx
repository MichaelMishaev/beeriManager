import { AlertCircle, Undo2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

interface DraftBannerProps {
  timestamp: string
  onRestore: () => void
  onDiscard: () => void
  onDismiss?: () => void
}

export function DraftBanner({ timestamp, onRestore, onDiscard, onDismiss }: DraftBannerProps) {
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: he })
      return timeAgo
    } catch (error) {
      return 'לאחרונה'
    }
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 relative">
      <AlertCircle className="h-5 w-5 text-blue-600" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            קיימת טיוטה שמורה מ{formatTimestamp(timestamp)}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            לשחזר את הטיוטה או למחוק אותה?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={onRestore}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Undo2 className="h-4 w-4" />
            שחזר טיוטה
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onDiscard}
            className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            מחק טיוטה
          </Button>
          {onDismiss && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

interface DraftSaveIndicatorProps {
  lastSaved: Date | null
  isSaving: boolean
}

export function DraftSaveIndicator({ lastSaved, isSaving }: DraftSaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full" />
        <span>שומר טיוטה...</span>
      </div>
    )
  }

  if (lastSaved) {
    const timeAgo = formatDistanceToNow(lastSaved, { addSuffix: true, locale: he })
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-2 w-2 bg-green-500 rounded-full" />
        <span>הטיוטה נשמרה {timeAgo}</span>
      </div>
    )
  }

  return null
}
