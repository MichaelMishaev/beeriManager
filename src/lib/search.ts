/**
 * Advanced Search Utility
 * Provides full-text search across multiple entities
 */

import { createClient } from '@/lib/supabase/client'

export interface SearchOptions {
  query: string
  types?: SearchType[]
  limit?: number
  offset?: number
}

export type SearchType = 'events' | 'tasks' | 'issues' | 'protocols' | 'vendors' | 'all'

export interface SearchResult {
  id: string
  type: SearchType
  title: string
  description?: string
  url: string
  highlight?: string
  date?: string
  metadata?: Record<string, any>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  hasMore: boolean
}

/**
 * Perform a full-text search across specified entity types
 */
export async function performSearch(options: SearchOptions): Promise<SearchResponse> {
  const { query, types = ['all'], limit = 20, offset = 0 } = options

  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, hasMore: false }
  }

  const supabase = createClient()
  const searchTerm = `%${query.trim()}%`
  const allResults: SearchResult[] = []

  // Determine which types to search
  const searchTypes = types.includes('all')
    ? (['events', 'tasks', 'issues', 'protocols', 'vendors'] as SearchType[])
    : types

  // Search Events
  if (searchTypes.includes('events')) {
    const { data: events } = await supabase
      .from('events')
      .select('id, title, description, start_datetime, location')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .eq('status', 'published')
      .limit(limit)

    if (events) {
      allResults.push(...events.map(event => ({
        id: event.id,
        type: 'events' as SearchType,
        title: event.title,
        description: event.description,
        url: `/events/${event.id}`,
        highlight: highlightMatch(event.title, query) || highlightMatch(event.description, query),
        date: event.start_datetime,
        metadata: { location: event.location }
      })))
    }
  }

  // Search Tasks
  if (searchTypes.includes('tasks')) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, description, due_date, assigned_to')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit)

    if (tasks) {
      allResults.push(...tasks.map(task => ({
        id: task.id,
        type: 'tasks' as SearchType,
        title: task.title,
        description: task.description,
        url: `/tasks/${task.id}`,
        highlight: highlightMatch(task.title, query) || highlightMatch(task.description, query),
        date: task.due_date,
        metadata: { assignedTo: task.assigned_to }
      })))
    }
  }

  // Search Issues
  if (searchTypes.includes('issues')) {
    const { data: issues } = await supabase
      .from('issues')
      .select('id, title, description, created_at, priority')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit)

    if (issues) {
      allResults.push(...issues.map(issue => ({
        id: issue.id,
        type: 'issues' as SearchType,
        title: issue.title,
        description: issue.description,
        url: `/issues/${issue.id}`,
        highlight: highlightMatch(issue.title, query) || highlightMatch(issue.description, query),
        date: issue.created_at,
        metadata: { priority: issue.priority }
      })))
    }
  }

  // Search Protocols
  if (searchTypes.includes('protocols')) {
    const { data: protocols } = await supabase
      .from('protocols')
      .select('id, title, summary, protocol_date')
      .or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .eq('is_public', true)
      .limit(limit)

    if (protocols) {
      allResults.push(...protocols.map(protocol => ({
        id: protocol.id,
        type: 'protocols' as SearchType,
        title: protocol.title,
        description: protocol.summary,
        url: `/protocols/${protocol.id}`,
        highlight: highlightMatch(protocol.title, query) || highlightMatch(protocol.summary, query),
        date: protocol.protocol_date
      })))
    }
  }

  // Search Vendors
  if (searchTypes.includes('vendors')) {
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id, name, description, category')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .eq('is_active', true)
      .limit(limit)

    if (vendors) {
      allResults.push(...vendors.map(vendor => ({
        id: vendor.id,
        type: 'vendors' as SearchType,
        title: vendor.name,
        description: vendor.description,
        url: `/admin/vendors/${vendor.id}`,
        highlight: highlightMatch(vendor.name, query) || highlightMatch(vendor.description, query),
        metadata: { category: vendor.category }
      })))
    }
  }

  // Sort by relevance (title matches first, then by date)
  allResults.sort((a, b) => {
    const aInTitle = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
    const bInTitle = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0

    if (aInTitle !== bInTitle) {
      return bInTitle - aInTitle
    }

    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }

    return 0
  })

  // Apply pagination
  const paginatedResults = allResults.slice(offset, offset + limit)
  const hasMore = allResults.length > offset + limit

  return {
    results: paginatedResults,
    total: allResults.length,
    hasMore
  }
}

/**
 * Highlight matching text in a string
 */
function highlightMatch(text: string | null | undefined, query: string): string | undefined {
  if (!text) return undefined

  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return undefined

  const start = Math.max(0, index - 30)
  const end = Math.min(text.length, index + query.length + 30)

  let snippet = text.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const supabase = createClient()
  const searchTerm = `${query.trim()}%`
  const suggestions = new Set<string>()

  // Get event titles
  const { data: events } = await supabase
    .from('events')
    .select('title')
    .ilike('title', searchTerm)
    .eq('status', 'published')
    .limit(limit)

  events?.forEach(e => suggestions.add(e.title))

  // Get task titles
  const { data: tasks } = await supabase
    .from('tasks')
    .select('title')
    .ilike('title', searchTerm)
    .limit(limit)

  tasks?.forEach(t => suggestions.add(t.title))

  // Get protocol titles
  const { data: protocols } = await supabase
    .from('protocols')
    .select('title')
    .ilike('title', searchTerm)
    .eq('is_public', true)
    .limit(limit)

  protocols?.forEach(p => suggestions.add(p.title))

  return Array.from(suggestions).slice(0, limit)
}

/**
 * Search history storage (localStorage)
 */
export const SearchHistory = {
  key: 'beeri-search-history',
  maxItems: 10,

  get(): string[] {
    if (typeof window === 'undefined') return []
    try {
      const history = localStorage.getItem(this.key)
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  },

  add(query: string): void {
    if (typeof window === 'undefined' || !query.trim()) return

    const history = this.get()
    const filtered = history.filter(q => q !== query)
    const updated = [query, ...filtered].slice(0, this.maxItems)

    try {
      localStorage.setItem(this.key, JSON.stringify(updated))
    } catch {
      // Ignore storage errors
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(this.key)
    } catch {
      // Ignore storage errors
    }
  }
}