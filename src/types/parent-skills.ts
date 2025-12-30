// Parent Skill Directory - TypeScript Type Definitions

// Database enums - School-specific parent volunteer skills
export const SKILL_CATEGORIES = [
  // Professional Services
  'legal',
  'medical',
  'accounting',
  'it_technology',

  // Education & Tutoring
  'teaching_tutoring',
  'language_tutoring',
  'science_stem',
  'library_support',

  // Creative & Media
  'photography',
  'graphic_design',
  'video_editing',
  'arts',
  'music',
  'writing_editing',

  // Event & Communication
  'event_planning',
  'cooking_catering',
  'social_media',
  'translation',

  // Practical Skills
  'handyman',
  'sewing_fashion',
  'driving_transport',
  'gardening',

  // School Support
  'sports_coaching',
  'childcare',
  'fundraising',
  'office_admin',

  'other',
] as const

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

export const CONTACT_PREFERENCES = ['phone', 'email', 'whatsapp', 'any'] as const

export type ContactPreference = (typeof CONTACT_PREFERENCES)[number]

// Israeli school grades (א through יב - grades 1-12)
export const GRADE_LEVELS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו',  // Elementary 1-6
  'ז', 'ח', 'ט',                  // Middle 7-9
  'י', 'יא', 'יב'                 // High 10-12
] as const

export type GradeLevel = (typeof GRADE_LEVELS)[number]

// School/Organization (for future SaaS support)
export interface School {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

// Database row type - matches parent_skill_responses table
export interface ParentSkillResponse {
  id: string
  school_id: string // NEW: Required school association for multi-tenancy
  parent_name: string | null
  phone_number: string
  email: string | null
  skills: SkillCategory[]
  student_grade: GradeLevel | null // Grade/class of the parent's child
  preferred_contact: ContactPreference
  additional_notes: string | null
  other_specialty: string | null
  submitted_locale: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
}

// Form submission type (what we send to API)
export interface SkillSurveyFormData {
  parent_name?: string
  phone_number?: string
  email?: string
  skills: SkillCategory[]
  student_grade: GradeLevel
  preferred_contact: ContactPreference
  additional_notes?: string
  other_specialty?: string
}

// Admin search/filter params
export interface SkillResponseFilters {
  skill?: SkillCategory
  contact_preference?: ContactPreference
  search?: string // Search in parent_name and additional_notes
  date_from?: string
  date_to?: string
}

// Statistics for admin dashboard
export interface SkillResponseStats {
  total_responses: number
  skill_breakdown: Record<SkillCategory, number>
  contact_breakdown: Record<ContactPreference, number>
  anonymous_count: number
  recent_responses: number // Last 7 days
}

// API response types
export interface SkillSurveySubmitResponse {
  success: boolean
  message: string
  response_id?: string
  errors?: Record<string, string[]>
}

export interface SkillResponsesListResponse {
  success: boolean
  data: ParentSkillResponse[]
  stats: SkillResponseStats
  total: number
  message?: string
}

// Skill category labels in Hebrew (for display)
export const SKILL_NAMES_HE: Record<SkillCategory, string> = {
  // Professional Services
  legal: 'משפטי',
  medical: 'רפואי',
  accounting: 'חשבונאות',
  it_technology: 'IT וטכנולוגיה',

  // Education & Tutoring
  teaching_tutoring: 'הוראה ושיעורים',
  language_tutoring: 'שיעורי שפות',
  science_stem: 'מדע וטכנולוגיה STEM',
  library_support: 'סיוע בספרייה',

  // Creative & Media
  photography: 'צילום',
  graphic_design: 'גרפיקה ועיצוב',
  video_editing: 'עריכת וידאו',
  arts: 'אומנות וצביעה',
  music: 'מוזיקה',
  writing_editing: 'כתיבה ועריכה',

  // Event & Communication
  event_planning: 'תכנון אירועים',
  cooking_catering: 'בישול והסעדה',
  social_media: 'ניהול רשתות חברתיות',
  translation: 'תרגום',

  // Practical Skills
  handyman: 'שיפוצים ותיקונים',
  sewing_fashion: 'תפירה ואופנה',
  driving_transport: 'נהיגה והסעות',
  gardening: 'גינון',

  // School Support
  sports_coaching: 'אימון ספורט',
  childcare: 'שמרטפות',
  fundraising: 'גיוס כספים',
  office_admin: 'מזכירות וניהול',

  other: 'אחר',
}

// Contact preference labels in Hebrew
export const CONTACT_PREF_NAMES_HE: Record<ContactPreference, string> = {
  phone: 'טלפון',
  email: 'אימייל',
  whatsapp: 'WhatsApp',
  any: 'כל אמצעי',
}
