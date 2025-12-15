'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'

interface DeleteVendorButtonProps {
  vendorId: string
  vendorName: string
}

export function DeleteVendorButton({ vendorId, vendorName }: DeleteVendorButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      console.log('🗑️ Attempting to delete vendor:', vendorId)

      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Delete response:', response.status, data)

      if (!response.ok) {
        console.error('Delete failed:', data)
        throw new Error(data.error || 'Failed to delete vendor')
      }

      if (!data.success) {
        console.error('Delete unsuccessful:', data)
        throw new Error(data.error || 'Delete was not successful')
      }

      console.log('✅ Vendor deleted successfully')
      toast.success('הספק נמחק בהצלחה')
      setIsOpen(false)

      // Add a small delay before redirect to ensure the delete is committed
      setTimeout(() => {
        router.push('/vendors')
        router.refresh()
      }, 500)
    } catch (error) {
      console.error('❌ Error deleting vendor:', error)
      toast.error(error instanceof Error ? error.message : 'שגיאה במחיקת הספק')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 ml-2" />
        {isDeleting ? 'מוחק...' : 'מחק ספק'}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הספק &quot;{vendorName}&quot; לצמיתות.
              <br />
              <strong className="text-destructive">לא ניתן לשחזר את המידע לאחר המחיקה!</strong>
              <br />
              <br />
              כל העסקאות והביקורות הקשורות לספק זה יימחקו גם כן.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsOpen(false)} disabled={isDeleting}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? 'מוחק...' : 'מחק לצמיתות'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
