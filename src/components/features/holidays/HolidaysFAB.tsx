'use client'

import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HolidaysModal } from './HolidaysModal'

export function HolidaysFAB() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-20 left-4 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 print:hidden"
        size="icon"
        style={{
          background: 'linear-gradient(135deg, #FFBA00, #FF8200)',
        }}
        title="לוח חגים"
      >
        <Calendar className="h-6 w-6" />
      </Button>

      <HolidaysModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
