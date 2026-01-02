/**
 * Google Analytics Event Tracking Utilities
 *
 * This module provides type-safe event tracking for Google Analytics.
 * Tracks user actions, admin actions, and component interactions.
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'js',
      targetOrAction: string | Date,
      params?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

/**
 * Event categories for organizing analytics
 */
export enum EventCategory {
  // User actions
  NAVIGATION = 'navigation',
  TASK = 'task',
  EVENT = 'event',
  MEETING = 'meeting',
  VENDOR = 'vendor',
  FEEDBACK = 'feedback',
  TICKET = 'ticket',

  // Admin actions
  ADMIN_TASK = 'admin_task',
  ADMIN_EVENT = 'admin_event',
  ADMIN_MEETING = 'admin_meeting',
  ADMIN_VENDOR = 'admin_vendor',
  ADMIN_SETTINGS = 'admin_settings',
  ADMIN_HIGHLIGHTS = 'admin_highlights',

  // AI Assistant
  AI_ASSISTANT = 'ai_assistant',

  // System
  PWA = 'pwa',
  AUTH = 'auth',
  ERROR = 'error',
}

/**
 * Common event actions
 */
export enum EventAction {
  // CRUD operations
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  // User interactions
  CLICK = 'click',
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  OPEN = 'open',
  CLOSE = 'close',
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
  EXPORT = 'export',
  IMPORT = 'import',

  // Navigation
  NAVIGATE = 'navigate',
  BACK = 'back',

  // AI
  AI_CHAT_OPEN = 'ai_chat_open',
  AI_CHAT_SEND = 'ai_chat_send',
  AI_SUGGESTION_ACCEPT = 'ai_suggestion_accept',
  AI_SUGGESTION_REJECT = 'ai_suggestion_reject',

  // Auth
  LOGIN = 'login',
  LOGOUT = 'logout',

  // Errors
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * User types for tracking
 */
export enum UserType {
  ADMIN = 'admin',
  USER = 'user',
  ANONYMOUS = 'anonymous',
}

/**
 * Event parameters interface
 */
interface EventParams {
  category: EventCategory
  action: EventAction | string
  label?: string
  value?: number
  userType?: UserType
  componentName?: string
  pageUrl?: string
  entityId?: string | number
  entityType?: string
  metadata?: Record<string, unknown>
}

/**
 * Check if gtag is available
 */
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * Track a custom event in Google Analytics
 *
 * @param params - Event parameters
 *
 * @example
 * trackEvent({
 *   category: EventCategory.ADMIN_TASK,
 *   action: EventAction.CREATE,
 *   label: 'New task created',
 *   userType: UserType.ADMIN,
 *   componentName: 'TaskForm'
 * })
 */
export function trackEvent(params: EventParams): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event tracked:', params)
    }
    return
  }

  const {
    category,
    action,
    label,
    value,
    userType,
    componentName,
    pageUrl,
    entityId,
    entityType,
    metadata,
  } = params

  // Build event name (e.g., "admin_task_create")
  const eventName = `${category}_${action}`

  // Build event parameters
  const eventParams: Record<string, unknown> = {
    event_category: category,
    event_label: label,
    ...(value !== undefined && { value }),
    ...(userType && { user_type: userType }),
    ...(componentName && { component_name: componentName }),
    ...(pageUrl && { page_url: pageUrl }),
    ...(entityId && { entity_id: entityId }),
    ...(entityType && { entity_type: entityType }),
    ...(metadata && metadata),
  }

  // Send event to Google Analytics
  window.gtag!('event', eventName, eventParams)

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Event sent:', eventName, eventParams)
  }
}

/**
 * Track a page view
 *
 * @param pagePath - The page path
 * @param pageTitle - The page title
 * @param userType - The user type viewing the page
 */
export function trackPageView(
  pagePath: string,
  pageTitle?: string,
  userType?: UserType
): void {
  if (!isGtagAvailable()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view tracked:', { pagePath, pageTitle, userType })
    }
    return
  }

  window.gtag!('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    user_type: userType,
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Page view sent:', { pagePath, pageTitle, userType })
  }
}

/**
 * Track a timing event (for performance monitoring)
 *
 * @param name - Name of the timing event
 * @param value - Time in milliseconds
 * @param category - Event category
 * @param label - Event label
 */
export function trackTiming(
  name: string,
  value: number,
  category?: string,
  label?: string
): void {
  if (!isGtagAvailable()) return

  window.gtag!('event', 'timing_complete', {
    name,
    value,
    event_category: category,
    event_label: label,
  })
}

/**
 * Track an error
 *
 * @param error - Error object or message
 * @param fatal - Whether the error is fatal
 * @param componentName - Name of the component where error occurred
 */
export function trackError(
  error: Error | string,
  fatal = false,
  componentName?: string
): void {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack

  trackEvent({
    category: EventCategory.ERROR,
    action: EventAction.ERROR_OCCURRED,
    label: errorMessage,
    componentName,
    metadata: {
      fatal,
      stack: errorStack,
    },
  })
}

/**
 * Helper: Detect if user is admin (has auth token)
 */
export function detectUserType(): UserType {
  if (typeof window === 'undefined') return UserType.ANONYMOUS

  // Check for auth token cookie
  const hasAuthToken = document.cookie.includes('auth-token=')

  // Check if on admin route
  const isAdminRoute = window.location.pathname.includes('/admin')

  if (hasAuthToken && isAdminRoute) {
    return UserType.ADMIN
  } else if (hasAuthToken) {
    return UserType.USER
  }

  return UserType.ANONYMOUS
}

/**
 * Convenience function: Track admin action
 */
export function trackAdminAction(
  action: EventAction | string,
  label: string,
  componentName?: string,
  metadata?: Record<string, unknown>
): void {
  trackEvent({
    category: EventCategory.ADMIN_TASK,
    action,
    label,
    userType: UserType.ADMIN,
    componentName,
    metadata,
  })
}

/**
 * Convenience function: Track user action
 */
export function trackUserAction(
  category: EventCategory,
  action: EventAction | string,
  label: string,
  componentName?: string,
  metadata?: Record<string, unknown>
): void {
  trackEvent({
    category,
    action,
    label,
    userType: UserType.USER,
    componentName,
    metadata,
  })
}

/**
 * Convenience function: Track AI assistant interaction
 */
export function trackAIInteraction(
  action: EventAction | string,
  label: string,
  metadata?: Record<string, unknown>
): void {
  trackEvent({
    category: EventCategory.AI_ASSISTANT,
    action,
    label,
    userType: detectUserType(),
    componentName: 'AIAssistant',
    metadata,
  })
}

/**
 * Convenience function: Track navigation
 */
export function trackNavigation(
  to: string,
  from?: string,
  componentName?: string
): void {
  trackEvent({
    category: EventCategory.NAVIGATION,
    action: EventAction.NAVIGATE,
    label: `Navigate to ${to}`,
    userType: detectUserType(),
    componentName,
    metadata: {
      to,
      from,
    },
  })
}
