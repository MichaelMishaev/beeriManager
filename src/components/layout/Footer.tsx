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
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline font-medium cursor-pointer"
              >
                תקנון הנהגת הורים
              </button>
              <Link
                href="/help"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
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
