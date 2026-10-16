'use client'

import { Ticket as TicketIcon, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TicketPlaceholderImage } from './TicketPlaceholderImage'
import Link from 'next/link'
import type { Ticket } from '@/types'
import { duoCard, DuoButton, DuoIconTile, DuoTag } from '@/components/ui/duo'

interface TicketsSectionProps {
  tickets: Ticket[]
}

export function TicketsSection({ tickets }: TicketsSectionProps) {
  // Empty state - show beautiful message
  if (tickets.length === 0) {
    return (
      <Card className={duoCard}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DuoIconTile icon={TicketIcon} tone="orange" />
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
    <Card className={duoCard}>
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
        <div>
          <div className="flex items-center gap-3">
            <DuoIconTile icon={TicketIcon} tone="orange" />
            <CardTitle className="text-xl font-extrabold text-[#003153]">
              כרטיסים זמינים
            </CardTitle>
          </div>
          <CardDescription className="text-sm md:text-base font-medium mt-2">
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
      <CardContent className="p-5 pt-2">
        <div className="space-y-3">
          {tickets.slice(0, 3).map((ticket) => {
            const isSoldOut = ticket.status === 'sold_out'
            const isFree = !(ticket.price_per_ticket !== null && ticket.price_per_ticket !== undefined && ticket.price_per_ticket > 0)
            return (
              <div key={ticket.id} className="rounded-2xl border-2 border-[#e5e5e5] p-3 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0">
                    {ticket.image_url ? (
                      <img
                        src={ticket.image_url}
                        alt={ticket.title}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#e5e5e5]"
                      />
                    ) : (
                      <TicketPlaceholderImage size="sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base text-[#003153] leading-tight mb-1.5">
                      {ticket.title}
                    </h3>
                    {ticket.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {isFree ? (
                        <DuoTag tone="green">חינם</DuoTag>
                      ) : (
                        <DuoTag tone="yellow">₪{ticket.price_per_ticket}</DuoTag>
                      )}
                      {isSoldOut && <DuoTag tone="red">אזל מהמלאי</DuoTag>}
                    </div>
                  </div>
                </div>
                {/* Sold out → real disabled <button>; `disabled` on an asChild <a> did nothing */}
                {isSoldOut ? (
                  <DuoButton variant="white" disabled className="w-full">
                    <TicketIcon className="h-5 w-5" />
                    אזל מהמלאי
                  </DuoButton>
                ) : (
                  <DuoButton variant="teal" asChild className="w-full">
                    <a href={ticket.purchase_url} target="_blank" rel="noopener noreferrer">
                      <TicketIcon className="h-5 w-5" />
                      הזמן כרטיס
                    </a>
                  </DuoButton>
                )}
              </div>
            )
          })}
        </div>
        {tickets.length > 3 && (
          <div className="mt-4 text-center">
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
