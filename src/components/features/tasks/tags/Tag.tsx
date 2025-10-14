'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Tag as TagType } from '@/types'

interface TagProps {
  tag: TagType
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
  className?: string
}

export function Tag({
  tag,
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  className = ''
}: TagProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  const isClickable = !!onClick

  return (
    <Badge
      variant="outline"
      className={`
        ${sizeClasses[size]}
        ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
        flex items-center gap-1.5 font-medium
      `}
      style={{
        backgroundColor: `${tag.color}15`,
        borderColor: tag.color,
        color: tag.color
      }}
      onClick={onClick}
      title={tag.description || tag.name_he}
    >
      {tag.emoji && <span>{tag.emoji}</span>}
      <span>{tag.name_he}</span>
      {removable && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto w-auto p-0 ml-1 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  )
}
