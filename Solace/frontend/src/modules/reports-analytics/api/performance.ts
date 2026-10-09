/**
 * Performance Optimization Layer
 * Provides request deduplication and performance monitoring
 */

interface PendingRequest {
  promise: Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
}

/**
 * RequestDeduplicator prevents duplicate concurrent requests
 * If a request is already in-flight with the same key, returns the existing promise
 */
export class RequestDeduplicator {
  private pending = new Map<string, PendingRequest>()

  /**
   * Execute a function, deduplicating concurrent calls with the same key
   * @param key Unique identifier for this request
   * @param fn Async function to execute
   * @returns Promise that resolves with the result
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    // Return existing request if pending
    if (this.pending.has(key)) {
      return this.pending.get(key)!.promise as Promise<T>
    }

    // Create new promise
    let resolve: (value: T) => void
    let reject: (error: any) => void

    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })

    this.pending.set(key, { promise, resolve: resolve!, reject: reject! })

    try {
      const result = await fn()
      resolve!(result)
      return result
    } catch (error) {
      reject!(error)
      throw error
    } finally {
      this.pending.delete(key)
    }
  }
}

/**
 * Singleton instance of RequestDeduplicator for application-wide use
 */
export const deduplicator = new RequestDeduplicator()

/**
 * Log API performance metrics
 * Only logs in debug mode (VITE_LOG_LEVEL=debug)
 * @param name Name of the API operation
 * @param duration Time taken in milliseconds
 * @param success Whether the operation was successful
 */
export function logPerformance(
  name: string,
  duration: number,
  success: boolean,
): void {
  if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
    const status = success ? '✓' : '✗'
    console.log(
      `[API] ${status} ${name} completed in ${duration}ms`,
    )
  }
}
