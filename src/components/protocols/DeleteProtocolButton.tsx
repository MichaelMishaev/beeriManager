'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteProtocolButtonProps {
  protocolId: string
  protocolTitle: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function DeleteProtocolButton({
  protocolId,
  protocolTitle,
  variant = 'destructive',
  size = 'sm',
  className = 'w-full'
}: DeleteProtocolButtonProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      console.log('[DeleteProtocolButton] Auth check:', data)
      setIsAdmin(data.authenticated && data.user?.role === 'admin')
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הפרוטוקול נמחק בהצלחה')
        setShowDialog(false)
        router.push('/he/protocols')
        router.refresh()
      } else {
        toast.error(result.error || 'שגיאה במחיקת הפרוטוקול')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('שגיאה במחיקת הפרוטוקול')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading || !isAdmin) {
    return null
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={isDeleting}
        onClick={() => setShowDialog(true)}
      >
        <Trash2 className="h-4 w-4 ml-2" />
        מחק פרוטוקול
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              פעולה זו תמחק את הפרוטוקול &quot;{protocolTitle}&quot; לצמיתות.
              <br />
              לא ניתן לשחזר פרוטוקול לאחר מחיקה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel onClick={() => setShowDialog(false)}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? 'מוחק...' : 'מחק'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
