'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      <div className="hidden md:flex items-center gap-4 p-4 rounded-lg hover:bg-muted/30 hover:border-r-4 hover:border-r-current transition-all group"
        style={{
          borderRightColor: 'transparent',
          ['--hover-border-color' as string]: section.color.replace('text-', '')
        }}
      >
        {/* Icon with colored background */}
        <div className={`${section.bgColor} p-3 rounded-full shrink-0`}>
          <Icon className={`h-5 w-5 ${section.color}`} />
        </div>

        {/* Title and Description */}
        <div className="flex-1 min-w-0 text-right">
          <h3 className="font-semibold text-base text-foreground mb-1 line-clamp-1">
            {section.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {section.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 shrink-0">
          {section.links.map((link) => {
            const LinkIcon = link.icon
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                asChild
                className="gap-2"
              >
                <Link href={link.href}>
                  <LinkIcon className="h-4 w-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Mobile Layout - Vertical */}
      <div className="flex md:hidden flex-col gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
        {/* Icon and Title Row */}
        <div className="flex items-center gap-3">
          <div className={`${section.bgColor} p-2.5 rounded-full shrink-0`}>
            <Icon className={`h-5 w-5 ${section.color}`} />
          </div>
          <h3 className="font-semibold text-base text-foreground flex-1 text-right line-clamp-1">
            {section.title}
          </h3>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-muted-foreground text-right line-clamp-2 pr-1">
            {section.description}
          </p>
        )}

        {/* Action Buttons - Stacked on mobile */}
        <div className="flex flex-wrap gap-1.5">
          {section.links.map((link) => {
            const LinkIcon = link.icon
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 text-xs flex-1 min-w-[100px]"
              >
                <Link href={link.href}>
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </>
  )
}
