'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import { Phone, X } from 'lucide-react'
import { getMembersByGradeLevel } from '@/lib/data/committee-members'

const groupedMembers = getMembersByGradeLevel()
const gradeLevels = Object.keys(groupedMembers)
const STORAGE_KEY = 'committeeCorner.lastGrade'

function readStoredGrade(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value && gradeLevels.includes(value) ? value : null
  } catch {
    return null // storage blocked (private mode etc.): just start without a preselected grade
  }
}

function storeGrade(grade: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, grade)
  } catch {
    // non-essential convenience; ignore when storage is unavailable
  }
}

export function ClassRepsSheet({ dir }: { dir: 'rtl' | 'ltr' }) {
  const t = useTranslations('committeeCorner')
  const [open, setOpen] = useState(false)
  const [grade, setGrade] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (next) setGrade(readStoredGrade())
    setOpen(next)
  }

  const selectGrade = (value: string) => {
    setGrade(value)
    storeGrade(value)
  }

  const members = grade ? groupedMembers[grade] ?? [] : []

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <div className="sticky bottom-0 z-30 border-t border-[#D9E6EC] bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-6px_18px_rgba(0,49,83,0.08)]">
        <div className="mx-auto max-w-3xl">
          <DialogPrimitive.Trigger
            className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#FFBA00] text-base font-extrabold text-[#003153] transition-colors hover:bg-[#F0AE00] active:bg-[#E0A300] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003153] focus-visible:ring-offset-2"
            aria-haspopup="dialog"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            {t('myRepCta')}
          </DialogPrimitive.Trigger>
        </div>
      </div>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#001E32]/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir={dir}
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] w-full max-w-lg flex-col gap-3 rounded-t-3xl bg-white px-4 pt-2.5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-[#003153] shadow-[0_-8px_30px_rgba(0,0,0,0.25)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom motion-reduce:animate-none"
        >
          <div className="h-1.5 w-10 shrink-0 self-center rounded-full bg-[#C9D6DD]" aria-hidden="true" />

          <div className="flex items-center justify-between gap-3">
            <DialogPrimitive.Title className="text-lg font-extrabold">{t('sheet.title')}</DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1F5F8] hover:bg-[#E3EBF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
              aria-label={t('sheet.close')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">{t('sheet.description')}</DialogPrimitive.Description>

          <div className="flex flex-col gap-2">
            <p id="class-reps-grade-label" className="text-xs font-bold text-[#506B7A]">{t('sheet.chooseGrade')}</p>
            <div className="grid grid-cols-6 gap-2" role="group" aria-labelledby="class-reps-grade-label">
              {gradeLevels.map((level) => {
                const selected = level === grade
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => selectGrade(level)}
                    aria-pressed={selected}
                    aria-label={t('sheet.gradeOption', { grade: level })}
                    className={`h-11 rounded-xl text-base font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA] focus-visible:ring-offset-1 ${
                      selected ? 'bg-[#003153] text-white' : 'bg-[#F1F5F8] text-[#003153] hover:bg-[#E3EBF0]'
                    }`}
                  >
                    {level}׳
                  </button>
                )
              })}
            </div>
          </div>

          {grade ? (
            <div className="flex min-h-0 flex-col gap-2.5">
              <p className="text-xs font-bold text-[#506B7A]" aria-live="polite">
                {t('sheet.gradeSummary', { grade, count: members.length })}
              </p>
              <ul className="flex flex-col gap-2.5 overflow-y-auto overscroll-contain pb-1" data-testid="class-reps-list">
                {members.map((member) => (
                  <li
                    key={member.grade}
                    className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-[#D9E6EC] px-3.5 py-2.5"
                  >
                    <span dir="rtl" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E6F6FB] font-extrabold text-[#0B6F8A]">
                      {member.grade}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span dir="auto" className="self-start text-[15px] font-extrabold">{member.name}</span>
                      {member.phone ? (
                        <span dir="ltr" className="self-start text-xs text-[#506B7A]">
                          {member.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-[#506B7A]">{t('sheet.noPhone')}</span>
                      )}
                    </span>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/[^\d+]/g, '')}`}
                        aria-label={t('sheet.call', { name: member.name, grade: member.grade })}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B7F9C] text-white hover:bg-[#096C85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003153] focus-visible:ring-offset-2"
                      >
                        <Phone className="h-5 w-5" aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-[#506B7A]">{t('sheet.pickPrompt')}</p>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
