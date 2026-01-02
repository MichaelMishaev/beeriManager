'use client'

import { useState, useEffect } from 'react'
import { LucideIcon } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { AdminSection, AdminSectionListItem } from './AdminSectionListItem'

interface AdminSectionGroupProps {
  id: string
  title: string
  icon: LucideIcon
  sections: AdminSection[]
  defaultOpen?: boolean
}

export function AdminSectionGroup({
  id,
  title,
  icon: Icon,
  sections,
  defaultOpen = false,
}: AdminSectionGroupProps) {
  const [value, setValue] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize collapsed state from localStorage or default
  useEffect(() => {
    const storageKey = 'admin-section-groups-collapsed'

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const collapsedGroups = JSON.parse(stored) as string[]

        // On mobile, all groups start collapsed
        if (isMobile) {
          setValue([])
        } else {
          // On desktop, expand if not in collapsed list and defaultOpen is true
          if (!collapsedGroups.includes(id) && defaultOpen) {
            setValue([id])
          } else if (collapsedGroups.includes(id)) {
            setValue([])
          } else if (defaultOpen) {
            setValue([id])
          }
        }
      } else {
        // No stored state - use default
        if (isMobile) {
          setValue([])
        } else if (defaultOpen) {
          setValue([id])
        }
      }
    } catch (e) {
      // Fallback on error
      if (!isMobile && defaultOpen) {
        setValue([id])
      }
    }
  }, [id, defaultOpen, isMobile])

  // Save collapsed state to localStorage
  const handleValueChange = (newValue: string[]) => {
    setValue(newValue)

    const storageKey = 'admin-section-groups-collapsed'

    try {
      const stored = localStorage.getItem(storageKey)
      let collapsedGroups: string[] = stored ? JSON.parse(stored) : []

      if (newValue.includes(id)) {
        // Group is expanded - remove from collapsed list
        collapsedGroups = collapsedGroups.filter(g => g !== id)
      } else {
        // Group is collapsed - add to collapsed list
        if (!collapsedGroups.includes(id)) {
          collapsedGroups.push(id)
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(collapsedGroups))
    } catch (e) {
      console.error('Failed to save group state:', e)
    }
  }

  return (
    <Card className="overflow-hidden">
      <Accordion
        type="multiple"
        value={value}
        onValueChange={handleValueChange}
        className="w-full"
      >
        <AccordionItem value={id} className="border-0">
          <AccordionTrigger className="px-4 py-4 hover:bg-muted/50 hover:no-underline transition-colors">
            <div className="flex items-center gap-3 text-right flex-1">
              <Icon className="h-5 w-5 text-primary shrink-0" />
              <span className="font-semibold text-lg">{title}</span>
              <span className="text-sm text-muted-foreground mr-auto">
                ({sections.length})
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-2">
            <div className="space-y-1 px-2">
              {sections.map((section) => (
                <AdminSectionListItem key={section.id} section={section} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
