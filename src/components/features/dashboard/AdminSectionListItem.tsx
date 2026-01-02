'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackNavigation } from '@/lib/analytics'

export interface AdminSectionLink {
  href: string
  label: string
  icon: LucideIcon
}

export interface AdminSection {
  id: string
  title: string
  description: string
  icon: LucideIcon
  color: string // e.g., 'text-blue-600'
  bgColor: string // e.g., 'bg-blue-50'
  links: AdminSectionLink[]
}

interface AdminSectionListItemProps {
  section: AdminSection
  compact?: boolean
}

export function AdminSectionListItem({ section, compact = false }: AdminSectionListItemProps) {
  const Icon = section.icon

  return (
    <>
      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all"
      >
        {/* Icon with colored background */}
        <div className={`${section.bgColor} p-3 rounded-lg shrink-0`}>
          <Icon className={`h-6 w-6 ${section.color}`} />
        </div>

        {/* Title and Description */}
        <div className="flex-1 min-w-0 text-right">
          <h3 className="font-semibold text-base text-foreground mb-0.5 line-clamp-1">
            {section.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {section.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 shrink-0">
          {section.links.map((link, index) => {
            const LinkIcon = link.icon
            const isPrimary = index === 0 // First button is primary action
            return (
              <Button
                key={link.href}
                variant={isPrimary ? "default" : "outline"}
                size="sm"
                asChild
                className="gap-2 min-w-[120px]"
              >
                <Link
                  href={link.href}
                  onClick={() => trackNavigation(link.href, window.location.pathname, 'AdminSectionListItem')}
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Mobile Layout - Vertical */}
      <div className="flex md:hidden flex-col gap-2 p-4 rounded-lg border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all">
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-3 mb-1">
          <div className={`${section.bgColor} p-2 rounded-lg shrink-0`}>
            <Icon className={`h-5 w-5 ${section.color}`} />
          </div>
          <div className="flex-1 text-right">
            <h3 className="font-semibold text-base text-foreground line-clamp-1">
              {section.title}
            </h3>
            {!compact && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {section.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - Clean separated design */}
        <div className="flex flex-col gap-2 pt-1">
          {section.links.map((link, index) => {
            const LinkIcon = link.icon
            const isPrimary = index === 0 // First button is primary action
            return (
              <Button
                key={link.href}
                variant={isPrimary ? "default" : "outline"}
                size="sm"
                asChild
                className="w-full justify-start gap-2 h-9"
              >
                <Link
                  href={link.href}
                  onClick={() => trackNavigation(link.href, window.location.pathname, 'AdminSectionListItem')}
                >
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </>
  )
}
