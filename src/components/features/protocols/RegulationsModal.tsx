'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { RegulationsModalContent } from './RegulationsModalContent'

export function RegulationsModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setOpen(true)}
        variant="modern"
        size="lg"
        className="gap-2"
      >
        <FileText className="w-5 h-5" />
        <span className="font-formal">צפייה בתקנון</span>
      </Button>

      {/* Modal - NO CUSTOM CLOSE BUTTON (Radix provides it) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden"
          dir="rtl"
        >
          <RegulationsModalContent />
        </DialogContent>
      </Dialog>
    </>
  )
}
