import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Clock, Plus, Trash2, Users, FileText, Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const agendaItemSchema = z.object({
  title: z.string().min(1, "כותרת נדרשת"),
  description: z.string().optional(),
  duration: z.number().min(1, "משך זמן חייב להיות לפחות דקה אחת"),
  type: z.enum(['presentation', 'discussion', 'decision', 'update', 'break']),
  presenter: z.string().optional(),
  materials: z.array(z.string()).optional(),
  requires_vote: z.boolean().optional(),
})

const meetingAgendaSchema = z.object({
  title: z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים"),
  description: z.string().optional(),
  meeting_date: z.string().min(1, "תאריך פגישה נדרש"),
  start_time: z.string().min(1, "שעת התחלה נדרשת"),
  duration: z.number().min(15, "משך הפגישה חייב להיות לפחות 15 דקות"),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  agenda_items: z.array(agendaItemSchema).min(1, "לפחות נושא אחד נדרש"),
  notes: z.string().optional(),
})

type MeetingAgendaValues = z.infer<typeof meetingAgendaSchema>

interface MeetingAgendaFormProps {
  initialData?: Partial<MeetingAgendaValues>
  onSubmit: (data: MeetingAgendaValues) => Promise<void>
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

const agendaItemTypes = [
  { value: 'presentation', label: 'מצגת', icon: FileText },
  { value: 'discussion', label: 'דיון', icon: Users },
  { value: 'decision', label: 'החלטה', icon: Vote },
  { value: 'update', label: 'עדכון', icon: FileText },
  { value: 'break', label: 'הפסקה', icon: Clock },
]

const typeColors = {
  presentation: 'default',
  discussion: 'secondary',
  decision: 'warning',
  update: 'outline',
  break: 'secondary'
} as const

export function MeetingAgendaForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = 'create'
}: MeetingAgendaFormProps) {
  const form = useForm<MeetingAgendaValues>({
    resolver: zodResolver(meetingAgendaSchema),
    defaultValues: {
      title: '',
      description: '',
      meeting_date: '',
      start_time: '',
      duration: 60,
      location: '',
      attendees: [],
      agenda_items: [
        { title: '', description: '', duration: 15, type: 'discussion', presenter: '', materials: [] }
      ],
      notes: '',
      ...initialData,
    },
  })

  const agendaItems = form.watch("agenda_items") || []
  const totalDuration = agendaItems.reduce((sum, item) => sum + (item.duration || 0), 0)

  const addAgendaItem = () => {
    const currentItems = form.getValues("agenda_items") || []
    form.setValue("agenda_items", [
      ...currentItems,
      { title: '', description: '', duration: 15, type: 'discussion', presenter: '', materials: [] }
    ])
  }

  const removeAgendaItem = (index: number) => {
    const currentItems = form.getValues("agenda_items") || []
    form.setValue("agenda_items", currentItems.filter((_, i) => i !== index))
  }

  const moveAgendaItem = (index: number, direction: 'up' | 'down') => {
    const currentItems = [...(form.getValues("agenda_items") || [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < currentItems.length) {
      [currentItems[index], currentItems[newIndex]] = [currentItems[newIndex], currentItems[index]]
      form.setValue("agenda_items", currentItems)
    }
  }

  const getEstimatedEndTime = () => {
    const startTime = form.watch("start_time")
    if (!startTime || totalDuration === 0) return ""

    const [hours, minutes] = startTime.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + totalDuration
    const endHours = Math.floor(endMinutes / 60) % 24
    const endMins = endMinutes % 60

    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">פרטי הפגישה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת הפגישה *</FormLabel>
                  <FormControl>
                    <Input placeholder="הזן כותרת לפגישה..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור הפגישה</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תיאור כללי של מטרת הפגישה..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="meeting_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך הפגישה *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שעת התחלה *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>משך זמן מתוכנן (דקות)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      {getEstimatedEndTime() && `סיום מתוכנן: ${getEstimatedEndTime()}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מיקום הפגישה</FormLabel>
                  <FormControl>
                    <Input placeholder="כתובת או שם המקום..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-right">סדר יום</CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 ml-1" />
                {totalDuration} דקות בסך הכל
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAgendaItem}
              >
                <Plus className="h-4 w-4 ml-2" />
                הוסף נושא
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {agendaItems.map((item, index) => {
              const ItemIcon = agendaItemTypes.find(t => t.value === item.type)?.icon || FileText

              return (
                <Card key={index} className="border-2 border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={typeColors[item.type]} className="text-xs">
                          <ItemIcon className="h-3 w-3 ml-1" />
                          {agendaItemTypes.find(t => t.value === item.type)?.label}
                        </Badge>
                        <span className="text-sm font-medium">נושא {index + 1}</span>
                      </div>
                      <div className="flex gap-2">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveAgendaItem(index, 'up')}
                          >
                            ↑
                          </Button>
                        )}
                        {index < agendaItems.length - 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveAgendaItem(index, 'down')}
                          >
                            ↓
                          </Button>
                        )}
                        {agendaItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAgendaItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`agenda_items.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>כותרת הנושא *</FormLabel>
                            <FormControl>
                              <Input placeholder="נושא לדיון..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`agenda_items.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סוג הנושא</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר סוג נושא" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {agendaItemTypes.map((type) => {
                                  const Icon = type.icon
                                  return (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`agenda_items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תיאור הנושא</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="פרטים נוספים על הנושא..."
                              className="min-h-[60px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`agenda_items.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>משך זמן (דקות)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                step="5"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`agenda_items.${index}.presenter`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>מציג הנושא</FormLabel>
                            <FormControl>
                              <Input placeholder="שם המציג..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {agendaItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>אין נושאים בסדר היום</p>
                <p className="text-sm">לחץ על "הוסף נושא" להתחלת בניית סדר היום</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right">הערות נוספות</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערות כלליות</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="הערות או הנחיות נוספות לפגישה..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    הערות אלו יופיעו בתחתית סדר היום
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? 'שומר...' : mode === 'create' ? 'צור סדר יום' : 'עדכן סדר יום'}
          </Button>
          <Button type="button" variant="outline">
            ביטול
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Display component for showing the agenda in a formatted way
export function MeetingAgendaDisplay({
  agenda
}: {
  agenda: MeetingAgendaValues
}) {
  let currentTime = agenda.start_time

  const addMinutesToTime = (time: string, minutes: number) => {
    const [hours, mins] = time.split(":").map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMins = totalMinutes % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right text-xl">{agenda.title}</CardTitle>
        {agenda.description && (
          <p className="text-muted-foreground text-right">{agenda.description}</p>
        )}
        <div className="flex gap-4 justify-end text-sm text-muted-foreground">
          <span>📅 {agenda.meeting_date}</span>
          <span>🕐 {agenda.start_time}</span>
          {agenda.location && <span>📍 {agenda.location}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agenda.agenda_items.map((item, index) => {
            const startTime = currentTime
            const endTime = addMinutesToTime(currentTime, item.duration)
            currentTime = endTime

            const ItemIcon = agendaItemTypes.find(t => t.value === item.type)?.icon || FileText

            return (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="text-right text-sm text-muted-foreground min-w-[100px]">
                  {startTime} - {endTime}
                  <br />
                  <span className="text-xs">({item.duration} דק')</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 justify-end">
                    <Badge variant={typeColors[item.type]} className="text-xs">
                      <ItemIcon className="h-3 w-3 ml-1" />
                      {agendaItemTypes.find(t => t.value === item.type)?.label}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-right mb-1">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground text-right mb-2">{item.description}</p>
                  )}
                  {item.presenter && (
                    <p className="text-xs text-muted-foreground text-right">מציג: {item.presenter}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {agenda.notes && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-right mb-2">הערות:</h4>
            <p className="text-sm text-right">{agenda.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}