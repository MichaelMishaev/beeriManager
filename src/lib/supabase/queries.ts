import { supabase } from './client'
import { createServerClient } from './server'
import type { Event, Task, Issue, Protocol, Expense, Vendor, DashboardStats } from '@/types'

// Events queries
export async function getEvents(filters?: {
  status?: string
  type?: string
  upcoming?: boolean
}) {
  let query = supabase.from('events').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.type) {
    query = query.eq('event_type', filters.type)
  }

  if (filters?.upcoming) {
    query = query
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
  }

  query = query.is('archived_at', null)

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`)
  }

  return data as Event[]
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .is('archived_at', null)
    .single()

  if (error) {
    throw new Error(`Failed to fetch event: ${error.message}`)
  }

  return data as Event
}

export async function createEvent(eventData: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`)
  }

  return data as Event
}

export async function updateEvent(id: string, eventData: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`)
  }

  return data as Event
}

// Tasks queries
export async function getTasks(filters?: {
  status?: string
  owner?: string
  eventId?: string
}) {
  let query = supabase.from('tasks').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.owner) {
    query = query.eq('owner_name', filters.owner)
  }

  if (filters?.eventId) {
    query = query.eq('event_id', filters.eventId)
  }

  query = query.is('archived_at', null).order('due_date', { ascending: true })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`)
  }

  return data as Task[]
}

export async function getTaskById(id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .is('archived_at', null)
    .single()

  if (error) {
    throw new Error(`Failed to fetch task: ${error.message}`)
  }

  return data as Task
}

export async function createTask(taskData: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`)
  }

  return data as Task
}

// Issues queries
export async function getIssues(filters?: {
  status?: string
  priority?: string
  category?: string
}) {
  let query = supabase.from('issues').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  query = query.is('archived_at', null).order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch issues: ${error.message}`)
  }

  return data as Issue[]
}

export async function getIssueById(id: string) {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      comments:issue_comments(*)
    `)
    .eq('id', id)
    .is('archived_at', null)
    .single()

  if (error) {
    throw new Error(`Failed to fetch issue: ${error.message}`)
  }

  return data
}

// Protocols queries
export async function getProtocols(filters?: {
  year?: number
  category?: string
  search?: string
}) {
  let query = supabase.from('protocols').select('*')

  if (filters?.year) {
    query = query.eq('year', filters.year)
  }

  if (filters?.category) {
    query = query.contains('categories', [filters.category])
  }

  if (filters?.search) {
    query = query.textSearch('search_vector', filters.search)
  }

  query = query
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch protocols: ${error.message}`)
  }

  return data as Protocol[]
}

// Expenses queries
export async function getExpenses(filters?: {
  status?: string
  requester?: string
  eventId?: string
}) {
  let query = supabase.from('expenses').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.requester) {
    query = query.eq('requester_name', filters.requester)
  }

  if (filters?.eventId) {
    query = query.eq('event_id', filters.eventId)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`)
  }

  return data as Expense[]
}

// Vendors queries
export async function getVendors(filters?: {
  category?: string
  status?: string
  preferred?: boolean
}) {
  let query = supabase.from('vendors').select('*')

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.preferred) {
    query = query.eq('is_preferred', filters.preferred)
  }

  query = query.order('name', { ascending: true })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch vendors: ${error.message}`)
  }

  return data as Vendor[]
}

// Dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .rpc('get_dashboard_stats')

  if (error) {
    throw new Error(`Failed to fetch dashboard stats: ${error.message}`)
  }

  return data as DashboardStats
}

// Search across all entities
export async function globalSearch(query: string) {
  // Search events
  const { data: events } = await supabase
    .from('events')
    .select('id, title, description')
    .textSearch('title,description', query)
    .is('archived_at', null)
    .limit(5)

  // Search tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, description')
    .textSearch('title,description', query)
    .is('archived_at', null)
    .limit(5)

  // Search issues
  const { data: issues } = await supabase
    .from('issues')
    .select('id, title, description')
    .textSearch('title,description', query)
    .is('archived_at', null)
    .limit(5)

  // Search protocols
  const { data: protocols } = await supabase
    .from('protocols')
    .select('id, title, summary')
    .textSearch('search_vector', query)
    .eq('is_public', true)
    .limit(5)

  return {
    events: events || [],
    tasks: tasks || [],
    issues: issues || [],
    protocols: protocols || []
  }
}