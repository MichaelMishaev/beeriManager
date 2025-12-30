'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Search, X, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { SkillsResponsesTable } from './SkillsResponsesTable'
import { SkillsStatsCards } from './SkillsStatsCards'
import type { SkillResponseFilters, SkillResponsesListResponse } from '@/types/parent-skills'
import { CONTACT_PREFERENCES } from '@/types/parent-skills'
import { getSortedSkillsWithNames } from '@/lib/utils/skills-sorting'

export function SkillsAdminDashboard() {
  const [filters, setFilters] = useState<SkillResponseFilters>({})
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch || undefined }))
  }, [debouncedSearch])

  // Fetch responses with filters
  const { data, isLoading, refetch } = useQuery<SkillResponsesListResponse>({
    queryKey: ['skill-responses', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.skill) params.append('skill', filters.skill)
      if (filters.contact_preference) params.append('contact_preference', filters.contact_preference)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/surveys/skills?${params}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch responses')
      return response.json()
    },
  })

  const handleExport = async () => {
    try {
      const response = await fetch('/api/surveys/skills/export', {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `parent-skills-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('שגיאה ביצוא הנתונים')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">מאגר מיומנויות הורים</h1>
          <p className="text-gray-600 mt-1">ניהול תשובות וחיפוש מתנדבים</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          ייצא לאקסל
        </Button>
      </div>

      {/* Statistics Cards */}
      {data?.stats && <SkillsStatsCards stats={data.stats} />}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">חיפוש וסינון</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by name/notes/phone */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="חיפוש לפי שם, טלפון, הערות..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-10 text-right"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="נקה חיפוש"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {debouncedSearch && debouncedSearch !== searchInput && (
                <div className="absolute -bottom-5 right-0 text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>מחפש...</span>
                </div>
              )}
            </div>

            {/* Filter by skill */}
            <Select
              value={filters.skill || 'all'}
              onValueChange={(value) => setFilters({ ...filters, skill: value === 'all' ? undefined : (value as any) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="כל המיומנויות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המיומנויות</SelectItem>
                {getSortedSkillsWithNames().map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter by contact preference */}
            <Select
              value={filters.contact_preference || 'all'}
              onValueChange={(value) =>
                setFilters({ ...filters, contact_preference: value === 'all' ? undefined : (value as any) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="כל אמצעי יצירת הקשר" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל אמצעי יצירת הקשר</SelectItem>
                {CONTACT_PREFERENCES.map((pref) => (
                  <SelectItem key={pref} value={pref}>
                    {pref === 'phone' && 'טלפון'}
                    {pref === 'email' && 'אימייל'}
                    {pref === 'whatsapp' && 'WhatsApp'}
                    {pref === 'any' && 'כל אמצעי'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <SkillsResponsesTable responses={data?.data || []} isLoading={isLoading} onResponseDeleted={() => refetch()} />
    </div>
  )
}
