import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpClient } from '../api/client'
import { ApiError, TimeoutError } from '../api/errors'

describe('HttpClient', () => {
  let client: HttpClient

  beforeEach(() => {
    client = new HttpClient({
      baseUrl: 'http://localhost:4000',
      timeout: 5000,
      retries: 2,
      retryDelay: 1000,
    })
    vi.clearAllMocks()
  })

  it('should make successful GET request', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: 'test' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
    const result = await client.request('/test')
    expect(result).toEqual({ data: 'test' })
  })

  it('should throw ApiError on non-200 status', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
    await expect(client.request('/test')).rejects.toThrow(ApiError)
  })

  it('should retry on timeout', async () => {
    let attemptCount = 0
    global.fetch = vi.fn(() => {
      attemptCount++
      if (attemptCount === 1) {
        return Promise.reject(new DOMException('', 'AbortError'))
      }
      return Promise.resolve(
        new Response(JSON.stringify({ data: 'success' }), {
          status: 200,
        }),
      )
    })
    const result = await client.request('/test', { retries: 2 })
    expect(result).toEqual({ data: 'success' })
    expect(attemptCount).toBe(2)
  })

  it('should throw TimeoutError after max retries', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new DOMException('', 'AbortError')),
    )
    await expect(
      client.request('/test', { retries: 1, timeout: 100 }),
    ).rejects.toThrow(TimeoutError)
  })
})
