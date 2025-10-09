'use client'

import { Ticket as TicketIcon, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TicketPlaceholderImage } from './TicketPlaceholderImage'
import Link from 'next/link'
import type { Ticket } from '@/types'

interface TicketsSectionProps {
  tickets: Ticket[]
}

export function TicketsSection({ tickets }: TicketsSectionProps) {
  // Empty state - show beautiful message
  if (tickets.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-[#0D98BA]/5 to-[#003153]/5 border-[#0D98BA]/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0D98BA]/10 flex items-center justify-center min-w-[48px] min-h-[48px]">
              <TicketIcon className="h-6 w-6 text-[#0D98BA]" />
            </div>
            <CardTitle className="text-xl text-[#003153]">
              כרטיסים לאירועים
            </CardTitle>
          </div>
          <CardDescription className="text-base mt-3">
            ועד ההורים מספק כרטיסים למשחקי ספורט, הצגות וקונצרטים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            הכרטיסים הבאים יופיעו כאן ✨
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-[#0D98BA]/5 to-[#003153]/5 border-[#0D98BA]/20 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0D98BA]/10 flex items-center justify-center min-w-[48px] min-h-[48px]">
              <TicketIcon className="h-6 w-6 text-[#0D98BA]" />
            </div>
            <CardTitle className="text-xl text-[#003153]">
              כרטיסים זמינים
            </CardTitle>
          </div>
          <CardDescription className="text-base mt-3">
            כרטיסים למשחקי ספורט והצגות במחירים מיוחדים
          </CardDescription>
        </div>
        {tickets.length > 3 && (
          <Button variant="outline" asChild size="sm" className="min-h-[44px]">
            <Link href="/tickets">
              כל הכרטיסים
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {tickets.slice(0, 3).map((ticket) => (
            <div
              key={ticket.id}
              className="py-6 hover:bg-white/50 transition-all duration-200 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {ticket.image_url ? (
                    <img
                      src={ticket.image_url}
                      alt={ticket.title}
                      className="w-16 h-16 rounded-lg object-cover transition-transform hover:scale-105 duration-200"
                    />
                  ) : (
                    <div className="transition-transform hover:scale-105 duration-200">
                      <TicketPlaceholderImage size="sm" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-[#003153] mb-1">
                    {ticket.title}
                  </h3>
                  {ticket.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {ticket.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {ticket.price_per_ticket !== null && ticket.price_per_ticket !== undefined && ticket.price_per_ticket > 0 ? (
                      <Badge variant="secondary" className="text-sm font-semibold">
                        ₪{ticket.price_per_ticket}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-sm font-semibold bg-green-100 text-green-800 border-green-200">
                        חינם
                      </Badge>
                    )}
                    {ticket.status === 'sold_out' && (
                      <Badge variant="destructive" className="text-sm">
                        אזל מהמלאי
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                asChild
                className="w-full bg-[#0D98BA] hover:bg-[#0D98BA]/90 min-h-[48px] text-base font-semibold transition-all duration-200 hover:shadow-md"
                disabled={ticket.status === 'sold_out'}
              >
                <a
                  href={ticket.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <TicketIcon className="h-5 w-5" />
                  {ticket.status === 'sold_out' ? 'אזל מהמלאי' : 'הזמן כרטיס'}
                </a>
              </Button>
            </div>
          ))}
        </div>
        {tickets.length > 3 && (
          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
              <Link href="/tickets" className="flex items-center gap-2">
                צפה בכל הכרטיסים ({tickets.length})
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
