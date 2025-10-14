'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tag } from './Tag'
import type { Tag as TagType } from '@/types'

interface TagSelectorProps {
  availableTags: TagType[]
  selectedTags: TagType[]
  onTagsChange: (tags: TagType[]) => void
  onCreateTag?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  placeholder = 'בחר תגיות...',
  className = '',
  disabled = false
}: TagSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter tags based on search
  const filteredTags = availableTags.filter(tag =>
    tag.name_he.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check if a tag is selected
  const isSelected = (tagId: string) => {
    return selectedTags.some(t => t.id === tagId)
  }

  // Toggle tag selection
  const toggleTag = (tag: TagType) => {
    if (isSelected(tag.id)) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t.id !== tag.id))
    } else {
      // Add tag
      onTagsChange([...selectedTags, tag])
    }
  }

  // Remove a specific tag
  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId))
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Tag
              key={tag.id}
              tag={tag}
              size="sm"
              removable
              onRemove={() => removeTag(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Dropdown selector */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-right"
            disabled={disabled}
          >
            <span className="text-muted-foreground">
              {selectedTags.length > 0
                ? `${selectedTags.length} תגיות נבחרו`
                : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[300px] max-h-[400px] overflow-y-auto"
          align="end"
        >
          {/* Search input */}
          <div className="p-2 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש תגיות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 text-right"
              />
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Tag list */}
          {filteredTags.length > 0 ? (
            <>
              <DropdownMenuLabel className="text-right">
                תגיות זמינות ({filteredTags.length})
              </DropdownMenuLabel>
              {filteredTags.map((tag) => {
                const selected = isSelected(tag.id)
                return (
                  <DropdownMenuItem
                    key={tag.id}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleTag(tag)
                    }}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {tag.emoji && <span>{tag.emoji}</span>}
                      <span>{tag.name_he}</span>
                      <span className="text-xs text-muted-foreground">
                        ({tag.task_count})
                      </span>
                    </div>
                    {selected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              לא נמצאו תגיות
            </div>
          )}

          {/* Create new tag button */}
          {onCreateTag && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false)
                  onCreateTag()
                }}
                className="flex items-center gap-2 text-primary cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>צור תגית חדשה</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
