'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  Link2,
  Loader2,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  Package,
  Pencil
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GroceryEvent } from '@/types'

const PHONE_STORAGE_KEY = 'my-grocery-phone'
const SEARCH_RESULTS_KEY = 'my-grocery-results'
const PRODUCTION_URL = 'https://beeri.online'

export default function MyGroceryPage() {
  const t = useTranslations('myGrocery')
  const tNav = useTranslations('navigation')
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [lists, setLists] = useState<GroceryEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedPhone = sessionStorage.getItem(PHONE_STORAGE_KEY)
    const savedResults = sessionStorage.getItem(SEARCH_RESULTS_KEY)

    if (savedPhone) {
      setPhone(savedPhone)
    }
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults)
        setLists(parsed.lists || [])
        setHasSearched(parsed.hasSearched || false)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

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
    // Save phone to sessionStorage
    sessionStorage.setItem(PHONE_STORAGE_KEY, formatted)
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
      const response = await fetch(`/api/grocery/my-lists?phone=${normalizedPhone}`)
      const data = await response.json()

      if (data.success) {
        const results = data.data || []
        setLists(results)
        // Save results to sessionStorage
        sessionStorage.setItem(SEARCH_RESULTS_KEY, JSON.stringify({
          lists: results,
          hasSearched: true
        }))
      } else {
        setError(data.error || t('noResults'))
        setLists([])
        sessionStorage.setItem(SEARCH_RESULTS_KEY, JSON.stringify({
          lists: [],
          hasSearched: true
        }))
      }
    } catch {
      setError(t('noResults'))
      setLists([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleShareLinkGo = () => {
    if (!shareLink.trim()) return

    // Extract the path from the URL if it's a full URL
    try {
      const url = new URL(shareLink.includes('http') ? shareLink : `https://${shareLink}`)
      const path = url.pathname
      if (path.includes('/grocery/')) {
        router.push(path)
      }
    } catch {
      // If it's just a token, try to navigate directly
      if (shareLink.includes('/grocery/')) {
        router.push(shareLink)
      } else {
        // Assume it's just the token
        router.push(`/grocery/${shareLink}`)
      }
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return null
    return timeStr
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'completed':
        return 'bg-sky-100 text-sky-700 border-sky-200'
      case 'archived':
        return 'bg-slate-100 text-slate-600 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: t('statusActive'),
      completed: t('statusCompleted'),
      archived: t('statusArchived')
    }
    return labels[status] || status
  }

  const handleCopyLink = async (token: string) => {
    const url = `${PRODUCTION_URL}/grocery/${token}`
    await navigator.clipboard.writeText(url)
    // Could add toast notification here
  }

  const handleShareWhatsApp = (list: GroceryEvent) => {
    const url = `${PRODUCTION_URL}/grocery/${list.share_token}`
    const message = t('shareMessage', {
      eventName: list.event_name,
      className: list.class_name,
      url
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-emerald-600 transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            {tNav('home')}
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('title')}</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-md mx-auto">{t('pageDescription')}</p>
          </div>
        </div>

        {/* Search Card - Primary Action */}
        <Card className="mb-5 border-0 shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
                <Search className="h-5 w-5 text-emerald-600" />
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
                  className="text-lg h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
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
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
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

        {/* Share Link Card */}
        <Card className="mb-6 border-slate-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100">
                <Link2 className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">{t('haveShareLink')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://beeri.online/he/grocery/..."
                value={shareLink}
                onChange={(e) => setShareLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleShareLinkGo()}
                className="flex-1 h-11 border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 text-sm"
                dir="ltr"
              />
              <Button
                onClick={handleShareLinkGo}
                disabled={!shareLink.trim()}
                variant="outline"
                className="h-11 px-4 border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 disabled:opacity-50"
              >
                <ExternalLink className="h-4 w-4 ml-1" />
                {t('open')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {lists.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-medium text-slate-600">
                    {t('resultsFound', { count: lists.length })}
                  </p>
                </div>
                {lists.map((list) => (
                  <Card key={list.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-4 sm:p-5">
                      {/* Header - RTL: badge on left, title on right */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <Badge variant="outline" className={`${getStatusColor(list.status)} text-xs font-medium shrink-0`}>
                          {getStatusLabel(list.status)}
                        </Badge>
                        <div className="text-right flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900 truncate">{list.event_name}</h3>
                          <p className="text-sm text-slate-500">{list.class_name}</p>
                        </div>
                      </div>

                      {/* Details - Icons properly contained with RTL alignment */}
                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                        {list.event_date && (
                          <div className="flex items-center gap-2 justify-end">
                            <span>{formatDate(list.event_date)}</span>
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                          </div>
                        )}
                        {list.event_time && (
                          <div className="flex items-center gap-2 justify-end">
                            <span>{formatTime(list.event_time)}</span>
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          </div>
                        )}
                        {list.event_address && (
                          <div className="flex items-center gap-2 justify-end">
                            <span className="truncate">{list.event_address}</span>
                            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 justify-end">
                          <span>{t('itemsProgress', { claimed: list.claimed_items, total: list.total_items })}</span>
                          <Package className="h-4 w-4 text-slate-400 shrink-0" />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                            style={{ width: `${list.total_items > 0 ? (list.claimed_items / list.total_items) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px] text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => router.push(`/grocery/${list.share_token}`)}
                        >
                          <ExternalLink className="h-4 w-4 ml-1" />
                          {t('viewList')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px] text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => router.push(`/grocery/${list.share_token}/edit`)}
                        >
                          <Pencil className="h-4 w-4 ml-1" />
                          {t('editList')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px] text-slate-600 hover:bg-slate-50"
                          onClick={() => handleCopyLink(list.share_token)}
                        >
                          <Link2 className="h-4 w-4 ml-1" />
                          {t('copyLink')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleShareWhatsApp(list)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="border-0 shadow-md bg-slate-50/80">
                <CardContent className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 mb-4">
                    <ShoppingBag className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium">{t('noResults')}</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                    {t('noResultsDescription')}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push('/grocery')}
                  >
                    {t('createNew')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State Illustration - When not searched */}
        {!hasSearched && (
          <div className="text-center py-8 opacity-60">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 mb-4">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">{t('emptyStateHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
