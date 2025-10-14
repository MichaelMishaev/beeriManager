'use client'

import { useState } from 'react'
import { Tags, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Tag, Task } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface QuickTagEditorProps {
  task: Task
  availableTags: Tag[]
  onTagsUpdated?: (updatedTask: Task) => void
}

export function QuickTagEditor({ task, availableTags, onTagsUpdated }: QuickTagEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const taskTagIds = task.tags?.map(t => t.id) || []

  const handleToggleTag = async (tag: Tag) => {
    setIsLoading(true)
    try {
      const isCurrentlySelected = taskTagIds.includes(tag.id)

      if (isCurrentlySelected) {
        // Remove tag
        const response = await fetch(`/api/tasks/${task.id}/tags`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_id: tag.id })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Remove tag error:', errorData)
          throw new Error(errorData.error || 'Failed to remove tag')
        }

        await response.json()

        toast({
          title: 'תגית הוסרה',
          description: `התגית "${tag.name_he}" הוסרה מהמשימה`,
        })

        // Update local state
        if (onTagsUpdated) {
          onTagsUpdated({
            ...task,
            tags: task.tags?.filter(t => t.id !== tag.id)
          })
        }
      } else {
        // Add tag
        const response = await fetch(`/api/tasks/${task.id}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_ids: [tag.id] })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Add tag error:', errorData)
          throw new Error(errorData.error || 'Failed to add tag')
        }

        await response.json()

        toast({
          title: 'תגית נוספה',
          description: `התגית "${tag.name_he}" נוספה למשימה`,
        })

        // Update local state
        if (onTagsUpdated) {
          onTagsUpdated({
            ...task,
            tags: [...(task.tags || []), tag]
          })
        }
      }
    } catch (error) {
      console.error('Error toggling tag:', error)
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את התגית',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="h-8"
        >
          <Tags className="h-3 w-3 ml-1" />
          תגיות
          {taskTagIds.length > 0 && (
            <Badge variant="secondary" className="mr-1 text-xs">
              {taskTagIds.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>נהל תגיות למשימה</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Current Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground mb-2">תגיות נוכחיות:</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                  className="text-xs cursor-pointer hover:opacity-75"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag.emoji && <span className="ml-1">{tag.emoji}</span>}
                  {tag.name_he}
                  <X className="h-2 w-2 mr-1" />
                </Badge>
              ))}
            </div>
            <DropdownMenuSeparator />
          </div>
        )}

        {/* Available Tags */}
        <div className="max-h-64 overflow-y-auto">
          {availableTags.map((tag) => {
            const isSelected = taskTagIds.includes(tag.id)
            return (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={isSelected}
                onCheckedChange={() => handleToggleTag(tag)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  {tag.emoji && <span>{tag.emoji}</span>}
                  <span>{tag.name_he}</span>
                </div>
              </DropdownMenuCheckboxItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
