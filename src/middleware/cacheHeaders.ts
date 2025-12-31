import { Request, Response, NextFunction } from 'express'

interface CacheHeaderOptions {
  maxAge?: number // Maximum age in seconds
  sMaxAge?: number // Shared cache (CDN) max age in seconds
  staleWhileRevalidate?: number // Allow stale content while revalidating
  mustRevalidate?: boolean // Force revalidation
  public?: boolean // Allow public caching
  private?: boolean // Only allow private caching
}

/**
 * Middleware to add Cache-Control headers to API responses
 * Helps browsers and CDNs cache responses appropriately
 */
export function cacheHeaders(options: CacheHeaderOptions = {}) {
  const {
    maxAge = 60, // Default: 1 minute
    sMaxAge,
    staleWhileRevalidate,
    mustRevalidate = false,
    public: isPublic = false,
    private: isPrivate = false,
  } = options

  return (_req: Request, res: Response, next: NextFunction) => {
    // Build Cache-Control directive
    const directives: string[] = []

    if (isPrivate) {
      directives.push('private')
    } else if (isPublic) {
      directives.push('public')
    } else {
      // Default: private for authenticated/sensitive data
      directives.push('private')
    }

    directives.push(`max-age=${maxAge}`)

    if (sMaxAge) {
      directives.push(`s-maxage=${sMaxAge}`)
    }

    if (staleWhileRevalidate) {
      directives.push(`stale-while-revalidate=${staleWhileRevalidate}`)
    }

    if (mustRevalidate) {
      directives.push('must-revalidate')
    }

    // Add Cache-Control header
    res.setHeader('Cache-Control', directives.join(', '))

    // Add ETag support hint
    res.setHeader('Vary', 'Accept-Encoding')

    next()
  }
}

/**
 * Predefined cache header configurations for different data types
 */
export const cacheConfigs = {
  // Real-time data (stocks, crypto, FX) - short cache, allow stale while revalidating
  realtime: cacheHeaders({
    maxAge: 30, // 30 seconds
    staleWhileRevalidate: 60, // Allow stale content for 1 minute while revalidating
    private: true,
  }),

  // Market data - slightly longer cache
  marketData: cacheHeaders({
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 120, // 2 minutes stale while revalidating
    private: true,
  }),

  // Company/Corporate data - longer cache (changes less frequently)
  corporateData: cacheHeaders({
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes stale while revalidating
    private: true,
  }),

  // News articles - medium cache
  news: cacheHeaders({
    maxAge: 180, // 3 minutes
    staleWhileRevalidate: 300, // 5 minutes stale while revalidating
    public: true, // News can be cached publicly
  }),

  // Historical data - long cache (doesn't change)
  historical: cacheHeaders({
    maxAge: 3600, // 1 hour
    sMaxAge: 86400, // 24 hours for CDN
    staleWhileRevalidate: 7200, // 2 hours stale while revalidating
    public: true,
  }),

  // Static reference data - very long cache
  static: cacheHeaders({
    maxAge: 86400, // 24 hours
    sMaxAge: 604800, // 7 days for CDN
    public: true,
  }),

  // No cache - for sensitive/private data
  noCache: cacheHeaders({
    maxAge: 0,
    mustRevalidate: true,
    private: true,
  }),
}

export default cacheHeaders

