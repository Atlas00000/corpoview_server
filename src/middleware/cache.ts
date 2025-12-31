import { Request, Response, NextFunction } from 'express'
import getRedisClient from '../config/redis'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  keyPrefix?: string
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, keyPrefix = 'cache:' } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    const cacheKey = `${keyPrefix}${req.method}:${req.originalUrl}`

    try {
      // Try to get from cache
      const cachedData = await redis.get(cacheKey)

      if (cachedData) {
        return res.json(JSON.parse(cachedData))
      }

      // If not in cache, intercept the response
      const originalJson = res.json.bind(res)

      res.json = function (body: any) {
        // Cache the response
        redis.setex(cacheKey, ttl, JSON.stringify(body)).catch((err) => {
          console.error('Cache set error:', err)
        })

        // Send the original response
        return originalJson(body)
      }

      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      // Continue without caching if Redis fails
      next()
    }
    return undefined
  }
}

