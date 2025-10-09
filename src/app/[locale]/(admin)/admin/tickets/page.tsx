'use client'

import { useState, useEffect } from 'react'
import { Ticket as TicketIcon, Plus, Loader2, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import type { Ticket } from '@/types'
import { toast } from 'sonner'

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [ticketToFinish, setTicketToFinish] = useState<Ticket | null>(null)

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    try {
      const response = await fetch('/api/tickets?status=all')
      const data = await response.json()
      if (data.success) {
        setTickets(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
      toast.error('שגיאה בטעינת הכרטיסים')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק כרטיס זה?')) {
      return
    }

    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('הכרטיס נמחק בהצלחה')
        loadTickets()
      } else {
        toast.error(result.error || 'שגיאה במחיקת הכרטיס')
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      toast.error('שגיאה במחיקת הכרטיס')
    }
  }

  function openFinishDialog(ticket: Ticket) {
    setTicketToFinish(ticket)
    setFinishDialogOpen(true)
  }

  async function confirmFinish() {
    if (!ticketToFinish) return

    try {
      // Only send fields that are in the API schema, exclude metadata fields
      const { id, created_at, updated_at, created_by, ...ticketData } = ticketToFinish as any

      const response = await fetch(`/api/tickets/${ticketToFinish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticketData,
          status: 'finished'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('האירוע הסתיים והוסר מהתצוגה הציבורית')
        setFinishDialogOpen(false)
        setTicketToFinish(null)
        loadTickets()
      } else {
        console.error('Ticket update failed:', result)
        console.error('Validation details:', result.details)
        console.error('Sent data:', { ...ticketData, status: 'finished' })

        // Check if error is due to 'finished' status not being supported yet
        const isFinishedStatusError = result.details?.some((msg: string) =>
          msg.includes('status') || msg.includes('Invalid enum value')
        )

        if (isFinishedStatusError) {
          toast.error('הפיצ\'ר עדיין לא פרוס לפרודקשן. נסה שוב בעוד דקה.')
          console.error('⏳ Waiting for Vercel deployment to complete...')
        } else {
          toast.error(result.error || 'שגיאה בעדכון הכרטיס')
        }

        if (result.details) {
          console.error('Detailed errors:', result.details)
        }
      }
    } catch (error) {
      console.error('Error finishing ticket:', error)
      toast.error('שגיאה בעדכון הכרטיס')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <TicketIcon className="h-6 w-6 md:h-8 md:w-8" />
            ניהול כרטיסים
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2">
            כרטיסים למשחקי ספורט, הצגות ואירועים
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/tickets/new">
            <Plus className="h-4 w-4 ml-2" />
            כרטיס חדש
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg flex-1">{ticket.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {ticket.status === 'active' && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">פעיל</Badge>
                  )}
                  {ticket.status === 'sold_out' && (
                    <Badge className="bg-red-100 text-red-800 border-red-300">אזל</Badge>
                  )}
                  {ticket.status === 'expired' && (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-300">פג תוקף</Badge>
                  )}
                  {ticket.status === 'draft' && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">טיוטה</Badge>
                  )}
                  {ticket.status === 'finished' && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">הסתיים</Badge>
                  )}
                  {ticket.featured && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">מומלץ</Badge>
                  )}
                </div>
              </div>
              {ticket.event_date && (
                <div className="text-sm text-muted-foreground">
                  {new Date(ticket.event_date).toLocaleDateString('he-IL')}
                </div>
              )}
              {ticket.team_home && ticket.team_away && (
                <div className="text-sm font-medium">
                  {ticket.team_home} נגד {ticket.team_away}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {ticket.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {ticket.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">כמות זמינה:</span>
                <span className="font-medium">
                  {ticket.quantity_available === null || ticket.quantity_available === undefined
                    ? 'ללא הגבלה'
                    : `${ticket.quantity_available - ticket.quantity_sold} מתוך ${ticket.quantity_available}`}
                </span>
              </div>

              {ticket.price_per_ticket !== null && (
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">מחיר:</span>
                  <span className="font-medium">₪{ticket.price_per_ticket}</span>
                </div>
              )}

              {ticket.venue && (
                <div className="text-sm text-muted-foreground mb-3">
                  📍 {ticket.venue}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/admin/tickets/${ticket.id}/edit`}>
                      <Edit className="h-4 w-4 ml-2" />
                      ערוך
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(ticket.id)}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    מחק
                  </Button>
                </div>
                {ticket.status !== 'finished' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
                    onClick={() => openFinishDialog(ticket)}
                  >
                    <CheckCircle className="h-4 w-4 ml-2" />
                    סיים אירוע
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {tickets.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">אין כרטיסים במערכת</p>
              <Button asChild>
                <Link href="/admin/tickets/new">
                  <Plus className="h-4 w-4 ml-2" />
                  צור כרטיס ראשון
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Finish Event Confirmation Dialog */}
      <AlertDialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <AlertDialogTitle className="text-xl text-purple-900">
                סיום אירוע
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-700 leading-relaxed">
              {ticketToFinish && (
                <div className="space-y-3 mt-4">
                  <p className="font-semibold text-purple-900">
                    {ticketToFinish.title}
                  </p>
                  <p>
                    האם לסיים את האירוע?
                  </p>
                  <div className="bg-purple-100/50 rounded-lg p-3 border border-purple-200">
                    <p className="text-sm text-purple-800">
                      ℹ️ האירוע יוסר מהתצוגה הציבורית ולא יוצג יותר למשתמשים רגילים.
                      תוכל לראות אותו כאן בפאנל הניהול עם סטטוס "הסתיים".
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFinishDialogOpen(false)}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFinish}
              variant="default"
            >
              <CheckCircle className="h-4 w-4 ml-2" />
              סיים אירוע
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
