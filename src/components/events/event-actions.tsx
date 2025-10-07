'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import Link from 'next/link'

interface EventActionsProps {
  eventId: string
  eventTitle: string
}

export function EventActions({ eventId, eventTitle }: EventActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    setShowDeleteDialog(false)

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('האירוע נמחק בהצלחה')
        router.push('/events')
        router.refresh()
      } else {
        toast.error(result.error || 'שגיאה במחיקת האירוע')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('שגיאה במחיקת האירוע')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/events/${eventId}/edit`}>
            <Edit className="h-4 w-4 ml-2" />
            ערוך
          </Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              מוחק...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 ml-2" />
              מחק
            </>
          )}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle>מחיקת אירוע</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את האירוע <strong>"{eventTitle}"</strong>?
              <br />
              <br />
              פעולה זו תסמן את האירוע כמבוטל ולא ניתן יהיה לשחזר אותו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  מוחק...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  מחק אירוע
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
