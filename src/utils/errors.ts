/**
 * Error handling utilities for API rate limits and user-friendly error messages
 */

export interface ApiError {
  message: string
  statusCode: number
  code?: string
  retryAfter?: number
}

/**
 * Custom error class for API rate limits
 */
export class RateLimitError extends Error {
  statusCode: number
  code: string
  retryAfter?: number
  service: string

  constructor(message: string, service: string, retryAfter?: number) {
    super(message)
    this.name = 'RateLimitError'
    this.statusCode = 429
    this.code = 'RATE_LIMIT_EXCEEDED'
    this.retryAfter = retryAfter
    this.service = service
  }
}

/**
 * Custom error class for API errors
 */
export class ApiServiceError extends Error {
  statusCode: number
  code: string
  service: string

  constructor(message: string, service: string, statusCode: number = 500, code: string = 'API_ERROR') {
    super(message)
    this.name = 'ApiServiceError'
    this.statusCode = statusCode
    this.code = code
    this.service = service
  }
}

/**
 * Detect if an error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  if (error instanceof RateLimitError) return true
  
  // Check for HTTP 429 status
  if (error?.response?.status === 429) return true
  if (error?.statusCode === 429) return true
  
  // Check for Alpha Vantage rate limit messages
  if (error?.message?.includes('frequency limit exceeded')) return true
  if (error?.message?.includes('API call frequency limit')) return true
  
  // Check for CoinGecko rate limit
  if (error?.message?.includes('429')) return true
  
  return false
}

/**
 * Get user-friendly error message from an error
 */
export function getUserFriendlyErrorMessage(error: any, serviceName: string = 'API'): ApiError {
  // Rate limit errors
  if (isRateLimitError(error)) {
    const serviceMessages: Record<string, string> = {
      'Alpha Vantage': 'Stock data requests are temporarily limited. Please wait a moment and try again. Data will be available shortly.',
      'CoinGecko': 'Cryptocurrency data requests are temporarily limited. Please wait a moment and try again. Data will be available shortly.',
      'NewsAPI': 'News data requests are temporarily limited. Please wait a moment and try again.',
      'Financial Modeling Prep': 'Financial data requests are temporarily limited. Please wait a moment and try again.',
      'Polygon': 'Market data requests are temporarily limited. Please wait a moment and try again.',
    }

    const message = serviceMessages[serviceName] || 'Data requests are temporarily limited. Please wait a moment and try again.'
    
    return {
      message,
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: error?.retryAfter || 60, // Default to 60 seconds
    }
  }

  // Network/timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      message: 'The request took too long to complete. Please try again in a moment.',
      statusCode: 504,
      code: 'TIMEOUT',
    }
  }

  // Connection errors
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    return {
      message: 'Unable to connect to data service. Please try again later.',
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE',
    }
  }

  // Invalid API key
  if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
    return {
      message: 'Service authentication error. Please contact support if this persists.',
      statusCode: 500,
      code: 'AUTH_ERROR',
    }
  }

  // Invalid response format
  if (error?.message?.includes('Invalid response')) {
    return {
      message: 'Received unexpected data format. Please try again in a moment.',
      statusCode: 502,
      code: 'INVALID_RESPONSE',
    }
  }

  // Generic error with original message if available
  return {
    message: error?.message || 'An unexpected error occurred. Please try again later.',
    statusCode: error?.statusCode || error?.response?.status || 500,
    code: error?.code || 'INTERNAL_ERROR',
  }
}

/**
 * Format error response for API
 */
export function formatErrorResponse(error: any, serviceName?: string) {
  const apiError = getUserFriendlyErrorMessage(error, serviceName)
  
  const response: any = {
    error: apiError.message,
    code: apiError.code,
  }

  if (apiError.retryAfter) {
    response.retryAfter = apiError.retryAfter
  }

  return {
    statusCode: apiError.statusCode,
    body: response,
  }
}

