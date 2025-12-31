import axios from 'axios'
import { API_CONFIG } from '../config/api'
import getRedisClient from '../config/redis'

const baseUrl = API_CONFIG.exchangeRate.baseUrl

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
async function makeRequest(endpoint: string): Promise<any> {
  const response = await axios.get(`${baseUrl}${endpoint}`, {
    timeout: 10000,
  })

  return response.data
}

/**
 * Get latest exchange rates
 */
export async function getLatestRates(base: string = 'USD'): Promise<any> {
  const cacheKey = `exchangerate:latest:${base}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/latest/${base.toUpperCase()}`)
  
  if (data.rates) {
    const result = {
      base: data.base,
      date: data.date,
      rates: data.rates,
    }
    
    // Cache for 1 hour (FX rates change frequently but API limits exist)
    await setCached(cacheKey, result, 3600)
    return result
  }

  throw new Error('Invalid response from ExchangeRate API')
}

/**
 * Get historical exchange rates
 */
export async function getHistoricalRates(base: string, date: string): Promise<any> {
  const cacheKey = `exchangerate:history:${base}:${date}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest(`/history/${base.toUpperCase()}/${date}`)
  
  if (data.rates) {
    const result = {
      base: data.base,
      date: data.date,
      rates: data.rates,
    }
    
    // Cache for 24 hours (historical data doesn't change)
    await setCached(cacheKey, result, 86400)
    return result
  }

  throw new Error('Invalid response from ExchangeRate API')
}

/**
 * Convert currency amount
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<any> {
  const cacheKey = `exchangerate:convert:${amount}:${from}:${to}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  // Get latest rates and calculate conversion
  const rates = await getLatestRates(from)
  
  if (rates.rates[to.toUpperCase()]) {
    const rate = rates.rates[to.toUpperCase()]
    const result = {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: amount,
      converted: amount * rate,
      rate: rate,
      date: rates.date,
    }
    
    // Cache for 1 hour
    await setCached(cacheKey, result, 3600)
    return result
  }

  throw new Error(`Exchange rate not found for ${to}`)
}

