/**
 * AI Chat Logging System
 *
 * Logs all AI assistant interactions for debugging, analysis, and monitoring.
 * Logs to console with structured format for easy parsing and analysis.
 * Logs to database (ai_chat_logs table) for persistent storage and analysis.
 */

import { createClient } from '@/lib/supabase/server'

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
  responseType?: 'request' | 'text' | 'function_call' | 'error'
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

    // Save to database asynchronously (don't wait to avoid blocking)
    this.logToDatabase(fullEntry).catch((error) => {
      console.error('[AI Logger] Failed to save log to database:', error)
    })
  }

  /**
   * Save log entry to database
   */
  private async logToDatabase(entry: AILogEntry) {
    try {
      const supabase = createClient() // Use service role client for logging
      const { error } = await supabase.from('ai_chat_logs').insert({
        session_id: entry.sessionId,
        level: entry.level,
        action: entry.action,
        user_message: entry.userMessage,
        message_length: entry.messageLength,
        gpt_model: entry.gptModel,
        gpt_round_number: entry.gptRoundNumber,
        gpt_prompt_tokens: entry.gptPromptTokens,
        gpt_completion_tokens: entry.gptCompletionTokens,
        gpt_total_tokens: entry.gptTotalTokens,
        gpt_cost: entry.gptCost,
        response_type: entry.responseType,
        function_name: entry.functionName,
        extracted_data_type: entry.extractedDataType,
        validation_success: entry.validationSuccess,
        validation_errors: entry.validationErrors,
        usage_count: entry.usageCount,
        daily_limit: entry.dailyLimit,
        rate_limit_reached: entry.rateLimitReached,
        error_message: entry.errorMessage,
        error_stack: entry.errorStack,
        duration_ms: entry.durationMs,
        metadata: entry.metadata,
      })

      if (error) {
        console.error('[AI Logger] Database insert error:', error)
      }
    } catch (error) {
      console.error('[AI Logger] Database logging failed:', error)
    }
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
   * Log GPT API call (request to OpenAI)
   */
  logGPTRequest(params: {
    action: AILogAction
    userMessage: string
    gptModel: string
    roundNumber: number
    context?: string
    metadata?: Record<string, any>
  }) {
    this.log({
      level: 'info',
      action: params.action,
      responseType: 'request', // Mark as request log
      userMessage: params.userMessage,
      messageLength: params.userMessage.length,
      gptModel: params.gptModel,
      gptRoundNumber: params.roundNumber,
      metadata: {
        hasContext: !!params.context,
        contextLength: params.context?.length,
        ...(params.metadata || {}), // Merge custom metadata
      },
    })
  }

  /**
   * Log GPT API response (response from OpenAI)
   */
  logGPTResponse(params: {
    action: AILogAction
    responseType: 'request' | 'text' | 'function_call' | 'error'
    functionName?: string
    extractedDataType?: 'event' | 'events' | 'urgent_message' | 'highlight'
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
    roundNumber: number
    durationMs: number
    metadata?: Record<string, any>
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
      metadata: params.metadata,
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
   * Log errors with full details
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

    // Also log to console for immediate visibility
    console.error('[AI Logger] Error logged to database:', {
      action: params.action,
      error: params.errorMessage,
      timestamp: new Date().toISOString(),
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
