import { appendFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  context?: string
  error?: string
}

class ServerLogger {
  private logLevel: LogLevel
  private isDevelopment: boolean
  private logDir: string
  private enableFileLogging: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || (this.isDevelopment ? 'debug' : 'info')
    this.logDir = process.env.LOG_DIR || join(process.cwd(), 'logs')
    // Disable file logging in production by default (use Railway logs instead)
    this.enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true'
    
    if (this.enableFileLogging && !existsSync(this.logDir)) {
      mkdir(this.logDir, { recursive: true }).catch((err) => {
        console.error('Failed to create log directory:', err)
      })
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private getColorCode(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '\x1b[90m' // Gray
      case 'info':
        return '\x1b[36m' // Cyan
      case 'warn':
        return '\x1b[33m' // Yellow
      case 'error':
        return '\x1b[31m' // Red
      default:
        return '\x1b[0m' // Reset
    }
  }

  private getResetCode(): string {
    return '\x1b[0m'
  }

  private formatConsoleMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `[${context}]` : ''
    const color = this.getColorCode(level)
    const reset = this.getResetCode()
    const levelUpper = level.toUpperCase().padEnd(5)
    return `${color}${levelUpper}${reset} ${timestamp} ${contextStr} ${message}`
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.enableFileLogging) return

    try {
      const date = new Date().toISOString().split('T')[0]
      const logFile = join(this.logDir, `${date}.log`)
      const errorLogFile = join(this.logDir, `${date}.error.log`)

      const logLine = JSON.stringify(entry) + '\n'

      await appendFile(logFile, logLine)

      if (entry.level === 'error') {
        await appendFile(errorLogFile, logLine)
      }
    } catch (error) {
      console.error('Failed to write log to file:', error)
    }
  }

  private async log(level: LogLevel, message: string, data?: any, context?: string): Promise<void> {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const entry: LogEntry = {
      level,
      message,
      timestamp,
      context,
    }

    if (data instanceof Error) {
      entry.error = data.stack || data.message
      entry.data = {
        name: data.name,
        message: data.message,
      }
    } else if (data) {
      entry.data = data
    }

    const formattedMessage = this.formatConsoleMessage(level, message, context)

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, data || '')
        }
        break
      case 'info':
        console.info(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'error':
        console.error(formattedMessage, data || '')
        if (data instanceof Error && this.isDevelopment) {
          console.error('Stack:', data.stack)
        }
        break
    }

    await this.writeToFile(entry)
  }

  async debug(message: string, data?: any, context?: string): Promise<void> {
    await this.log('debug', message, data, context)
  }

  async info(message: string, data?: any, context?: string): Promise<void> {
    await this.log('info', message, data, context)
  }

  async warn(message: string, data?: any, context?: string): Promise<void> {
    await this.log('warn', message, data, context)
  }

  async error(message: string, error?: Error | any, context?: string): Promise<void> {
    await this.log('error', message, error, context)
  }

  child(context: string): {
    debug: (message: string, data?: any) => Promise<void>
    info: (message: string, data?: any) => Promise<void>
    warn: (message: string, data?: any) => Promise<void>
    error: (message: string, error?: Error | any) => Promise<void>
  } {
    return {
      debug: (message: string, data?: any) => this.debug(message, data, context),
      info: (message: string, data?: any) => this.info(message, data, context),
      warn: (message: string, data?: any) => this.warn(message, data, context),
      error: (message: string, error?: Error | any) => this.error(message, error, context),
    }
  }
}

export const logger = new ServerLogger()

