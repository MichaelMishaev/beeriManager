// Core database types
export interface Event {
  id: string
  title: string
  title_ru?: string
  description?: string
  description_ru?: string
  start_datetime: string
  end_datetime?: string
  location?: string
  location_ru?: string

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
  due_date?: string
  reminder_date?: string
  completed_at?: string

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'
  priority: 'low' | 'normal' | 'high' | 'urgent'

  // Relationships
  event_id?: string
  parent_task_id?: string

  // Tags (multi-tag categorization)
  tags?: Tag[]

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
  name: string
  hebrew_name: string
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
  isSchoolClosed?: boolean // For holidays - indicates if school is closed
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

export interface Ticket {
  id: string

  // Basic info
  title: string
  description?: string

  // Game/Event details
  event_type: 'sport' | 'theater' | 'concert' | 'other'
  sport_type?: string // 'soccer', 'basketball', 'volleyball', etc.
  team_home?: string
  team_away?: string
  venue?: string
  event_date?: string

  // Ticket details
  image_url?: string
  purchase_url: string
  quantity_available?: number // null = unlimited
  quantity_sold: number
  price_per_ticket?: number // null = free

  // Status
  status: 'active' | 'sold_out' | 'expired' | 'draft' | 'finished'

  // Display settings
  featured: boolean
  display_order: number

  // Metadata
  created_at: string
  updated_at: string
  created_by?: string
}

// Tag types for task categorization
export interface Tag {
  id: string
  name: string // English identifier (e.g., 'maintenance')
  name_he: string // Hebrew display name (e.g., 'תחזוקה')
  emoji?: string // Optional emoji (e.g., '🔧')
  color: string // Hex color code (e.g., '#FF8200')
  description?: string
  display_order: number
  task_count: number // Number of tasks using this tag
  is_system: boolean // System tags cannot be deleted
  is_active: boolean

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  version: number
}

export interface TaskTag {
  id: string
  task_id: string
  tag_id: string
  created_at: string
  created_by?: string
}

export interface Contact {
  id: string
  name: string
  name_ru?: string
  role: string
  role_ru?: string
  phone?: string
  email?: string
  category: 'nurse' | 'admin' | 'teacher' | 'committee' | 'service'
  sort_order: number
  is_public: boolean

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
}

export interface UrgentMessage {
  id: string
  type: 'white_shirt' | 'urgent' | 'info' | 'warning'
  title_he: string
  title_ru: string
  description_he?: string
  description_ru?: string

  // Display settings
  is_active: boolean
  start_date: string // ISO date
  end_date: string // ISO date

  // Visual
  icon?: string // emoji
  color: string // CSS color class (e.g., 'bg-yellow-50')

  // Sharing
  share_text_he?: string
  share_text_ru?: string

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Highlight {
  id: string
  type: 'achievement' | 'sports' | 'award' | 'event' | 'announcement'
  icon: string // Emoji icon

  // Bilingual content
  title_he: string
  title_ru: string
  description_he: string
  description_ru: string
  category_he: string
  category_ru: string

  // Optional fields
  event_date?: string // ISO date for future events or past achievements
  image_url?: string // Optional image URL (future feature)
  image_placeholder?: string // Emoji or icon as placeholder

  // Call-to-action
  cta_text_he?: string
  cta_text_ru?: string
  cta_link?: string

  // Badge styling
  badge_color: string // Tailwind CSS classes (e.g., 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900')

  // Display settings
  is_active: boolean
  display_order: number // Lower numbers appear first
  start_date?: string // ISO timestamp - when to start showing (optional)
  end_date?: string // ISO timestamp - when to stop showing (optional)

  // Share settings
  share_text_he?: string
  share_text_ru?: string

  // Metadata
  created_by?: string
  created_at: string
  updated_at: string
}

// Meeting Ideas Submission System
export interface Meeting {
  id: string
  title: string
  meeting_date: string
  description?: string

  // Status
  status: 'draft' | 'open' | 'closed' | 'completed'
  is_open: boolean

  // Metadata
  created_at: string
  updated_at: string
  created_by?: string
  closed_at?: string

  // Stats
  ideas_count: number
  version: number
}

export interface MeetingIdea {
  id: string
  meeting_id: string

  // Content
  title: string
  description?: string

  // Submitter
  submitter_name?: string
  is_anonymous: boolean

  // Locale
  submission_locale: string

  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================================================
// Grocery Events (Items Pickup) - Public sharing via WhatsApp
// ============================================================================

export interface GroceryEvent {
  id: string
  share_token: string // URL-friendly 8-char token

  // Event details
  class_name: string // e.g., "כיתה ג'2"
  event_name: string // e.g., "מסיבת סוף שנה"
  event_date?: string // ISO date
  event_time?: string // ISO time
  event_address?: string

  // Creator info (optional)
  creator_name?: string

  // Status
  status: 'active' | 'completed' | 'archived'

  // Stats (denormalized)
  total_items: number
  claimed_items: number

  // Timestamps
  created_at: string
  updated_at: string

  // Joined data
  items?: GroceryItem[]
}

export interface GroceryItem {
  id: string
  grocery_event_id: string

  // Item details
  item_name: string // e.g., "חלב"
  quantity: number // e.g., 3
  notes?: string

  // Claiming
  claimed_by?: string // Name of person who claimed
  claimed_at?: string // ISO timestamp

  // Display
  display_order: number

  // Timestamps
  created_at: string
  updated_at: string
}

// Form types for grocery
export interface CreateGroceryEventForm {
  class_name: string
  event_name: string
  event_date?: string
  event_time?: string
  event_address?: string
  creator_name?: string
}

export interface CreateGroceryItemForm {
  item_name: string
  quantity: number
  notes?: string
}

export interface ClaimGroceryItemForm {
  claimer_name: string
}