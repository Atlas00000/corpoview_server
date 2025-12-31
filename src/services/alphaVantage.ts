import axios from 'axios'
import { API_CONFIG } from '../config/api'
import getRedisClient from '../config/redis'
import { RateLimitError, ApiServiceError } from '../utils/errors'

const apiKey = API_CONFIG.alphaVantage.apiKey
const baseUrl = API_CONFIG.alphaVantage.baseUrl

if (!apiKey) {
  console.warn('Alpha Vantage API key not configured')
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
 * Make API request with retry logic
 */
async function makeRequest(params: Record<string, string>, retries: number = 3): Promise<any> {
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured')
  }

  const requestParams = {
    ...params,
    apikey: apiKey,
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(baseUrl, { params: requestParams, timeout: 10000 })
      
      // Alpha Vantage returns errors in the response body
      if (response.data['Error Message']) {
        const errorMsg = response.data['Error Message']
        // Check if it's a rate limit message
        if (errorMsg.toLowerCase().includes('frequency') || errorMsg.toLowerCase().includes('call limit')) {
          throw new RateLimitError(
            'Alpha Vantage API call frequency limit exceeded. Please wait before making another request.',
            'Alpha Vantage',
            60 // Retry after 60 seconds
          )
        }
        throw new ApiServiceError(errorMsg, 'Alpha Vantage', 400, 'API_ERROR')
      }
      
      if (response.data['Note']) {
        // Rate limit exceeded
        throw new RateLimitError(
          'Alpha Vantage API call frequency limit exceeded. Please wait before making another request.',
          'Alpha Vantage',
          60 // Retry after 60 seconds
        )
      }

      return response.data
    } catch (error: any) {
      if (attempt === retries) {
        throw error
      }
      
      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw new Error('Max retries exceeded')
}

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<any> {
  const cacheKey = `alphavantage:quote:${symbol}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params = {
    function: 'GLOBAL_QUOTE',
    symbol: symbol.toUpperCase(),
  }

  const data = await makeRequest(params)
  
  if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
    const quote = data['Global Quote']
    const result = {
      symbol: quote['01. symbol'],
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      price: parseFloat(quote['05. price']),
      volume: parseInt(quote['06. volume']),
      latestTradingDay: quote['07. latest trading day'],
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    }
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result
  }

  throw new ApiServiceError('Invalid response format from Alpha Vantage API', 'Alpha Vantage', 502, 'INVALID_RESPONSE')
}

/**
 * Get intraday time series data
 */
export async function getIntradayData(
  symbol: string,
  interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'
): Promise<any[]> {
  const cacheKey = `alphavantage:intraday:${symbol}:${interval}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params = {
    function: 'TIME_SERIES_INTRADAY',
    symbol: symbol.toUpperCase(),
    interval: interval,
    outputsize: 'compact',
  }

  const data = await makeRequest(params)
  
  const timeSeriesKey = `Time Series (${interval})`
  if (data[timeSeriesKey]) {
    const timeSeries = data[timeSeriesKey]
    const result = Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
      date: timestamp,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }))
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result.reverse() // Return in chronological order
  }

  throw new ApiServiceError('Invalid response format from Alpha Vantage API', 'Alpha Vantage', 502, 'INVALID_RESPONSE')
}

/**
 * Get daily time series data
 */
export async function getDailyData(symbol: string, outputsize: 'compact' | 'full' = 'compact'): Promise<any[]> {
  const cacheKey = `alphavantage:daily:${symbol}:${outputsize}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params = {
    function: 'TIME_SERIES_DAILY',
    symbol: symbol.toUpperCase(),
    outputsize: outputsize,
  }

  const data = await makeRequest(params)
  
  if (data['Time Series (Daily)']) {
    const timeSeries = data['Time Series (Daily)']
    const result = Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
      date: timestamp,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }))
    
    // Cache for 1 hour
    await setCached(cacheKey, result, 3600)
    return result.reverse() // Return in chronological order
  }

  throw new ApiServiceError('Invalid response format from Alpha Vantage API', 'Alpha Vantage', 502, 'INVALID_RESPONSE')
}

/**
 * Get company overview/fundamentals
 */
export async function getCompanyOverview(symbol: string): Promise<any> {
  const cacheKey = `alphavantage:overview:${symbol}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params = {
    function: 'OVERVIEW',
    symbol: symbol.toUpperCase(),
  }

  const data = await makeRequest(params)
  
  if (data.Symbol) {
    // Cache for 24 hours (company data doesn't change frequently)
    await setCached(cacheKey, data, 86400)
    return data
  }

  throw new ApiServiceError('Invalid response format from Alpha Vantage API', 'Alpha Vantage', 502, 'INVALID_RESPONSE')
}

/**
 * Get cryptocurrency exchange rate
 */
export async function getCryptoExchangeRate(
  fromCurrency: string,
  toCurrency: string = 'USD'
): Promise<any> {
  const cacheKey = `alphavantage:crypto:${fromCurrency}:${toCurrency}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params = {
    function: 'CURRENCY_EXCHANGE_RATE',
    from_currency: fromCurrency.toUpperCase(),
    to_currency: toCurrency.toUpperCase(),
  }

  const data = await makeRequest(params)
  
  if (data['Realtime Currency Exchange Rate']) {
    const rate = data['Realtime Currency Exchange Rate']
    const result = {
      fromCurrency: rate['1. From_Currency Code'],
      toCurrency: rate['3. To_Currency Code'],
      exchangeRate: parseFloat(rate['5. Exchange Rate']),
      lastRefreshed: rate['6. Last Refreshed'],
      timeZone: rate['7. Time Zone'],
      bidPrice: parseFloat(rate['8. Bid Price']),
      askPrice: parseFloat(rate['9. Ask Price']),
    }
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result
  }

  throw new ApiServiceError('Invalid response format from Alpha Vantage API', 'Alpha Vantage', 502, 'INVALID_RESPONSE')
}

/**
 * Get cryptocurrency intraday data
 */
export async function getCryptoIntraday(
  symbol: string,
  market: string = 'USD',
  interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'
): Promise<any[]> {
  const cacheKey = `alphavantage:crypto:intraday:${symbol}:${market}:${interval}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params = {
    function: 'CRYPTO_INTRADAY',
    symbol: symbol.toUpperCase(),
    market: market.toUpperCase(),
    interval: interval,
  }

  const data = await makeRequest(params)
  
  const timeSeriesKey = `Time Series Crypto (${interval})`
  if (data[timeSeriesKey]) {
    const timeSeries = data[timeSeriesKey]
    const result = Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
      date: timestamp,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseFloat(values['5. volume']),
    }))
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result.reverse() // Return in chronological order
  }

  throw new ApiServiceError('Invalid response format from Alpha Vantage API', 'Alpha Vantage', 502, 'INVALID_RESPONSE')
}

