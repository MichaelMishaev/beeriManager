'use client'

import { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { ClipboardList, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Task type
type Task = {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  owner_name: string
  due_date?: string | null
}

interface TaskMentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  id?: string
  name?: string
}

/**
 * TaskMentionTextarea - A textarea with @ mention support for linking tasks
 *
 * Features:
 * - Type @ to trigger task suggestions
 * - Arrow keys to navigate suggestions
 * - Enter to select a task
 * - ESC to close suggestions
 * - Shows linked tasks as badges below textarea
 */
export default function TaskMentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  id,
  name
}: TaskMentionTextareaProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks()
  }, [])

  // Extract linked task IDs from text
  useEffect(() => {
    const taskIdPattern = /\[task:([^\]]+)\]/g
    const matches = Array.from(value.matchAll(taskIdPattern))
    const ids = matches.map(m => m[1])
    setLinkedTaskIds(ids)
  }, [value])

  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks?limit=100')
      const result = await response.json()
      if (result.success) {
        setTasks(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  // Handle text changes
  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value
    const newCursorPos = e.target.selectionStart
    onChange(newValue)
    setCursorPosition(newCursorPos)

    // Check if @ was just typed
    const textBeforeCursor = newValue.substring(0, newCursorPos)
    const lastAtSign = textBeforeCursor.lastIndexOf('@')

    if (lastAtSign !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSign + 1)
      // Show suggestions if @ is at the end or followed by partial text
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setShowSuggestions(true)
        setSelectedIndex(0)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle keyboard navigation
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!showSuggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % tasks.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + tasks.length) % tasks.length)
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      insertTaskMention(tasks[selectedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowSuggestions(false)
    }
  }

  // Insert task mention into text
  function insertTaskMention(task: Task) {
    if (!textareaRef.current) return

    const textBeforeCursor = value.substring(0, cursorPosition)
    const textAfterCursor = value.substring(cursorPosition)
    const lastAtSign = textBeforeCursor.lastIndexOf('@')

    // Replace @text with task mention
    const mention = `@${task.title}[task:${task.id}] `
    const newText =
      textBeforeCursor.substring(0, lastAtSign) +
      mention +
      textAfterCursor

    onChange(newText)
    setShowSuggestions(false)

    // Set cursor after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtSign + mention.length
        textareaRef.current.selectionStart = newCursorPos
        textareaRef.current.selectionEnd = newCursorPos
        textareaRef.current.focus()
      }
    }, 0)
  }

  // Remove task mention from text
  function removeTaskLink(taskId: string) {
    // Find and remove all mentions of this task
    const pattern = new RegExp(`@[^\\[]+\\[task:${taskId}\\]\\s*`, 'g')
    const newText = value.replace(pattern, '')
    onChange(newText)
  }

  // Get linked tasks data
  const linkedTasks = tasks.filter(t => linkedTaskIds.includes(t.id))

  return (
    <div className="relative space-y-2">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
        💡 <strong>טיפ:</strong> הקלד @ כדי להזכיר משימה ולקשר אותה לפרוטוקול
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={cn("font-sans", className)}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && tasks.length > 0 && (
          <div
            ref={suggestionRef}
            className="absolute z-50 mt-1 w-full bg-white border-2 border-primary rounded-lg shadow-xl max-h-60 overflow-y-auto"
          >
            <div className="p-2 bg-primary/10 border-b text-xs font-semibold text-primary">
              <ClipboardList className="h-3 w-3 inline ml-1" />
              בחר משימה (↑↓ לניווט, Enter לבחירה)
            </div>
            {tasks.slice(0, 10).map((task, index) => (
              <button
                key={task.id}
                type="button"
                onClick={() => insertTaskMention(task)}
                className={cn(
                  "w-full text-right px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3 border-b last:border-b-0",
                  index === selectedIndex && "bg-accent"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {task.status === 'completed' && (
                    <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {task.status === 'in_progress' && (
                    <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
                  )}
                  {task.status === 'pending' && (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
                  )}
                  {task.status === 'cancelled' && (
                    <div className="h-4 w-4 rounded-full bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>👤 {task.owner_name}</span>
                    {task.due_date && (
                      <span>📅 {new Date(task.due_date).toLocaleDateString('he-IL')}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Linked Tasks Display */}
      {linkedTasks.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            משימות מקושרות ({linkedTasks.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {linkedTasks.map(task => (
              <Badge
                key={task.id}
                variant="secondary"
                className="pl-1 pr-3 py-1.5 gap-2 hover:bg-secondary/80 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => removeTaskLink(task.id)}
                  className="hover:text-destructive transition-colors"
                  title="הסר קישור"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="text-sm">{task.title}</span>
                {task.status === 'completed' && <span className="text-xs">✓</span>}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            לחץ על X להסרת קישור למשימה
          </p>
        </div>
      )}
    </div>
  )
}

// Re-export Label for convenience
import { Label } from '@/components/ui/label'
