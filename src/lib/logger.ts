/**
 * Development Logger Utility
 * Provides structured logging for actions in development mode only
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug'

interface LogOptions {
  component?: string
  action?: string
  data?: any
  error?: Error | unknown
  fileType?: string
  [key: string]: any
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private getTimestamp(): string {
    return new Date().toISOString().split('T')[1].split('.')[0]
  }

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = this.getTimestamp()
    const component = options?.component ? `[${options.component}]` : ''
    const action = options?.action ? `{${options.action}}` : ''

    return `[${timestamp}] ${level.toUpperCase()} ${component}${action} ${message}`
  }

  private getStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      info: 'color: #3B82F6; font-weight: bold',
      success: 'color: #10B981; font-weight: bold',
      warning: 'color: #F59E0B; font-weight: bold',
      error: 'color: #EF4444; font-weight: bold',
      debug: 'color: #8B5CF6; font-weight: bold'
    }
    return styles[level]
  }

  private log(level: LogLevel, message: string, options?: LogOptions) {
    if (!this.isDev) return

    const formattedMessage = this.formatMessage(level, message, options)
    const style = this.getStyle(level)

    console.log(`%c${formattedMessage}`, style)

    if (options?.data) {
      console.log('📊 Data:', options.data)
    }

    if (options?.error) {
      console.error('❌ Error:', options.error)
    }
  }

  info(message: string, options?: LogOptions) {
    this.log('info', message, options)
  }

  success(message: string, options?: LogOptions) {
    this.log('success', message, options)
  }

  warning(message: string, options?: LogOptions) {
    this.log('warning', message, options)
  }

  warn(message: string, options?: LogOptions) {
    this.log('warning', message, options)
  }

  error(message: string, options?: LogOptions) {
    this.log('error', message, options)
  }

  debug(message: string, options?: LogOptions) {
    this.log('debug', message, options)
  }

  // Specialized logging methods
  navigation(from: string, to: string) {
    this.info(`Navigation: ${from} → ${to}`, {
      component: 'Router',
      action: 'navigate',
      data: { from, to }
    })
  }

  apiCall(method: string, endpoint: string, data?: any) {
    this.info(`API ${method} ${endpoint}`, {
      component: 'API',
      action: 'request',
      data
    })
  }

  apiResponse(endpoint: string, status: number, data?: any) {
    const level = status >= 200 && status < 300 ? 'success' : 'error'
    this.log(level, `API Response ${status} ${endpoint}`, {
      component: 'API',
      action: 'response',
      data
    })
  }

  formSubmit(formName: string, data: any) {
    this.info(`Form submitted: ${formName}`, {
      component: 'Form',
      action: 'submit',
      data
    })
  }

  formValidation(formName: string, errors: any) {
    this.warning(`Form validation failed: ${formName}`, {
      component: 'Form',
      action: 'validation',
      data: errors
    })
  }

  userAction(action: string, details?: any) {
    this.info(`User action: ${action}`, {
      component: 'User',
      action: 'interaction',
      data: details
    })
  }

  stateChange(component: string, prevState: any, newState: any) {
    this.debug(`State changed in ${component}`, {
      component,
      action: 'state',
      data: { prev: prevState, new: newState }
    })
  }

  mount(component: string) {
    this.debug(`Component mounted: ${component}`, {
      component,
      action: 'mount'
    })
  }

  unmount(component: string) {
    this.debug(`Component unmounted: ${component}`, {
      component,
      action: 'unmount'
    })
  }
}

export const logger = new Logger()

// Convenience exports
export const {
  info,
  success,
  warning,
  error,
  debug,
  navigation,
  apiCall,
  apiResponse,
  formSubmit,
  formValidation,
  userAction,
  stateChange,
  mount,
  unmount
} = logger