import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Receipt, Upload, Trash2, Plus, DollarSign } from "lucide-react"
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

const expenseFormSchema = z.object({
  title: z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "סכום חייב להיות גדול מ-0"),
  currency: z.enum(['ILS', 'USD', 'EUR']),
  category: z.enum(['supplies', 'catering', 'transportation', 'venue', 'equipment', 'marketing', 'other']),
  event_id: z.string().optional(),
  vendor_name: z.string().optional(),
  vendor_contact: z.string().optional(),
  payment_method: z.enum(['cash', 'credit_card', 'bank_transfer', 'check']),
  payment_date: z.string().min(1, "תאריך תשלום נדרש"),
  due_date: z.string().optional(),
  receipt_urls: z.array(z.string()).optional(),
  notes: z.string().optional(),
  budget_line_id: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormValues>
  onSubmit: (data: ExpenseFormValues) => Promise<void>
  isLoading?: boolean
  mode?: 'create' | 'edit'
  events?: Array<{ id: string; title: string }>
  budgetLines?: Array<{ id: string; name: string; remaining: number }>
}

const categoryOptions = [
  { value: 'supplies', label: 'ציוד ואביזרים' },
  { value: 'catering', label: 'קייטרינג' },
  { value: 'transportation', label: 'הסעות' },
  { value: 'venue', label: 'מקום' },
  { value: 'equipment', label: 'ציוד טכני' },
  { value: 'marketing', label: 'שיווק ופרסום' },
  { value: 'other', label: 'אחר' },
]

const paymentMethodOptions = [
  { value: 'cash', label: 'מזומן' },
  { value: 'credit_card', label: 'כרטיס אשראי' },
  { value: 'bank_transfer', label: 'העברה בנקאית' },
  { value: 'check', label: 'המחאה' },
]

const currencyOptions = [
  { value: 'ILS', label: '₪ שקל' },
  { value: 'USD', label: '$ דולר' },
  { value: 'EUR', label: '€ יורו' },
]

export function ExpenseForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = 'create',
  events = [],
  budgetLines = []
}: ExpenseFormProps) {
  const [receiptUrls, setReceiptUrls] = React.useState<string[]>(initialData?.receipt_urls || [])

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      currency: 'ILS',
      category: 'supplies',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      receipt_urls: [],
      notes: '',
      ...initialData,
    },
  })

  const selectedBudgetLine = form.watch("budget_line_id")
  const selectedAmount = form.watch("amount")

  const getBudgetLineRemaining = (budgetLineId: string) => {
    const budgetLine = budgetLines.find(bl => bl.id === budgetLineId)
    return budgetLine?.remaining || 0
  }

  const addReceiptUrl = () => {
    setReceiptUrls([...receiptUrls, ''])
  }

  const removeReceiptUrl = (index: number) => {
    const newUrls = receiptUrls.filter((_, i) => i !== index)
    setReceiptUrls(newUrls)
    form.setValue("receipt_urls", newUrls)
  }

  const updateReceiptUrl = (index: number, url: string) => {
    const newUrls = [...receiptUrls]
    newUrls[index] = url
    setReceiptUrls(newUrls)
    form.setValue("receipt_urls", newUrls)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              פרטי ההוצאה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת ההוצאה *</FormLabel>
                  <FormControl>
                    <Input placeholder="הזן תיאור קצר להוצאה..." {...field} />
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
                  <FormLabel>תיאור מפורט</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תיאור מפורט של ההוצאה..."
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סכום *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מטבע</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר מטבע" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((option) => (
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>קטגוריה</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר קטגוריה" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
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
            <CardTitle className="text-right">פרטי תשלום</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אמצעי תשלום</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר אמצעי תשלום" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethodOptions.map((option) => (
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
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך תשלום *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם הספק</FormLabel>
                    <FormControl>
                      <Input placeholder="שם החברה או הספק..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>פרטי קשר של הספק</FormLabel>
                    <FormControl>
                      <Input placeholder="טלפון או אימייל..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {(events.length > 0 || budgetLines.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">קישור לאירוע ותקציב</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.length > 0 && (
                  <FormField
                    control={form.control}
                    name="event_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>אירוע קשור (אופציונלי)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="בחר אירוע" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {events.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {budgetLines.length > 0 && (
                  <FormField
                    control={form.control}
                    name="budget_line_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>שורת תקציב</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="בחר שורת תקציב" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {budgetLines.map((line) => (
                              <SelectItem key={line.id} value={line.id}>
                                {line.name} (נותרו: ₪{line.remaining})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedBudgetLine && (
                          <FormDescription>
                            {selectedAmount > getBudgetLineRemaining(selectedBudgetLine)
                              ? `⚠️ הסכום חורג מהתקציב הנותר (₪${getBudgetLineRemaining(selectedBudgetLine)})`
                              : `תקציב נותר: ₪${getBudgetLineRemaining(selectedBudgetLine) - selectedAmount}`
                            }
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-right flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              קבלות ומסמכים
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReceiptUrl}
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף קבלה
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {receiptUrls.map((url, index) => (
              <div key={index} className="flex gap-2 items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReceiptUrl(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="קישור לקבלה או תמונה..."
                    value={url}
                    onChange={(e) => updateReceiptUrl(index, e.target.value)}
                  />
                </div>
              </div>
            ))}

            {receiptUrls.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>אין קבלות מצורפות</p>
                <p className="text-sm">לחץ על "הוסף קבלה" להוספת קבלות</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערות נוספות</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="הערות או הסברים נוספים..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="submit" loading={isLoading} className="min-w-[120px]">
            {mode === 'create' ? 'צור הוצאה' : 'עדכן הוצאה'}
          </Button>
          <Button type="button" variant="outline">
            ביטול
          </Button>
        </div>
      </form>
    </Form>
  )
}