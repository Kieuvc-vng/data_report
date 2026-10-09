/**
 * Query Cache Layer
 * Provides TTL-based caching with invalidation support
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheOptions {
  ttl?: number // milliseconds
  forceRefresh?: boolean
}

/**
 * QueryCache manages caching of API responses with TTL and invalidation support
 */
export class QueryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTtl = 5 * 60 * 1000 // 5 minutes

  /**
   * Retrieve a cached value
   * @param key Cache key
   * @param options Cache options (ttl override, force refresh)
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string, options?: CacheOptions): T | null {
    if (options?.forceRefresh) {
      this.delete(key)
      return null
    }

    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Store a value in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Optional TTL override in milliseconds
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    })
  }

  /**
   * Delete a specific cache entry
   * @param key Cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern String pattern or RegExp to match keys
   */
  invalidate(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key)
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get the number of cached entries
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size
  }
}

/**
 * Singleton instance of QueryCache for application-wide use
 */
export const queryCache = new QueryCache()
