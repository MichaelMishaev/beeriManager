// Core database types
export interface Event {
  id: string
  title: string
  description?: string
  start_datetime: string
  end_datetime?: string
  location?: string

  // Recurring events
  recurrence_rule?: string
  recurrence_parent_id?: string
  recurrence_exception_dates?: string[]

  // Registration & Attendance
  registration_form_config?: RegistrationFormConfig
  registration_enabled: boolean
  registration_deadline?: string
  max_attendees?: number
  current_attendees: number
  qr_code_url?: string

  // RSVP
  rsvp_yes_count: number
  rsvp_no_count: number
  rsvp_maybe_count: number

  // Volunteer management
  volunteer_slots?: VolunteerSlot[]

  // Event metadata
  event_type: 'general' | 'meeting' | 'fundraiser' | 'trip' | 'workshop'
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  visibility: 'public' | 'committee_only' | 'admin_only'
  priority: 'low' | 'normal' | 'high' | 'urgent'

  // Financial
  budget_allocated?: number
  budget_spent: number
  requires_payment: boolean
  payment_amount?: number
  payment_link?: string

  // Relationships
  meeting_agenda_id?: string

  // Photos
  photos_url?: string

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  version: number
  archived_at?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  owner_name: string
  owner_phone?: string

  // Dates
  due_date: string
  reminder_date?: string
  completed_at?: string

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
  priority: 'low' | 'normal' | 'high' | 'urgent'

  // Relationships
  event_id?: string
  parent_task_id?: string

  // Attachments
  attachment_urls?: string[]

  // Follow-up
  follow_up_count: number
  last_follow_up_at?: string
  auto_remind: boolean

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  completed_by?: string
  version: number
  archived_at?: string
}

export interface Responsibility {
  id: string
  person_name: string
  person_phone?: string
  role_title: string
  description?: string

  // Duration
  start_date: string
  end_date?: string
  is_active: boolean

  // Type
  responsibility_type?: 'permanent' | 'event_specific' | 'rotating'
  rotation_schedule?: string

  // Backup
  backup_person_name?: string
  backup_person_phone?: string

  // Relationships
  event_id?: string

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  version: number
}

export interface Committee {
  id: string
  name: string
  description?: string
  color: string // hex color for visual indicator
  responsibilities: string[] // array of responsibility keywords
  members: string[] // array of member names

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  version: number
}

export interface Issue {
  id: string
  title: string
  description: string
  reporter_name?: string
  assigned_to?: string

  // Status & Priority
  status: 'open' | 'in_progress' | 'blocked' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'critical'
  category?: 'safety' | 'maintenance' | 'academic' | 'social' | 'financial' | 'other'

  // Resolution
  resolution?: string
  resolved_at?: string
  resolved_by?: string

  // Relationships
  event_id?: string
  task_id?: string

  // Voting
  upvotes: number

  // Audit
  created_at: string
  updated_at: string
  version: number
  archived_at?: string
}

export interface IssueComment {
  id: string
  issue_id: string
  author_name: string
  comment_text: string
  is_internal: boolean

  created_at: string
  updated_at: string
  edited: boolean
}

export interface Protocol {
  id: string
  title: string
  summary?: string
  full_text?: string

  // Categorization
  year: number
  academic_year: string
  categories: string[]
  tags: string[]

  // External documents
  document_urls: DocumentLink[]

  // Metadata
  protocol_date?: string
  protocol_number?: string
  is_public: boolean

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  version: number
}

export interface Expense {
  id: string
  title: string
  description?: string
  amount: number
  category?: 'supplies' | 'food' | 'transportation' | 'equipment' | 'services' | 'other'

  // Requester
  requester_name: string
  requester_phone?: string
  request_date: string
  needed_by_date?: string

  // Approval workflow
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'reimbursed'
  approver_name?: string
  approval_date?: string
  approval_notes?: string
  rejection_reason?: string

  // Payment
  payment_method?: 'cash' | 'transfer' | 'credit_card' | 'check'
  payment_date?: string
  payment_reference?: string

  // Documents
  receipt_urls: string[]
  invoice_url?: string
  approval_document_url?: string

  // Budget tracking
  budget_category?: string
  event_id?: string

  // Audit
  created_at: string
  updated_at: string
  version: number
}

export interface Vendor {
  id: string
  name: string
  category: 'catering' | 'entertainment' | 'transportation' | 'supplies' | 'services'
  description?: string

  // Contact
  contact_person?: string
  phone?: string
  email?: string
  website?: string
  address?: string

  // Business details
  business_number?: string
  tax_invoice: boolean

  // Pricing
  pricing_info?: string
  typical_cost_range?: string
  payment_terms?: string

  // Performance
  rating?: number
  total_events: number
  last_used_date?: string

  // Preferences
  is_preferred: boolean
  is_kosher: boolean
  notes?: string

  // Contracts
  contract_urls: string[]
  insurance_expiry?: string

  // Status
  status: 'active' | 'inactive' | 'blacklisted'
  blacklist_reason?: string

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  version: number
}

export interface Holiday {
  id: string
  name: string  // Hebrew name only
  description?: string

  // Dates
  start_date: string
  end_date: string

  // Metadata
  holiday_type: 'religious' | 'national' | 'school_break' | 'other'
  is_school_closed: boolean

  // Visual
  icon_emoji?: string
  color: string

  // Academic tracking
  academic_year: string
  hebrew_date?: string

  // Related event
  event_id?: string

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

// Form and UI types
export interface RegistrationFormConfig {
  fields: FormField[]
  submit_message?: string
  confirmation_email: boolean
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select fields
}

export interface VolunteerSlot {
  id: string
  role: string
  description?: string
  max_volunteers: number
  volunteers: VolunteerRegistration[]
  time_slot?: string
}

export interface VolunteerRegistration {
  name: string
  phone?: string
  email?: string
  notes?: string
}

export interface DocumentLink {
  title: string
  url: string
  type?: 'google_doc' | 'google_drive' | 'pdf' | 'other'
  uploaded_at: string
}

// API Response types
export interface ApiResponse<T> {
  success: true
  data: T
  meta?: {
    timestamp: string
    version: string
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    field?: string
  }
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

// Dashboard types
export interface DashboardStats {
  upcomingEvents: number
  pendingTasks: number
  activeIssues: number
  recentProtocols: number
  pendingExpenses: number
  thisMonthEvents: number
  activeCommittees?: number
}

// Calendar types
export interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'meeting' | 'trip' | 'fundraising' | 'event' | 'volunteer' | 'holiday'
  description?: string
  time?: string
  location?: string
}

// Auth types
export interface User {
  role: 'admin' | 'editor'
  name?: string
}

// Filter and search types
export interface FilterOptions {
  status?: string[]
  type?: string[]
  priority?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface SearchResult {
  type: 'event' | 'task' | 'issue' | 'protocol' | 'expense'
  id: string
  title: string
  description?: string
  url: string
  relevance: number
}