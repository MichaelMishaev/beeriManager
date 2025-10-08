'use client'

import { useState, useEffect } from 'react'
import { Ticket as TicketIcon, Calendar, MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TicketPlaceholderImage } from '@/components/features/tickets/TicketPlaceholderImage'
import type { Ticket } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    try {
      const response = await fetch('/api/tickets')
      const data = await response.json()
      if (data.success) {
        setTickets(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFBA00]/5 via-white to-[#FF8200]/5">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#FF8200]/20 via-[#FFBA00]/10 to-transparent py-12 md:py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FF8200]/30 blur-2xl rounded-full"></div>
              <TicketIcon className="relative h-16 w-16 text-[#FF8200] mx-auto" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FF8200] to-[#FFBA00] bg-clip-text text-transparent">
              כרטיסים לאירועים
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            ועד ההורים מספק כרטיסים למשחקי ספורט, הצגות וקונצרטים במחירים מיוחדים
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {tickets.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#FFBA00]/10 via-white to-[#FF8200]/5 border-[#FFBA00]/20">
            <CardContent className="py-16 text-center">
              <TicketIcon className="h-20 w-20 text-[#FF8200] mx-auto mb-6 opacity-50" />
              <h2 className="text-2xl font-bold text-[#003153] mb-3">
                אין כרטיסים זמינים כרגע
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                כרטיסים חדשים יתווספו בקרוב. עקבו אחרינו בוואטסאפ לעדכונים!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#FF8200]/30 flex flex-col"
              >
                {/* Image or Icon */}
                {ticket.image_url ? (
                  <div
                    className="h-48 bg-cover bg-center rounded-t-lg relative"
                    style={{ backgroundImage: `url(${ticket.image_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
                    {ticket.featured && (
                      <Badge className="absolute top-3 right-3 bg-[#FF8200] text-white border-none shadow-lg">
                        מומלץ ⭐
                      </Badge>
                    )}
                    {ticket.status === 'sold_out' && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none shadow-lg">
                        אזל מהמלאי
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <TicketPlaceholderImage size="lg" className="rounded-t-lg" />
                    {ticket.featured && (
                      <Badge className="absolute top-3 right-3 bg-[#FF8200] text-white border-none">
                        מומלץ ⭐
                      </Badge>
                    )}
                    {ticket.status === 'sold_out' && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none">
                        אזל
                      </Badge>
                    )}
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl leading-tight flex-1">
                      {ticket.title}
                    </CardTitle>
                  </div>

                  {/* Description */}
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {ticket.description}
                    </p>
                  )}

                  {/* Teams (for sport events) */}
                  {ticket.team_home && ticket.team_away && (
                    <div className="text-base font-semibold text-[#003153] mt-3 p-2 bg-gray-50 rounded-lg text-center">
                      {ticket.team_home} 🆚 {ticket.team_away}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    {ticket.event_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-[#FF8200]" />
                        <span className="font-medium">
                          {format(new Date(ticket.event_date), 'EEEE, dd MMMM yyyy בשעה HH:mm', { locale: he })}
                        </span>
                      </div>
                    )}

                    {ticket.venue && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-[#FF8200]" />
                        <span>{ticket.venue}</span>
                      </div>
                    )}

                    {ticket.sport_type && (
                      <div className="text-sm">
                        <Badge variant="outline" className="text-xs">
                          {ticket.sport_type}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Availability */}
                  {ticket.quantity_available !== null && ticket.status !== 'sold_out' && (
                    <div className="mb-4 bg-gradient-to-r from-[#FF8200]/10 to-[#FFBA00]/10 rounded-lg p-3 text-center border border-[#FF8200]/20">
                      <p className="text-sm text-muted-foreground">נותרו רק</p>
                      <p className="text-3xl font-bold text-[#FF8200]">
                        {ticket.quantity_available - ticket.quantity_sold}
                      </p>
                      <p className="text-sm text-muted-foreground">כרטיסים</p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4 text-center">
                    {ticket.price_per_ticket !== null && ticket.price_per_ticket > 0 ? (
                      <>
                        <div className="text-3xl font-bold text-[#003153]">
                          ₪{ticket.price_per_ticket}
                        </div>
                        <p className="text-sm text-muted-foreground">לכרטיס</p>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-green-600">חינם</div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-[#FF8200] to-[#FFBA00] hover:from-[#FF8200]/90 hover:to-[#FFBA00]/90 text-white font-semibold shadow-lg text-lg py-6"
                    size="lg"
                    disabled={ticket.status === 'sold_out'}
                  >
                    <a
                      href={ticket.purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <TicketIcon className="h-5 w-5" />
                      {ticket.status === 'sold_out' ? 'אזל מהמלאי' : 'הזמן עכשיו'}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
