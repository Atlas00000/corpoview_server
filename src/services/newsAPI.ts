import axios from 'axios'
import { API_CONFIG } from '../config/api'
import getRedisClient from '../config/redis'

const apiKey = API_CONFIG.newsAPI.apiKey
const baseUrl = API_CONFIG.newsAPI.baseUrl

if (!apiKey) {
  console.warn('NewsAPI key not configured')
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
    throw new Error('NewsAPI key not configured')
  }

  const response = await axios.get(`${baseUrl}${endpoint}`, {
    params: {
      ...params,
      apiKey: apiKey,
    },
    timeout: 10000,
  })

  if (response.data.status === 'error') {
    throw new Error(response.data.message || 'NewsAPI error')
  }

  return response.data
}

/**
 * Get top headlines
 */
export async function getTopHeadlines(
  category?: string,
  country: string = 'us',
  pageSize: number = 20
): Promise<any[]> {
  const cacheKey = `newsapi:headlines:${category || 'all'}:${country}:${pageSize}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params: Record<string, string> = {
    country: country,
    pageSize: pageSize.toString(),
  }

  if (category) {
    params.category = category
  }

  const data = await makeRequest('/top-headlines', params)
  
  if (data.articles && Array.isArray(data.articles)) {
    const result = data.articles.map((article: any) => ({
      source: article.source?.name || 'Unknown',
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      content: article.content,
    }))
    
    // Cache for 15 minutes
    await setCached(cacheKey, result, 900)
    return result
  }

  return []
}

/**
 * Search news articles
 */
export async function searchNews(
  query: string,
  language: string = 'en',
  sortBy: string = 'publishedAt',
  pageSize: number = 20
): Promise<any[]> {
  const cacheKey = `newsapi:search:${query}:${language}:${sortBy}:${pageSize}`
  
  // Try cache first
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const params: Record<string, string> = {
    q: query,
    language: language,
    sortBy: sortBy,
    pageSize: pageSize.toString(),
  }

  const data = await makeRequest('/everything', params)
  
  if (data.articles && Array.isArray(data.articles)) {
    const result = data.articles.map((article: any) => ({
      source: article.source?.name || 'Unknown',
      author: article.author,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      content: article.content,
    }))
    
    // Cache for 15 minutes
    await setCached(cacheKey, result, 900)
    return result
  }

  return []
}

/**
 * Get business news
 */
export async function getBusinessNews(pageSize: number = 20): Promise<any[]> {
  return getTopHeadlines('business', 'us', pageSize)
}

