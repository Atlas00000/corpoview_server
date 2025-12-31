import axios from 'axios'
import { API_CONFIG } from '../config/api'
import getRedisClient from '../config/redis'

const apiKey = API_CONFIG.polygon.apiKey
const baseUrl = API_CONFIG.polygon.baseUrl

if (!apiKey) {
  console.warn('Polygon.io API key not configured')
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
 * Make API request with authentication
 */
async function makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (!apiKey) {
    throw new Error('Polygon.io API key not configured')
  }

  const response = await axios.get(`${baseUrl}${endpoint}`, {
    params: {
      ...params,
      apiKey: apiKey,
    },
    timeout: 10000,
  })

  if (response.data.status === 'ERROR') {
    throw new Error(response.data.error || 'Polygon.io API error')
  }

  return response.data
}

/**
 * Get aggregated bars (OHLC data) for a ticker
 */
export async function getAggregates(
  ticker: string,
  multiplier: number = 1,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day',
  from: string,
  to: string
): Promise<any[]> {
  const cacheKey = `polygon:aggregates:${ticker}:${multiplier}:${timespan}:${from}:${to}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const endpoint = `/v2/aggs/ticker/${ticker.toUpperCase()}/range/${multiplier}/${timespan}/${from}/${to}`
  
  const data = await makeRequest(endpoint)
  
  if (data.results && data.results.length > 0) {
    const result = data.results.map((bar: any) => ({
      date: new Date(bar.t).toISOString(),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
      transactions: bar.n,
      vwap: bar.vw,
    }))
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result
  }

  return []
}

/**
 * Get previous day's close price
 */
export async function getPreviousClose(ticker: string): Promise<any> {
  const cacheKey = `polygon:prevclose:${ticker}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const endpoint = `/v2/aggs/ticker/${ticker.toUpperCase()}/prev`
  
  const data = await makeRequest(endpoint)
  
  if (data.results && data.results.length > 0) {
    const result = data.results[0]
    const prevClose = {
      ticker: result.T,
      date: new Date(result.t).toISOString(),
      close: result.c,
      open: result.o,
      high: result.h,
      low: result.l,
      volume: result.v,
    }
    
    // Cache for 1 hour
    await setCached(cacheKey, prevClose, 3600)
    return prevClose
  }

  throw new Error('No previous close data found')
}

/**
 * Get latest quote for a ticker
 */
export async function getLatestQuote(ticker: string): Promise<any> {
  const cacheKey = `polygon:quote:${ticker}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const endpoint = `/v2/last/nbbo/${ticker.toUpperCase()}`
  
  const data = await makeRequest(endpoint)
  
  if (data.results) {
    const result = data.results
    const quote = {
      ticker: result.T,
      bid: result.p,
      ask: result.p,
      bidSize: result.s,
      askSize: result.s,
      timestamp: new Date(result.t).toISOString(),
    }
    
    // Cache for 1 minute (quotes are very time-sensitive)
    await setCached(cacheKey, quote, 60)
    return quote
  }

  throw new Error('No quote data found')
}

/**
 * Get market news for a ticker
 */
export async function getTickerNews(ticker: string, limit: number = 10): Promise<any[]> {
  const cacheKey = `polygon:news:${ticker}:${limit}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const endpoint = `/v2/reference/news`
  
  const data = await makeRequest(endpoint, {
    ticker: ticker.toUpperCase(),
    limit: limit.toString(),
    order: 'desc',
  })
  
  if (data.results && data.results.length > 0) {
    const result = data.results.map((news: any) => ({
      id: news.id,
      title: news.title,
      description: news.description,
      author: news.author,
      publishedUtc: news.published_utc,
      articleUrl: news.article_url,
      imageUrl: news.image_url,
      publisher: news.publisher?.name,
    }))
    
    // Cache for 15 minutes
    await setCached(cacheKey, result, 900)
    return result
  }

  return []
}

