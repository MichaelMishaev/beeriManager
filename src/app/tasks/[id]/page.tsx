import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CheckSquare, User, Clock, Calendar, Phone, AlertCircle, ChevronRight, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatHebrewDate, getHebrewRelativeTime } from '@/lib/utils/date'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function getTask(id: string) {
  const supabase = createClient()

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !task) {
    return null
  }

  // Get related event if exists
  if (task.event_id) {
    const { data: event } = await supabase
      .from('events')
      .select('id, title')
      .eq('id', task.event_id)
      .single()

    task.event = event
  }

  // Get parent task if exists
  if (task.parent_task_id) {
    const { data: parentTask } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('id', task.parent_task_id)
      .single()

    task.parent_task = parentTask
  }

  return task
}

function TaskDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded animate-pulse" />
      <div className="h-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

async function TaskDetail({ id }: { id: string }) {
  const task = await getTask(id)

  if (!task) {
    notFound()
  }

  const dueDate = new Date(task.due_date)
  const isOverdue = task.status !== 'completed' && dueDate < new Date()
  const isToday = dueDate.toDateString() === new Date().toDateString()

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch(status) {
      case 'completed': return 'secondary'
      case 'in_progress': return 'default'
      case 'cancelled': return 'destructive'
      case 'overdue': return 'destructive'
      default: return 'outline'
    }
  }

  const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
    switch(priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'normal': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">בית</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/tasks" className="hover:text-primary">משימות</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{task.title}</span>
      </div>

      {/* Task Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-3 flex items-center gap-3">
                {task.status === 'completed' ? (
                  <CheckSquare className="h-8 w-8 text-green-600" />
                ) : (
                  <Clock className="h-8 w-8 text-muted-foreground" />
                )}
                {task.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {task.status === 'pending' ? 'ממתין' :
                   task.status === 'in_progress' ? 'בביצוע' :
                   task.status === 'completed' ? 'הושלם' :
                   task.status === 'cancelled' ? 'בוטל' : task.status}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(task.priority)}>
                  {task.priority === 'urgent' ? 'דחוף' :
                   task.priority === 'high' ? 'גבוה' :
                   task.priority === 'normal' ? 'רגיל' :
                   task.priority === 'low' ? 'נמוך' : task.priority}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 ml-1" />
                    באיחור
                  </Badge>
                )}
                {isToday && !isOverdue && (
                  <Badge variant="default">
                    להיום
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 ml-2" />
                עריכה
              </Button>
              {task.status !== 'completed' && (
                <Button size="sm" variant="default">
                  <CheckSquare className="h-4 w-4 ml-2" />
                  סמן כהושלם
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Task Details */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">אחראי</p>
                <p className="text-sm text-muted-foreground">{task.owner_name}</p>
                {task.owner_phone && (
                  <a
                    href={`tel:${task.owner_phone}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Phone className="h-3 w-3" />
                    {task.owner_phone}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">תאריך יעד</p>
                <p className="text-sm text-muted-foreground">
                  {formatHebrewDate(dueDate)}
                </p>
                <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {getHebrewRelativeTime(dueDate)}
                </p>
              </div>
            </div>

            {task.reminder_date && (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">תזכורת</p>
                  <p className="text-sm text-muted-foreground">
                    {formatHebrewDate(new Date(task.reminder_date))}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="font-semibold mb-2">תיאור המשימה</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Related Event */}
          {task.event && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">משימה קשורה לאירוע</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/events/${task.event.id}`}
                  className="text-primary hover:underline"
                >
                  {task.event.title}
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Parent Task */}
          {task.parent_task && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">משימת אב</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/tasks/${task.parent_task.id}`}
                  className="text-primary hover:underline"
                >
                  {task.parent_task.title}
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Information */}
          {task.follow_up_count > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-800">מעקבים</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  בוצעו {task.follow_up_count} מעקבים
                </p>
                {task.last_follow_up_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    מעקב אחרון: {formatHebrewDate(new Date(task.last_follow_up_at))}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Completion Information */}
          {task.completed_at && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm text-green-800">פרטי השלמה</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  הושלם בתאריך: {formatHebrewDate(new Date(task.completed_at))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getHebrewRelativeTime(new Date(task.completed_at))}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
            <span>נוצר: {formatHebrewDate(new Date(task.created_at))}</span>
            {task.updated_at && (
              <span>עודכן: {formatHebrewDate(new Date(task.updated_at))}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TaskPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<TaskDetailSkeleton />}>
        <TaskDetail id={params.id} />
      </Suspense>
    </div>
  )
}