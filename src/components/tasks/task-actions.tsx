'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckSquare, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface TaskActionsProps {
  taskId: string
  taskTitle: string
  isCompleted: boolean
}

export function TaskActions({ taskId, taskTitle, isCompleted }: TaskActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      // First get the current task data
      const getResponse = await fetch(`/api/tasks/${taskId}`)
      const getData = await getResponse.json()

      if (!getData.success) {
        throw new Error('לא ניתן לטעון את נתוני המשימה')
      }

      const currentTask = getData.data

      // Update with completed status
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentTask,
          status: 'completed',
          completed_at: new Date().toISOString()
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'שגיאה בסימון המשימה כהושלמה')
      }

      toast({
        title: 'המשימה הושלמה',
        description: 'המשימה סומנה כהושלמה בהצלחה',
      })

      router.refresh()
    } catch (error) {
      console.error('Error completing task:', error)
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה בסימון המשימה כהושלמה',
        variant: 'destructive',
      })
    } finally {
      setIsCompleting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setShowDeleteDialog(false)

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'שגיאה במחיקת המשימה')
      }

      toast({
        title: 'המשימה נמחקה',
        description: 'המשימה נמחקה בהצלחה',
      })

      router.push('/tasks')
      router.refresh()
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה במחיקת המשימה',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/tasks/${taskId}/edit`}>
            <Edit className="h-4 w-4 ml-2" />
            עריכה
          </Link>
        </Button>

        {!isCompleted && (
          <Button
            variant="default"
            size="sm"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            <CheckSquare className="h-4 w-4 ml-2" />
            {isCompleting ? 'מסמן...' : 'סמן כהושלם'}
          </Button>
        )}

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
              <AlertDialogTitle>מחיקת משימה</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את המשימה <strong>"{taskTitle}"</strong>?
              <br />
              <br />
              פעולה זו תסמן את המשימה כמבוטלת ולא ניתן יהיה לשחזר אותה.
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
                  מחק משימה
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
