'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckSquare, Edit, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

      setShowDeleteDialog(false)
      router.push('/tasks')
      router.refresh()
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: 'שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה במחיקת המשימה',
        variant: 'destructive',
      })
      setIsDeleting(false)
    }
  }

  return (
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            מחק
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>האם למחוק את המשימה?</DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את המשימה "{taskTitle}". לא ניתן לשחזר משימה שנמחקה.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'מוחק...' : 'מחק'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
