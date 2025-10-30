'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

interface TaskCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (comment?: string) => void
  taskTitle: string
}

export function TaskCompletionDialog({
  open,
  onOpenChange,
  onConfirm,
  taskTitle
}: TaskCompletionDialogProps) {
  const [comment, setComment] = useState('')

  const handleConfirm = () => {
    onConfirm(comment.trim() || undefined)
    setComment('') // Reset for next time
    onOpenChange(false)
  }

  const handleCancel = () => {
    setComment('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            סמן משימה כהושלמה
          </DialogTitle>
          <DialogDescription className="text-right">
            {taskTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="completion-comment" className="text-right">
              הערה לסיום (אופציונלי)
            </Label>
            <Textarea
              id="completion-comment"
              placeholder="הוסף הערה על סיום המשימה, תוצאות, או פרטים נוספים..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              ההערה תישמר עם המשימה ותהיה נגישה לכל חברי הוועד
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            ביטול
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 ml-2" />
            סמן כהושלמה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
