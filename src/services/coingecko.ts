import axios from 'axios'
import { API_CONFIG } from '../config/api'
import getRedisClient from '../config/redis'

const baseUrl = API_CONFIG.coingecko.baseUrl

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
  const response = await axios.get(`${baseUrl}${endpoint}`, {
    params,
    timeout: 10000,
  })

  return response.data
}

/**
 * Get cryptocurrency market data
 */
export async function getMarketData(
  vsCurrency: string = 'usd',
  ids?: string[],
  limit: number = 100
): Promise<any[]> {
  const cacheKey = `coingecko:markets:${vsCurrency}:${ids?.join(',') || 'all'}:${limit}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params: Record<string, string> = {
    vs_currency: vsCurrency,
    order: 'market_cap_desc',
    per_page: limit.toString(),
    page: '1',
    sparkline: 'false',
  }

  if (ids && ids.length > 0) {
    params.ids = ids.join(',')
  }

  const data = await makeRequest('/coins/markets', params)
  
  if (Array.isArray(data)) {
    const result = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      fullyDilutedValuation: coin.fully_diluted_valuation,
      totalVolume: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      priceChange24h: coin.price_change_24h,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      marketCapChange24h: coin.market_cap_change_24h,
      marketCapChangePercentage24h: coin.market_cap_change_percentage_24h,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      maxSupply: coin.max_supply,
      ath: coin.ath,
      athChangePercentage: coin.ath_change_percentage,
      athDate: coin.ath_date,
      atl: coin.atl,
      atlChangePercentage: coin.atl_change_percentage,
      atlDate: coin.atl_date,
      lastUpdated: coin.last_updated,
    }))
    
    // Cache for 2 minutes
    await setCached(cacheKey, result, 120)
    return result
  }

  return []
}

/**
 * Get cryptocurrency price data
 */
export async function getPriceData(
  ids: string | string[],
  vsCurrencies: string | string[] = 'usd',
  includeMarketCap: boolean = true,
  include24hrVol: boolean = true,
  include24hrChange: boolean = true
): Promise<any> {
  const idArray = Array.isArray(ids) ? ids : [ids]
  const vsArray = Array.isArray(vsCurrencies) ? vsCurrencies : [vsCurrencies]
  const cacheKey = `coingecko:price:${idArray.join(',')}:${vsArray.join(',')}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params: Record<string, string> = {
    ids: Array.isArray(ids) ? ids.join(',') : ids,
    vs_currencies: Array.isArray(vsCurrencies) ? vsCurrencies.join(',') : vsCurrencies,
    include_market_cap: includeMarketCap.toString(),
    include_24hr_vol: include24hrVol.toString(),
    include_24hr_change: include24hrChange.toString(),
  }

  const data = await makeRequest('/simple/price', params)
  
  // Cache for 2 minutes
  await setCached(cacheKey, data, 120)
  return data
}

/**
 * Get cryptocurrency historical data
 */
export async function getHistoricalData(
  id: string,
  vsCurrency: string = 'usd',
  days: number | 'max' = 30
): Promise<any[]> {
  const cacheKey = `coingecko:history:${id}:${vsCurrency}:${days}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params: Record<string, string> = {
    vs_currency: vsCurrency,
    days: days.toString(),
  }

  const data = await makeRequest(`/coins/${id}/market_chart`, params)
  
  if (data.prices && Array.isArray(data.prices)) {
    const result = data.prices.map(([timestamp, price]: [number, number]) => ({
      date: new Date(timestamp).toISOString(),
      price: price,
      marketCap: data.market_caps?.[data.prices.indexOf([timestamp, price])]?.[1],
      volume: data.total_volumes?.[data.prices.indexOf([timestamp, price])]?.[1],
    }))
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result
  }

  return []
}

/**
 * Get global cryptocurrency market statistics
 */
export async function getGlobalMarketData(): Promise<any> {
  const cacheKey = 'coingecko:global'
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const data = await makeRequest('/global')
  
  if (data.data) {
    const result = {
      totalMarketCap: data.data.total_market_cap?.usd || 0,
      totalVolume: data.data.total_volume?.usd || 0,
      marketCapPercentage: data.data.market_cap_percentage || {},
      marketCapChangePercentage24hUsd:
        data.data.market_cap_change_percentage_24h_usd || 0,
      activeCryptocurrencies: data.data.active_cryptocurrencies || 0,
      markets: data.data.markets || 0,
    }
    
    // Cache for 5 minutes
    await setCached(cacheKey, result, 300)
    return result
  }

  throw new Error('Invalid response from CoinGecko')
}

