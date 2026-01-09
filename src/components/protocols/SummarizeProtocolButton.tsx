'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles, Loader2, Check, FileText, Focus, Maximize2, Minimize2 } from 'lucide-react'
import { toast } from 'sonner'

interface SummarizeProtocolButtonProps {
  protocolId: string
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

type SummaryState = 'idle' | 'generating' | 'draft' | 'refining' | 'final'

export function SummarizeProtocolButton({
  protocolId,
  variant = 'outline',
  size = 'sm',
  className = 'w-full'
}: SummarizeProtocolButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<SummaryState>('idle')
  const [summary, setSummary] = useState<string | null>(null)

  const generateSummary = async (refinement?: string, previousSummary?: string) => {
    setState(refinement ? 'refining' : 'generating')

    try {
      const response = await fetch(`/api/protocols/${protocolId}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refinement,
          previousSummary
        })
      })

      const result = await response.json()

      if (result.success) {
        setSummary(result.summary)
        setState(refinement ? 'final' : 'draft')
        if (!isOpen) setIsOpen(true)
      } else {
        toast.error(result.error || 'שגיאה ביצירת סיכום')
        setState('idle')
      }
    } catch (error) {
      console.error('Error summarizing protocol:', error)
      toast.error('שגיאה ביצירת סיכום הפרוטוקול')
      setState('idle')
    }
  }

  const handleInitialSummarize = () => {
    generateSummary()
  }

  const handleRefinement = (refinementType: string) => {
    if (summary) {
      generateSummary(refinementType, summary)
    }
  }

  const handleAccept = () => {
    setState('final')
    toast.success('הסיכום נשמר!')
  }

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
      toast.success('הסיכום הועתק ללוח')
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset after animation completes
    setTimeout(() => {
      setState('idle')
      setSummary(null)
    }, 200)
  }

  const isLoading = state === 'generating' || state === 'refining'
  const isDraft = state === 'draft'
  const isFinal = state === 'final'

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleInitialSummarize}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            {state === 'generating' ? 'יוצר סיכום...' : 'משפר סיכום...'}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 ml-2" />
            סכם פרוטוקול
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {isDraft && 'טיוטת סיכום - מה תרצה לעשות?'}
              {isFinal && 'סיכום הפרוטוקול'}
              {isLoading && (state === 'generating' ? 'יוצר סיכום...' : 'משפר סיכום...')}
            </DialogTitle>
            <DialogDescription>
              {isDraft && 'בדוק את הטיוטה ובחר אם להשתמש בה או לשפר'}
              {isFinal && 'סיכום אוטומטי שנוצר על ידי AI'}
              {isLoading && 'המתן בזמן שה-AI מנתח את הפרוטוקול...'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {summary ? (
              <div className="prose prose-sm max-w-none text-right" dir="rtl">
                <div className="whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-lg border">
                  {summary}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {state === 'generating' && 'מנתח את הפרוטוקול ויוצר סיכום מפורט...'}
                  {state === 'refining' && 'משפר את הסיכום לפי בקשתך...'}
                </p>
              </div>
            )}
          </div>

          {/* Draft Actions */}
          {isDraft && summary && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-center">מה תרצה לעשות עם הסיכום?</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleAccept}
                  className="w-full"
                  variant="default"
                >
                  <Check className="h-4 w-4 ml-2" />
                  שמור סיכום זה
                </Button>
                <Button
                  onClick={() => handleRefinement('longer')}
                  className="w-full"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Maximize2 className="h-4 w-4 ml-2" />
                  ארוך יותר
                </Button>
                <Button
                  onClick={() => handleRefinement('shorter')}
                  className="w-full"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Minimize2 className="h-4 w-4 ml-2" />
                  קצר יותר
                </Button>
                <Button
                  onClick={() => handleRefinement('focus_decisions')}
                  className="w-full"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Focus className="h-4 w-4 ml-2" />
                  התמקד בהחלטות
                </Button>
              </div>
            </div>
          )}

          {/* Final Actions */}
          {(isFinal || state === 'refining') && (
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                סגור
              </Button>
              <Button onClick={handleCopy} disabled={!summary}>
                <FileText className="h-4 w-4 ml-2" />
                העתק סיכום
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
