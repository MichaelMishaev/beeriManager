import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, MapPin, Users, Plus, Trash2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const eventFormSchema = z.object({
  title: z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים"),
  description: z.string().optional(),
  start_datetime: z.string().min(1, "תאריך התחלה נדרש"),
  end_datetime: z.string().optional(),
  location: z.string().optional(),
  event_type: z.enum(['general', 'meeting', 'fundraiser', 'trip', 'workshop']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  registration_enabled: z.boolean(),
  max_attendees: z.number().min(1, "מספר המשתתפים המקסימלי חייב להיות לפחות 1").optional(),
  volunteer_slots: z.array(z.object({
    role: z.string().min(1, "תפקיד נדרש"),
    description: z.string().optional(),
    count: z.number().min(1, "מספר מתנדבים חייב להיות לפחות 1"),
  })).optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  initialData?: Partial<EventFormValues>
  onSubmit: (data: EventFormValues) => Promise<void>
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

const eventTypeOptions = [
  { value: 'general', label: 'כללי' },
  { value: 'meeting', label: 'פגישה' },
  { value: 'fundraiser', label: 'התרמה' },
  { value: 'trip', label: 'טיול' },
  { value: 'workshop', label: 'סדנה' },
]

const priorityOptions = [
  { value: 'low', label: 'נמוך' },
  { value: 'normal', label: 'רגיל' },
  { value: 'high', label: 'גבוה' },
  { value: 'urgent', label: 'דחוף' },
]

export function EventForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = 'create'
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      start_datetime: '',
      end_datetime: '',
      location: '',
      event_type: 'general',
      priority: 'normal',
      registration_enabled: false,
      max_attendees: undefined,
      volunteer_slots: [],
      ...initialData,
    },
  })

  const registrationEnabled = form.watch("registration_enabled")
  const volunteerSlots = form.watch("volunteer_slots") || []

  const addVolunteerSlot = () => {
    const currentSlots = form.getValues("volunteer_slots") || []
    form.setValue("volunteer_slots", [
      ...currentSlots,
      { role: '', description: '', count: 1 }
    ])
  }

  const removeVolunteerSlot = (index: number) => {
    const currentSlots = form.getValues("volunteer_slots") || []
    form.setValue("volunteer_slots", currentSlots.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">פרטי האירוע</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת האירוע *</FormLabel>
                  <FormControl>
                    <Input placeholder="הזן כותרת לאירוע..." {...field} />
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
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תיאור האירוע..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    תיאור מפורט של האירוע שיוצג למשתתפים
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סוג אירוע</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר סוג אירוע" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>עדיפות</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר עדיפות" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              תאריך ושעה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_datetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך ושעת התחלה *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_datetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך ושעת סיום</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      אופציונלי - אם האירוע נמשך יותר משעה
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
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    מיקום
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="מיקום האירוע..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Users className="h-5 w-5" />
              הרשמה ומשתתפים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="registration_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5 text-right">
                    <FormLabel className="text-base">
                      אפשר הרשמה לאירוע
                    </FormLabel>
                    <FormDescription>
                      האם משתתפים יכולים להירשם מראש לאירוע
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {registrationEnabled && (
              <FormField
                control={form.control}
                name="max_attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מספר משתתפים מקסימלי</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="הגבל מספר משתתפים..."
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      השאר ריק אם אין הגבלה
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-right">תפקידי מתנדבים</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVolunteerSlot}
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף תפקיד
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {volunteerSlots.map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">תפקיד {index + 1}</h4>
                  {volunteerSlots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVolunteerSlot(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`volunteer_slots.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>שם התפקיד</FormLabel>
                        <FormControl>
                          <Input placeholder="למשל: מלצר" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`volunteer_slots.${index}.count`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>כמות נדרשת</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`volunteer_slots.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>תיאור (אופציונלי)</FormLabel>
                        <FormControl>
                          <Input placeholder="מה התפקיד כולל..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            {volunteerSlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>אין תפקידי מתנדבים מוגדרים</p>
                <p className="text-sm">לחץ על "הוסף תפקיד" להוספת תפקידים</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? 'שומר...' : mode === 'create' ? 'צור אירוע' : 'עדכן אירוע'}
          </Button>
          <Button type="button" variant="outline">
            ביטול
          </Button>
        </div>
      </form>
    </Form>
  )
}