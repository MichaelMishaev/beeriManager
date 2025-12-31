'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, X } from 'lucide-react'
import { regulationsContent } from './regulations-content'

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

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden"
          dir="rtl"
        >
          {/* Header with School Branding */}
          <DialogHeader className="relative bg-gradient-to-br from-[#00509d] to-[#003f88] border-t-4 border-[#fdc500] p-8 pb-10 text-white">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute left-4 top-4 rounded-full p-2
                       bg-white/20 hover:bg-white/30
                       transition-colors duration-200
                       focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label="סגור"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* School Badge */}
            <div className="mx-auto w-24 h-24 rounded-full
                          bg-gradient-to-br from-white/20 to-white/10
                          border-4 border-white/30
                          flex flex-col items-center justify-center
                          shadow-lg mb-4">
              <span className="text-white text-2xl font-bold font-formal">
                בית ספר
              </span>
              <span className="text-white text-3xl font-black font-formal">
                בארי
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-center
                         font-formal text-white drop-shadow-md">
              {regulationsContent.title}
            </h1>

            {/* Subtitle */}
            <div className="text-center mt-3 space-y-1">
              <p className="text-xl font-formal text-white/95">
                {regulationsContent.subtitle}
              </p>
              <p className="text-lg font-formal text-[#fdc500]">
                {regulationsContent.academicYear}
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-20 bg-gradient-to-l from-[#fdc500] to-transparent" />
              <div className="w-2 h-2 rotate-45 bg-[#fdc500]" />
              <div className="h-px w-20 bg-gradient-to-r from-[#fdc500] to-transparent" />
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 px-6 md:px-12 py-8">
            <div className="max-w-3xl mx-auto space-y-10">

              {/* Main Sections */}
              {regulationsContent.sections.map((section) => (
                <section key={section.number}>
                  <SectionHeader number={section.number} title={section.title} />

                  <div className="space-y-4">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-base leading-relaxed text-right">
                        {paragraph}
                      </p>
                    ))}

                    {section.subsections && section.subsections.map((subsection, idx) => (
                      <div key={idx} className="mr-6 space-y-2">
                        {subsection.title && (
                          <p className="font-bold text-[#00509d]">{subsection.title}</p>
                        )}
                        {subsection.content.map((content, contentIdx) => (
                          <p key={contentIdx} className="text-base leading-relaxed text-right">
                            {content}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {/* Appendix */}
              <div className="bg-[#fdc500]/5 border-r-4 border-[#fdc500] rounded-lg p-6 md:p-8 mt-12">
                <h2 className="text-3xl font-bold font-formal text-[#00509d] mb-6 text-center">
                  {regulationsContent.appendix.title}
                </h2>

                <div className="space-y-8">
                  {regulationsContent.appendix.sections.map((section) => (
                    <div key={section.number}>
                      <h3 className="text-xl font-bold text-[#00296b] mb-3 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#fdc500] text-white flex items-center justify-center text-sm font-bold">
                          {section.number}
                        </span>
                        {section.title}
                      </h3>
                      <div className="mr-11 space-y-2">
                        {section.content.map((paragraph, idx) => (
                          <p key={idx} className="text-base leading-relaxed text-right">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 mt-12 border-t-2 border-[#fdc500]/30">
                <p className="text-center text-sm text-muted-foreground italic">
                  {regulationsContent.footer}
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Decorative Bottom Border */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#fdc500] to-transparent" />
        </DialogContent>
      </Dialog>
    </>
  )
}

// Section Header Component
function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00509d] to-[#00296b]
                      flex items-center justify-center
                      border-2 border-[#003f88] shadow-md flex-shrink-0">
          <span className="text-white font-black font-formal text-xl">
            {number}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-formal text-[#00509d]">
          {title}
        </h2>
      </div>
      <div className="h-px bg-gradient-to-l from-[#fdc500]/30 to-transparent" />
    </div>
  )
}
