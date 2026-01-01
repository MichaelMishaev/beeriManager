'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RegulationsModalContent } from '@/components/features/protocols/RegulationsModalContent'

export function Footer() {
  const [regulationsOpen, setRegulationsOpen] = useState(false)

  return (
    <>
      <footer className="border-t bg-muted/30 mt-auto pb-24 md:pb-0" role="contentinfo">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">

            {/* Right Side - Utility Links (RTL: appears on right) */}
            <nav className="flex gap-6 order-2 md:order-1" aria-label="קישורי עזר">
              <button
                onClick={() => setRegulationsOpen(true)}
                className="text-primary hover:text-primary-600
                         underline underline-offset-4 decoration-primary/40
                         hover:decoration-primary transition-all duration-200
                         font-medium cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                aria-label="פתיחת תקנון הנהגת הורים"
              >
                תקנון הנהגת הורים
              </button>
              <Link
                href="/help"
                className="text-primary hover:text-primary-600
                         underline underline-offset-4 decoration-primary/40
                         hover:decoration-primary transition-all duration-200
                         font-medium
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              >
                עזרה
              </Link>
            </nav>

            {/* Left Side - Copyright (RTL: appears on left) */}
            <p className="text-center md:text-right order-1 md:order-2">
              © {new Date().getFullYear()} בית ספר בארי, נתניה
            </p>
          </div>
        </div>
      </footer>

      {/* Compact Modal - NO CUSTOM CLOSE BUTTON (Radix provides it) */}
      <Dialog open={regulationsOpen} onOpenChange={setRegulationsOpen}>
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
