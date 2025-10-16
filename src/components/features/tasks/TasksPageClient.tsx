'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { CheckSquare, Plus, X, AlertCircle, Clock, UserCheck, Tags as TagsIcon, Share2, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TaskCard } from '@/components/features/tasks/TaskCard'
import Link from 'next/link'
import type { Task, Tag } from '@/types'
import type { Locale } from '@/i18n/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface TasksPageClientProps {
  initialTasks: Task[]
  initialStats: {
    pending: number
    inProgress: number
    completed: number
    overdue: number
  }
  availableTags: Tag[]
}

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export function TasksPageClient({ initialTasks, initialStats, availableTags }: TasksPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [stats] = useState(initialStats)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const locale = (params?.locale || 'he') as Locale

  const handleTaskTagsUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleShareTasks = async () => {
    // Filter out completed tasks
    const tasksToShare = filteredTasks.filter(task => task.status !== 'completed')

    if (tasksToShare.length === 0) {
      toast({
        title: 'אין משימות לשיתוף',
        description: 'לא נמצאו משימות פעילות להצגה',
        variant: 'destructive'
      })
      return
    }

    const baseUrl = `https://beeri.online/${locale}/tasks`

    // Format as WhatsApp table
    let shareText = '📋 *רשימת משימות - פורטל בארי*\n\n'

    tasksToShare.forEach((task, index) => {
      const taskUrl = `${baseUrl}/${task.id}`
      const status = task.status === 'pending' ? '⏳' :
                     task.status === 'in_progress' ? '🔄' : '❓'

      // Add task title and status
      shareText += `${index + 1}. ${status} ${task.title}\n`

      // Add tags if present
      if (task.tags && task.tags.length > 0) {
        const tagsList = task.tags
          .map(tag => `${tag.emoji || ''} ${tag.name_he}`.trim())
          .join(', ')
        shareText += `תגיות: ${tagsList}\n`
      }

      // Add URL
      shareText += `${taskUrl}\n\n`
    })

    shareText += `סה"כ: ${tasksToShare.length} משימות`

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'רשימת משימות - פורטל בארי',
          text: shareText
        })
        // Share succeeded - do nothing, no toast
        return
      } catch (err) {
        const error = err as Error
        // User cancelled the share - do nothing
        if (error.name === 'AbortError') {
          return
        }
        // Share failed for other reason - fall through to clipboard
        console.error('Share failed:', err)
      }
    }

    // Fallback: Copy to clipboard (desktop only)
    try {
      await navigator.clipboard.writeText(shareText)
      // No toast - silent copy
    } catch (err) {
      // Final fallback with textarea
      const textArea = document.createElement('textarea')
      textArea.value = shareText
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        // No toast - silent copy
      } catch (err2) {
        // Only show error toast if everything failed
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לשתף משימות',
          variant: 'destructive'
        })
      }
      document.body.removeChild(textArea)
    }
  }

  const statusFilter = (searchParams?.get('status') as TaskStatus) || null

  // Filter tasks based on status, tags, and search query
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'overdue') {
        filtered = filtered.filter(t => {
          if (t.status === 'completed' || !t.due_date) return false
          const dueDate = new Date(t.due_date)
          return dueDate < new Date()
        })
      } else {
        filtered = filtered.filter(t => t.status === statusFilter)
      }
    }

    // Apply tag filter
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter(task => {
        // Task must have at least one of the selected tags
        return task.tags?.some(tag => selectedTagIds.includes(tag.id))
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(task => {
        // Search in title
        if (task.title.toLowerCase().includes(query)) return true
        // Search in description
        if (task.description?.toLowerCase().includes(query)) return true
        // Search in owner name
        if (task.owner_name?.toLowerCase().includes(query)) return true
        // Search in tags
        if (task.tags?.some(tag =>
          tag.name_he.toLowerCase().includes(query)
        )) return true
        return false
      })
    }

    return filtered
  }, [tasks, statusFilter, selectedTagIds, searchQuery])

  // Group filtered tasks
  const tasksByStatus = useMemo(() => ({
    urgent: filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed'),
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed').slice(0, 5)
  }), [filteredTasks])

  const handleFilterClick = (status: TaskStatus) => {
    router.push(`/tasks?status=${status}`, { scroll: false })
  }

  const handleClearFilter = () => {
    router.push('/tasks', { scroll: false })
    setSelectedTagIds([])
    setSearchQuery('')
  }

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }

  const handleClearTags = () => {
    setSelectedTagIds([])
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין משימות</h3>
        <p className="text-muted-foreground mb-6">
          עדיין לא נוספו משימות למערכת
        </p>
        <Button asChild size="sm">
          <Link href="/admin/tasks/new">
            <Plus className="h-4 w-4 ml-2" />
            צור משימה חדשה
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics - Single Card with Click to Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <button
              onClick={() => handleFilterClick('pending')}
              className={`p-3 rounded-lg transition-all hover:bg-blue-50 ${
                statusFilter === 'pending' ? 'bg-blue-100 ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">ממתינות</div>
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            </button>

            <button
              onClick={() => handleFilterClick('in_progress')}
              className={`p-3 rounded-lg transition-all hover:bg-yellow-50 ${
                statusFilter === 'in_progress' ? 'bg-yellow-100 ring-2 ring-yellow-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">בביצוע</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </button>

            <button
              onClick={() => handleFilterClick('completed')}
              className={`p-3 rounded-lg transition-all hover:bg-green-50 ${
                statusFilter === 'completed' ? 'bg-green-100 ring-2 ring-green-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">הושלמו</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </button>

            <button
              onClick={() => handleFilterClick('overdue')}
              className={`p-3 rounded-lg transition-all hover:bg-red-50 ${
                statusFilter === 'overdue' ? 'bg-red-100 ring-2 ring-red-500' : ''
              }`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-1">באיחור</div>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="חיפוש לפי כותרת, תיאור, אחראי או תגיות..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tag Filter Dropdown and Share Button */}
      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <TagsIcon className="h-4 w-4 ml-2" />
              סינון לפי תגיות
              {selectedTagIds.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {selectedTagIds.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>בחר תגיות לסינון</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={selectedTagIds.includes(tag.id)}
                onCheckedChange={() => handleToggleTag(tag.id)}
              >
                <div className="flex items-center gap-2">
                  {tag.emoji && <span>{tag.emoji}</span>}
                  <span>{tag.name_he}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            {selectedTagIds.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={handleClearTags}
                  className="w-full text-sm text-center py-2 text-muted-foreground hover:text-foreground"
                >
                  נקה סינון תגיות
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShareTasks}
          disabled={filteredTasks.filter(t => t.status !== 'completed').length === 0}
        >
          <Share2 className="h-4 w-4 ml-2" />
          שתף משימות
        </Button>

        {/* Active Tag Filters */}
        {selectedTagIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedTagIds.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId)
              if (!tag) return null
              return (
                <Badge
                  key={tag.id}
                  variant="outline"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                  className="cursor-pointer hover:opacity-75"
                  onClick={() => handleToggleTag(tag.id)}
                >
                  {tag.emoji && <span className="ml-1">{tag.emoji}</span>}
                  {tag.name_he}
                  <X className="h-3 w-3 mr-1" />
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Filter Badge with Clear Button */}
      {(statusFilter || selectedTagIds.length > 0 || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilter && (
            <Badge variant="secondary" className="text-base py-2 px-4">
              סטטוס: {
                statusFilter === 'pending' ? 'ממתינות' :
                statusFilter === 'in_progress' ? 'בביצוע' :
                statusFilter === 'completed' ? 'הושלמו' :
                'באיחור'
              }
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="text-base py-2 px-4">
              חיפוש: "{searchQuery}"
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="h-auto py-2"
          >
            <X className="h-4 w-4 ml-1" />
            נקה כל הסינונים
          </Button>
          <span className="text-sm text-muted-foreground">
            ({filteredTasks.length} משימות)
          </span>
        </div>
      )}

      {/* No Results */}
      {filteredTasks.length === 0 && (statusFilter || searchQuery || selectedTagIds.length > 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">לא נמצאו משימות</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? `לא נמצאו תוצאות עבור "${searchQuery}"` :
               statusFilter ? 'אין משימות בסטטוס זה' :
               'אין משימות התואמות את הסינון'}
            </p>
            <Button variant="outline" size="sm" onClick={handleClearFilter}>
              הצג את כל המשימות
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Urgent Tasks */}
      {tasksByStatus.urgent.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              משימות דחופות
            </CardTitle>
            <CardDescription>משימות שדורשות טיפול מיידי</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.urgent.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {tasksByStatus.pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              משימות ממתינות
            </CardTitle>
            <CardDescription>משימות שטרם החלו</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* In Progress Tasks */}
      {tasksByStatus.in_progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              משימות בביצוע
            </CardTitle>
            <CardDescription>משימות שנמצאות כעת בטיפול</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.in_progress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="compact"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {tasksByStatus.completed.length > 0 && (
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckSquare className="h-5 w-5" />
              משימות שהושלמו לאחרונה
            </CardTitle>
            <CardDescription>5 המשימות האחרונות שהושלמו</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByStatus.completed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="minimal"
                availableTags={availableTags}
                onTagsUpdated={handleTaskTagsUpdated}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
