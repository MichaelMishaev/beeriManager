'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Search, X, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { AdminFormSection } from '@/components/features/admin'
import { SkillsResponsesTable } from './SkillsResponsesTable'
import { SkillsStatsCards } from './SkillsStatsCards'
import type {
  ContactPreference,
  SkillCategory,
  SkillResponseFilters,
  SkillResponsesListResponse,
} from '@/types/parent-skills'
import { CONTACT_PREFERENCES, SKILL_CATEGORIES } from '@/types/parent-skills'

export function SkillsAdminDashboard() {
  const t = useTranslations('admin.inbox.survey')
  const locale = useLocale()
  const [filters, setFilters] = useState<SkillResponseFilters>({})
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  // Skills sorted alphabetically in the active language (Hebrew order in he, as before)
  const sortedSkills = SKILL_CATEGORIES.map((value) => ({ value, label: t(`skills.${value}`) })).sort((a, b) =>
    a.label.localeCompare(b.label, locale)
  )

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
      alert(t('exportError'))
    }
  }

  return (
    <div className="space-y-4">
      {/* Export */}
      <Button onClick={handleExport} variant="outline" className="min-h-[44px] w-full gap-2 bg-white sm:w-auto">
        <Download className="h-4 w-4" aria-hidden="true" />
        {t('export')}
      </Button>

      {/* Statistics Cards */}
      {data?.stats && <SkillsStatsCards stats={data.stats} />}

      {/* Filters */}
      <AdminFormSection title={t('filterTitle')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search by name/notes/phone */}
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="ps-10 text-start"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                type="button"
                className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                aria-label={t('clearSearch')}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {debouncedSearch && debouncedSearch !== searchInput && (
              <div className="absolute -bottom-5 start-0 flex items-center gap-1 text-xs text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                <span>{t('searching')}</span>
              </div>
            )}
          </div>

          {/* Filter by skill */}
          <Select
            value={filters.skill || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, skill: value === 'all' ? undefined : (value as SkillCategory) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allSkills')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allSkills')}</SelectItem>
              {sortedSkills.map(({ value, label }) => (
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
              setFilters({
                ...filters,
                contact_preference: value === 'all' ? undefined : (value as ContactPreference),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allContacts')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allContacts')}</SelectItem>
              {CONTACT_PREFERENCES.map((pref) => (
                <SelectItem key={pref} value={pref}>
                  {t(`contact.${pref}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminFormSection>

      {/* Results */}
      <SkillsResponsesTable responses={data?.data || []} isLoading={isLoading} onResponseDeleted={() => refetch()} />
    </div>
  )
}
