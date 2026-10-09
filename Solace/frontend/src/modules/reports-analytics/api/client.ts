/**
 * HTTP Client with Error Handling, Timeout Management, and Retry Logic
 * Provides a robust layer for API communication
 */

import { ApiError, TimeoutError, NetworkError } from './errors'

interface ClientConfig {
  baseUrl: string
  timeout: number
  retries: number
  retryDelay: number
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

export class HttpClient {
  private config: ClientConfig

  constructor(config: ClientConfig) {
    this.config = config
  }

  /**
   * Make an HTTP request with automatic retry and timeout handling
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    const timeout = options.timeout ?? this.config.timeout
    const retries = options.retries ?? this.config.retries

    return this.requestWithRetry(url, options, retries, timeout)
  }

  /**
   * Internal method handling retry logic and timeout management
   */
  private async requestWithRetry<T>(
    url: string,
    options: RequestOptions,
    retriesLeft: number,
    timeout: number,
  ): Promise<T> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json().catch(() => ({} as Record<string, unknown>))
        throw new ApiError(response.status, response.statusText, data)
      }

      return response.json() as Promise<T>
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (retriesLeft > 0) {
          await new Promise(r => setTimeout(r, this.config.retryDelay))
          return this.requestWithRetry(url, options, retriesLeft - 1, timeout)
        }
        throw new TimeoutError()
      }

      if (error instanceof TypeError) {
        throw new NetworkError(error.message)
      }

      throw error
    }
  }
}

/**
 * Factory function to create HttpClient with environment-based configuration
 */
export function createHttpClient(): HttpClient {
  const baseUrl =
    import.meta.env.VITE_API_PROXY || 'http://localhost:4000'
  const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')
  const retries = 2

  return new HttpClient({
    baseUrl,
    timeout,
    retries,
    retryDelay: 1000,
  })
}
