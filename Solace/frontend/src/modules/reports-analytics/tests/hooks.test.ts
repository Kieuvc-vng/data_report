import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQuery } from '../hooks/useQuery'
import { queryCache } from '../api/cache'

describe('useQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Clear all cache entries
    queryCache.clear()
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'test' }
    const queryFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useQuery('test-success', queryFn))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('should handle errors', async () => {
    const error = new Error('Test error')
    const queryFn = vi.fn().mockRejectedValue(error)

    const { result } = renderHook(() =>
      useQuery('test-error', queryFn, { retry: 0 }),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data).toBeNull()
  })

  it('should refetch data', async () => {
    const mockData = { id: 1 }
    const queryFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useQuery('test-refetch', queryFn))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)

    await result.current.refetch()

    expect(queryFn).toHaveBeenCalledTimes(2)
  })
})
