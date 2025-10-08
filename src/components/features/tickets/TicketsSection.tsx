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
      <Card className="bg-gradient-to-br from-[#FFBA00]/5 to-[#FF8200]/5 border-[#FF8200]/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#FF8200]/10 flex items-center justify-center">
              <TicketIcon className="h-5 w-5 text-[#FF8200]" />
            </div>
            <CardTitle className="text-xl text-[#003153]">
              כרטיסים לאירועים
            </CardTitle>
          </div>
          <CardDescription className="text-base mt-2">
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
    <Card className="bg-gradient-to-br from-[#FFBA00]/5 to-[#FF8200]/5 border-[#FF8200]/20 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#FF8200]/10 flex items-center justify-center">
              <TicketIcon className="h-5 w-5 text-[#FF8200]" />
            </div>
            <CardTitle className="text-xl text-[#003153]">
              כרטיסים זמינים
            </CardTitle>
          </div>
          <CardDescription className="text-base mt-2">
            כרטיסים למשחקי ספורט והצגות במחירים מיוחדים
          </CardDescription>
        </div>
        {tickets.length > 3 && (
          <Button variant="outline" asChild size="sm">
            <Link href="/tickets">
              כל הכרטיסים
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.slice(0, 3).map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 rounded-lg bg-white hover:bg-gray-50 transition-colors border"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="flex-shrink-0">
                  {ticket.image_url ? (
                    <img
                      src={ticket.image_url}
                      alt={ticket.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <TicketPlaceholderImage size="sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#003153] line-clamp-1">
                    {ticket.title}
                  </h3>
                  {ticket.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {ticket.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {ticket.price_per_ticket !== null && ticket.price_per_ticket > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        ₪{ticket.price_per_ticket}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        חינם
                      </Badge>
                    )}
                    {ticket.status === 'sold_out' && (
                      <Badge variant="destructive" className="text-xs">
                        אזל
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-[#0D98BA] hover:bg-[#0D98BA]/90 w-full"
                disabled={ticket.status === 'sold_out'}
              >
                <a
                  href={ticket.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ticket.status === 'sold_out' ? 'אזל' : 'הזמן'}
                </a>
              </Button>
            </div>
          ))}
        </div>
        {tickets.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tickets">
                צפה בכל הכרטיסים ({tickets.length})
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
