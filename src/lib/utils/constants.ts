export const APP_CONFIG = {
  name: 'BeeriManager',
  description: 'מערכת ניהול ועד הורים',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export const COLORS = {
  primary: '#0D98BA',      // Blue-Green
  secondary: '#FF8200',    // UT Orange
  accent: '#FFBA00',       // Selective Yellow
  muted: '#87CEEB',        // Sky Blue
  destructive: '#003153',  // Prussian Blue
}

export const EVENT_TYPES = {
  general: 'כללי',
  meeting: 'ישיבה',
  fundraiser: 'גיוס כספים',
  trip: 'טיול',
  workshop: 'סדנה'
} as const

export const EVENT_STATUSES = {
  draft: 'טיוטה',
  published: 'פורסם',
  ongoing: 'בתהליך',
  completed: 'הושלם',
  cancelled: 'בוטל'
} as const

export const TASK_STATUSES = {
  pending: 'ממתין',
  in_progress: 'בתהליך',
  completed: 'הושלם',
  cancelled: 'בוטל',
  overdue: 'באיחור'
} as const

export const ISSUE_STATUSES = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  blocked: 'חסום',
  resolved: 'נפתר',
  closed: 'סגור'
} as const

export const PRIORITY_LEVELS = {
  low: 'נמוך',
  normal: 'רגיל',
  high: 'גבוה',
  urgent: 'דחוף'
} as const

export const EXPENSE_STATUSES = {
  pending: 'ממתין לאישור',
  approved: 'אושר',
  rejected: 'נדחה',
  paid: 'שולם',
  reimbursed: 'הוחזר'
} as const

export const VENDOR_CATEGORIES = {
  catering: 'קייטרינג',
  entertainment: 'בידור',
  transportation: 'הסעות',
  supplies: 'ציוד',
  services: 'שירותים',
  maintenance: 'תחזוקה'
} as const

export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

export const HEBREW_DAYS = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'
]

export const HEBREW_DAYS_SHORT = [
  'א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''
]

export const RTL_LANGUAGES = ['he', 'ar']

export const API_ENDPOINTS = {
  events: '/api/events',
  tasks: '/api/tasks',
  issues: '/api/issues',
  protocols: '/api/protocols',
  expenses: '/api/expenses',
  vendors: '/api/vendors',
  feedback: '/api/feedback',
  auth: '/api/auth'
}

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100
}

export const CACHE_KEYS = {
  events: 'events',
  tasks: 'tasks',
  issues: 'issues',
  protocols: 'protocols',
  expenses: 'expenses',
  vendors: 'vendors',
  stats: 'dashboard-stats'
}