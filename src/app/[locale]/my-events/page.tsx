'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Calendar, Clock, MapPin, ChevronLeft, Link2, Loader2, CalendarSearch, Sparkles, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditLinkShare } from '@/components/features/events/EditLinkShare'
import type { Event } from '@/types'

interface EventWithUrl extends Event {
  edit_url?: string | null
}

export default function MyEventsPage() {
  const t = useTranslations('myEvents')
  const tNav = useTranslations('navigation')
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [editLink, setEditLink] = useState('')
  const [events, setEvents] = useState<EventWithUrl[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizePhone = (value: string) => {
    return value.replace(/[^\d]/g, '')
  }

  const formatPhoneDisplay = (value: string) => {
    const digits = normalizePhone(value)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value)
    setPhone(formatted)
    setError(null)
  }

  const handleSearch = async () => {
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone || !/^05\d{8}$/.test(normalizedPhone)) {
      setError(t('invalidPhoneDescription'))
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/events/my-events?phone=${normalizedPhone}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.data || [])
      } else {
        setError(data.error || t('noResults'))
        setEvents([])
      }
    } catch {
      setError(t('noResults'))
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleEditLinkGo = () => {
    if (!editLink.trim()) return

    // Extract the path from the URL if it's a full URL
    try {
      const url = new URL(editLink.includes('http') ? editLink : `https://${editLink}`)
      const path = url.pathname
      if (path.includes('/events/edit/')) {
        router.push(path)
      }
    } catch {
      // If it's just a token, try to navigate directly
      if (editLink.includes('/events/edit/')) {
        router.push(editLink)
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'draft':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'ongoing':
        return 'bg-sky-100 text-sky-700 border-sky-200'
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-200'
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      published: 'פורסם',
      draft: 'טיוטה',
      ongoing: 'מתקיים',
      completed: 'הסתיים',
      cancelled: 'בוטל'
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-sky-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-sky-600 transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            {tNav('home')}
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/25 mb-4">
              <CalendarSearch className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('title')}</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-md mx-auto">{t('pageDescription')}</p>
          </div>
        </div>

        {/* Search Card - Primary Action */}
        <Card className="mb-5 border-0 shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500" />
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100">
                <Search className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">{t('subtitle')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('phoneLabel')}
                </label>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder={t('phonePlaceholder')}
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyPress={handleKeyPress}
                  className="text-lg h-12 border-slate-200 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
                  dir="ltr"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {t('phoneHelperText')}
                </p>
                {error && (
                  <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-rose-50 border border-rose-200">
                    <span className="text-sm text-rose-600">{error}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading || !phone}
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-sky-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin ml-2" />
                    {t('searching')}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 ml-2" />
                    {t('search')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-sm text-slate-400 font-medium">{t('orUseLink')}</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Edit Link Card - Now Actionable */}
        <Card className="mb-6 border-slate-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100">
                <Link2 className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">{t('haveEditLink')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://beeri.online/he/events/edit/..."
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEditLinkGo()}
                className="flex-1 h-11 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                dir="ltr"
              />
              <Button
                onClick={handleEditLinkGo}
                disabled={!editLink.trim()}
                variant="outline"
                className="h-11 px-4 border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 disabled:opacity-50"
              >
                <ExternalLink className="h-4 w-4 ml-1" />
                פתח
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {events.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  <p className="text-sm font-medium text-slate-600">
                    {t('resultsFound', { count: events.length })}
                  </p>
                </div>
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                        <Badge variant="outline" className={`${getStatusColor(event.status)} text-xs font-medium`}>
                          {getStatusLabel(event.status)}
                        </Badge>
                      </div>

                      <div className="space-y-2.5 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{formatDate(event.start_datetime)}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{formatTime(event.start_datetime)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.edit_token && (
                        <EditLinkShare
                          token={event.edit_token}
                          eventTitle={event.title}
                          variant="compact"
                          className="pt-4 border-t border-slate-100"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="border-0 shadow-md bg-slate-50/80">
                <CardContent className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-4">
                    <CalendarSearch className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium">{t('noResults')}</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                    {t('noResultsDescription')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State Illustration - When not searched */}
        {!hasSearched && (
          <div className="text-center py-8 opacity-60">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 mb-4">
              <CalendarSearch className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">הזינו מספר טלפון או קישור עריכה</p>
          </div>
        )}
      </div>
    </div>
  )
}
