import axios from 'axios'
import { API_CONFIG } from '../config/api'
import getRedisClient from '../config/redis'

const apiKey = API_CONFIG.financialModelingPrep.apiKey
const baseUrl = API_CONFIG.financialModelingPrep.baseUrl

if (!apiKey) {
  console.warn('Financial Modeling Prep API key not configured')
}

/**
 * Get cached data from Redis
 */
async function getCached(key: string): Promise<any | null> {
  try {
    const redis = getRedisClient()
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

/**
 * Set cached data in Redis
 */
async function setCached(key: string, value: any, ttl: number = 300): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

/**
 * Make API request
 */
async function makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (!apiKey) {
    throw new Error('Financial Modeling Prep API key not configured')
  }

  const response = await axios.get(`${baseUrl}${endpoint}`, {
    params: {
      ...params,
      apikey: apiKey,
    },
    timeout: 10000,
  })

  if (response.data['Error Message']) {
    throw new Error(response.data['Error Message'])
  }

  return response.data
}

/**
 * Get real-time quote
 */
export async function getQuote(symbol: string): Promise<any> {
  const cacheKey = `fmp:quote:${symbol}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/quote/${symbol.toUpperCase()}`)
  
  if (data && data.length > 0) {
    const quote = data[0]
    const result = {
      symbol: quote.symbol,
      name: quote.name,
      price: quote.price,
      changesPercentage: quote.changesPercentage,
      change: quote.change,
      dayLow: quote.dayLow,
      dayHigh: quote.dayHigh,
      yearHigh: quote.yearHigh,
      yearLow: quote.yearLow,
      marketCap: quote.marketCap,
      priceAvg50: quote.priceAvg50,
      priceAvg200: quote.priceAvg200,
      volume: quote.volume,
      avgVolume: quote.avgVolume,
      exchange: quote.exchange,
      open: quote.open,
      previousClose: quote.previousClose,
      eps: quote.eps,
      pe: quote.pe,
      earningsAnnouncement: quote.earningsAnnouncement,
      sharesOutstanding: quote.sharesOutstanding,
      timestamp: quote.timestamp,
    }
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result
  }

  throw new Error('No quote data found')
}

/**
 * Get company profile
 */
export async function getCompanyProfile(symbol: string): Promise<any> {
  const cacheKey = `fmp:profile:${symbol}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/profile/${symbol.toUpperCase()}`)
  
  if (data && data.length > 0) {
    const profile = data[0]
    
    // Cache for 24 hours (company profile doesn't change frequently)
    await setCached(cacheKey, profile, 86400)
    return profile
  }

  throw new Error('No company profile found')
}

/**
 * Get income statement
 */
export async function getIncomeStatement(symbol: string, limit: number = 5): Promise<any[]> {
  const cacheKey = `fmp:income:${symbol}:${limit}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/income-statement/${symbol.toUpperCase()}`, {
    limit: limit.toString(),
  })
  
  if (data && data.length > 0) {
    // Cache for 24 hours
    await setCached(cacheKey, data, 86400)
    return data
  }

  return []
}

/**
 * Get balance sheet
 */
export async function getBalanceSheet(symbol: string, limit: number = 5): Promise<any[]> {
  const cacheKey = `fmp:balancesheet:${symbol}:${limit}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/balance-sheet-statement/${symbol.toUpperCase()}`, {
    limit: limit.toString(),
  })
  
  if (data && data.length > 0) {
    // Cache for 24 hours
    await setCached(cacheKey, data, 86400)
    return data
  }

  return []
}

/**
 * Get cash flow statement
 */
export async function getCashFlowStatement(symbol: string, limit: number = 5): Promise<any[]> {
  const cacheKey = `fmp:cashflow:${symbol}:${limit}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/cash-flow-statement/${symbol.toUpperCase()}`, {
    limit: limit.toString(),
  })
  
  if (data && data.length > 0) {
    // Cache for 24 hours
    await setCached(cacheKey, data, 86400)
    return data
  }

  return []
}

/**
 * Get earnings calendar
 */
export async function getEarningsCalendar(from: string, to: string): Promise<any[]> {
  const cacheKey = `fmp:earnings:${from}:${to}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/earnings-calendar`, {
    from: from,
    to: to,
  })
  
  if (data && data.length > 0) {
    // Cache for 1 hour
    await setCached(cacheKey, data, 3600)
    return data
  }

  return []
}

