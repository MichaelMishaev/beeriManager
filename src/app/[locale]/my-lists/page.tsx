'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search, ShoppingCart, Calendar, MapPin, ChevronLeft, Loader2, Users, Clock, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GroceryProgressBar } from '@/components/features/grocery/GroceryProgressBar'
import type { GroceryEvent } from '@/types'

const PHONE_STORAGE_KEY = 'beeri_my_lists_phone'

export default function MyListsPage() {
  const t = useTranslations('grocery')
  const tNav = useTranslations('navigation')

  const [phone, setPhone] = useState('')
  const [lists, setLists] = useState<GroceryEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPhone = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    setError(null)
  }

  const searchByPhone = useCallback(async (phoneToSearch: string) => {
    const normalizedPhone = phoneToSearch.replace(/\D/g, '')

    if (!normalizedPhone || !/^05\d{8}$/.test(normalizedPhone)) {
      setError(t('invalidPhone'))
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/grocery/my-lists?phone=${normalizedPhone}`)
      const data = await response.json()

      if (data.success) {
        setLists(data.data || [])
        // Save phone to localStorage on successful search
        localStorage.setItem(PHONE_STORAGE_KEY, normalizedPhone)
      } else {
        setError(data.error || t('noListsFound'))
        setLists([])
      }
    } catch {
      setError(t('noListsFound'))
      setLists([])
    } finally {
      setIsLoading(false)
    }
  }, [t])

  const handleSearch = () => {
    searchByPhone(phone)
  }

  // Load phone from localStorage and auto-search on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem(PHONE_STORAGE_KEY)
    if (savedPhone) {
      const formattedPhone = formatPhone(savedPhone)
      setPhone(formattedPhone)
      // Auto-search with saved phone
      searchByPhone(savedPhone)
    }
  }, [searchByPhone])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'פעיל',
      completed: 'הושלם',
      archived: 'בארכיון'
    }
    return labels[status] || status
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          {tNav('home')}
        </Link>
        <h1 className="text-2xl font-bold">{t('myListsTitle')}</h1>
        <p className="text-muted-foreground mt-1">{t('myListsDescription')}</p>
      </div>

      {/* Search Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{t('searchByPhone')}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('phoneLabel')}
              </label>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="050-000-0000"
                value={phone}
                onChange={handlePhoneChange}
                onKeyPress={handleKeyPress}
                className="text-lg text-center"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('phoneHint')}
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>

            <Button
              onClick={handleSearch}
              disabled={isLoading || !phone}
              className="w-full bg-[#13ec80] hover:bg-[#10d970] text-[#0d1b14]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  {t('searching')}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 ml-2" />
                  {t('search')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {lists.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {t('listsFound', { count: lists.length })}
              </p>
              {lists.map((list) => (
                <Card key={list.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Header - RTL aligned */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge className={`${getStatusColor(list.status)} shrink-0`}>
                        {getStatusLabel(list.status)}
                      </Badge>
                      <div className="flex items-center gap-2 text-right min-w-0 flex-1 justify-end">
                        <h3 className="font-semibold text-lg truncate">{list.event_name}</h3>
                        <ShoppingCart className="h-5 w-5 text-[#13ec80] shrink-0" />
                      </div>
                    </div>

                    {/* Details - Icons properly contained */}
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2 justify-end">
                        <span>{list.class_name}</span>
                        <Users className="h-4 w-4 shrink-0" />
                      </div>
                      {list.event_date && (
                        <div className="flex items-center gap-2 justify-end">
                          <span>{formatDate(list.event_date)}</span>
                          <Calendar className="h-4 w-4 shrink-0" />
                        </div>
                      )}
                      {list.event_address && (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="truncate">{list.event_address}</span>
                          <MapPin className="h-4 w-4 shrink-0" />
                        </div>
                      )}
                      {list.created_at && (
                        <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground/70">
                          <span>{t('createdAt', { date: formatDate(list.created_at) })}</span>
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                        </div>
                      )}
                    </div>

                    <GroceryProgressBar
                      claimed={list.claimed_items}
                      total={list.total_items}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Link href={`/grocery/${list.share_token}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-9 text-sm">
                          <Eye className="h-4 w-4 ml-1.5" />
                          {t('viewList')}
                        </Button>
                      </Link>
                      <Link href={`/grocery/${list.share_token}/edit`} className="flex-1">
                        <Button size="sm" className="w-full h-9 text-sm bg-blue-500 hover:bg-blue-600 text-white">
                          <Pencil className="h-4 w-4 ml-1.5" />
                          {t('editList')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted-foreground">{t('noListsFound')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('noListsFoundDescription')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
