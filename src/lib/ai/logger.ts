/**
 * AI Chat Logging System
 *
 * Logs all AI assistant interactions for debugging, analysis, and monitoring.
 * Logs to console with structured format for easy parsing and analysis.
 * Can be extended to log to database or external service.
 */

export type AILogLevel = 'info' | 'success' | 'warning' | 'error'

export type AILogAction =
  | 'initial'
  | 'select_type'
  | 'understand_message'
  | 'extract_data'
  | 'insert_data'

export interface AILogEntry {
  timestamp: string
  level: AILogLevel
  action: AILogAction
  userId?: string
  sessionId?: string

  // Request data
  userMessage?: string
  messageLength?: number

  // GPT interaction
  gptModel?: string
  gptRoundNumber?: number
  gptPromptTokens?: number
  gptCompletionTokens?: number
  gptTotalTokens?: number
  gptCost?: number

  // Response data
  responseType?: 'text' | 'function_call' | 'error'
  functionName?: string
  extractedDataType?: 'event' | 'events' | 'urgent_message' | 'highlight'

  // Validation
  validationSuccess?: boolean
  validationErrors?: string[]

  // Rate limiting
  usageCount?: number
  dailyLimit?: number
  rateLimitReached?: boolean

  // Error tracking
  errorMessage?: string
  errorStack?: string

  // Performance
  durationMs?: number

  // Additional context
  metadata?: Record<string, any>
}

class AILogger {
  private sessionId: string

  constructor() {
    // Generate a session ID for this instance (can be used to track conversation flows)
    this.sessionId = `ai-session-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  /**
   * Main logging method
   */
  log(entry: Partial<AILogEntry>) {
    const fullEntry: AILogEntry = {
      timestamp: new Date().toISOString(),
      level: entry.level || 'info',
      action: entry.action || 'initial',
      sessionId: this.sessionId,
      ...entry,
    }

    // Console output with color coding
    const prefix = this.getLogPrefix(fullEntry.level)
    const actionLabel = `[${fullEntry.action.toUpperCase()}]`

    console.log(
      `${prefix} ${actionLabel} ${fullEntry.timestamp}`,
      JSON.stringify(fullEntry, null, 2)
    )

    // TODO: Add database logging here if needed
    // await this.logToDatabase(fullEntry)

    // TODO: Add external service logging (e.g., Sentry, LogRocket)
    // if (fullEntry.level === 'error') {
    //   this.logToSentry(fullEntry)
    // }
  }

  /**
   * Log initial greeting
   */
  logInitial() {
    this.log({
      level: 'info',
      action: 'initial',
      responseType: 'text',
    })
  }

  /**
   * Log type selection
   */
  logTypeSelection(userMessage: string, success: boolean) {
    this.log({
      level: success ? 'success' : 'warning',
      action: 'select_type',
      userMessage,
      messageLength: userMessage.length,
      responseType: 'text',
    })
  }

  /**
   * Log GPT API call
   */
  logGPTRequest(params: {
    action: AILogAction
    userMessage: string
    gptModel: string
    roundNumber: number
    context?: string
  }) {
    this.log({
      level: 'info',
      action: params.action,
      userMessage: params.userMessage,
      messageLength: params.userMessage.length,
      gptModel: params.gptModel,
      gptRoundNumber: params.roundNumber,
      metadata: {
        hasContext: !!params.context,
        contextLength: params.context?.length,
      },
    })
  }

  /**
   * Log GPT API response
   */
  logGPTResponse(params: {
    action: AILogAction
    responseType: 'text' | 'function_call' | 'error'
    functionName?: string
    extractedDataType?: 'event' | 'events' | 'urgent_message' | 'highlight'
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
    roundNumber: number
    durationMs: number
  }) {
    this.log({
      level: 'success',
      action: params.action,
      responseType: params.responseType,
      functionName: params.functionName,
      extractedDataType: params.extractedDataType,
      gptPromptTokens: params.promptTokens,
      gptCompletionTokens: params.completionTokens,
      gptTotalTokens: params.totalTokens,
      gptCost: params.cost,
      gptRoundNumber: params.roundNumber,
      durationMs: params.durationMs,
    })
  }

  /**
   * Log validation result
   */
  logValidation(params: {
    action: AILogAction
    functionName: string
    validationSuccess: boolean
    validationErrors?: string[]
    extractedDataType?: 'event' | 'events' | 'urgent_message' | 'highlight'
  }) {
    this.log({
      level: params.validationSuccess ? 'success' : 'error',
      action: params.action,
      functionName: params.functionName,
      validationSuccess: params.validationSuccess,
      validationErrors: params.validationErrors,
      extractedDataType: params.extractedDataType,
    })
  }

  /**
   * Log rate limit check
   */
  logRateLimit(params: {
    usageCount: number
    dailyLimit: number
    rateLimitReached: boolean
  }) {
    this.log({
      level: params.rateLimitReached ? 'warning' : 'info',
      action: 'extract_data',
      usageCount: params.usageCount,
      dailyLimit: params.dailyLimit,
      rateLimitReached: params.rateLimitReached,
    })
  }

  /**
   * Log data insertion
   */
  logInsert(params: {
    extractedDataType: 'event' | 'events' | 'urgent_message' | 'highlight'
    success: boolean
    errorMessage?: string
    durationMs: number
  }) {
    this.log({
      level: params.success ? 'success' : 'error',
      action: 'insert_data',
      extractedDataType: params.extractedDataType,
      validationSuccess: params.success,
      errorMessage: params.errorMessage,
      durationMs: params.durationMs,
    })
  }

  /**
   * Log errors
   */
  logError(params: {
    action: AILogAction
    errorMessage: string
    errorStack?: string
    userMessage?: string
    metadata?: Record<string, any>
  }) {
    this.log({
      level: 'error',
      action: params.action,
      errorMessage: params.errorMessage,
      errorStack: params.errorStack,
      userMessage: params.userMessage,
      responseType: 'error',
      metadata: params.metadata,
    })
  }

  /**
   * Get colored prefix for console logs
   */
  private getLogPrefix(level: AILogLevel): string {
    const colors = {
      info: '\x1b[36m[AI INFO]\x1b[0m',      // Cyan
      success: '\x1b[32m[AI SUCCESS]\x1b[0m', // Green
      warning: '\x1b[33m[AI WARNING]\x1b[0m', // Yellow
      error: '\x1b[31m[AI ERROR]\x1b[0m',     // Red
    }
    return colors[level]
  }

  /**
   * Get a new session ID (useful for testing or resetting session)
   */
  resetSession() {
    this.sessionId = `ai-session-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId
  }
}

// Export singleton instance
export const aiLogger = new AILogger()

// Export for creating new instances if needed
export { AILogger }
