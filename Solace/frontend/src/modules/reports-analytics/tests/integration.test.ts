import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQuery } from '../hooks/useQuery'
import * as api from '../api'
import { queryCache } from '../api/cache'

// Mock response data
const mockMetricsData = {
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  totalHired: 10,
  salaryRange: '$50K - $100K',
  hcTotal: 50,
  pipeline: { cv: 30, firstInterview: 15, secondInterview: 5, offers: 2 },
  timeToFill: 45,
  offerAcceptanceRate: 80,
  offersCount: 2,
  onboardedCount: 1,
  rejectReasons: {
    byStage: {
      cv: { 'Not qualified': 10 },
      firstInterview: { 'Culture fit': 5 },
      secondInterview: { 'Salary expectation': 2 },
    },
    allReasons: { 'Not qualified': 10, 'Culture fit': 5, 'Salary expectation': 2 },
    candidateWithdrawn: 3,
  },
}

const mockPositionsData = [
  {
    id: '1',
    title: 'Senior Engineer',
    level: 'L5',
    salary: '$100K - $150K',
    hc: 2,
    priority: 'P1' as const,
    status: 'open' as const,
    department: 'Engineering',
    businessUnit: 'Technology',
    jobCode: 'JC001',
    pipeline: {
      cv: 10,
      firstInterview: 5,
      secondInterview: 2,
      offers: 1,
    },
    rejectReasons: {
      byStage: {
        cv: { 'Not qualified': 5 },
      },
      candidateWithdrawn: 0,
    },
    createdDate: '2024-01-01',
    estimatedFillDays: 45,
    onboardedCount: 0,
  },
  {
    id: '2',
    title: 'Product Manager',
    level: 'L4',
    salary: '$80K - $120K',
    hc: 1,
    priority: 'P2' as const,
    status: 'open' as const,
    department: 'Product',
    businessUnit: 'Technology',
    jobCode: 'JC002',
    pipeline: {
      cv: 15,
      firstInterview: 8,
      secondInterview: 3,
      offers: 1,
    },
    rejectReasons: {
      byStage: {
        cv: { 'Not relevant experience': 7 },
      },
      candidateWithdrawn: 1,
    },
    createdDate: '2024-01-15',
    estimatedFillDays: 50,
    onboardedCount: 0,
  },
]

describe('API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryCache.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch hiring metrics successfully', async () => {
    // Mock fetch to return metrics data
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockMetricsData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const { result } = renderHook(() =>
      useQuery('metrics', () => api.getHiringMetrics()),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockMetricsData)
    expect(result.current.error).toBeNull()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/analytics/summary',
      expect.any(Object),
    )
  })

  it('should fetch hiring positions successfully', async () => {
    // Mock fetch to return positions data
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: mockPositionsData,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )

    const { result } = renderHook(() =>
      useQuery('positions', () => api.getHiringPositions()),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].title).toBe('Senior Engineer')
    expect(result.current.data?.[1].title).toBe('Product Manager')
    expect(result.current.data?.[0].pipeline).toEqual({
      cv: 10,
      firstInterview: 5,
      secondInterview: 2,
      offers: 1,
    })
    expect(result.current.error).toBeNull()
  })

  it('should cache metrics on subsequent calls', async () => {
    let callCount = 0
    global.fetch = vi.fn(() => {
      callCount++
      return Promise.resolve(
        new Response(JSON.stringify(mockMetricsData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    const { result: result1 } = renderHook(() =>
      useQuery('metrics-cache-test', () => api.getHiringMetrics()),
    )

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false)
    })

    const firstData = result1.current.data
    const callsAfterFirst = callCount

    // Fetch again with same cache key - should return cached data
    const { result: result2 } = renderHook(() =>
      useQuery('metrics-cache-test', () => api.getHiringMetrics()),
    )

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false)
    })

    // Data should be identical (from cache)
    expect(result2.current.data).toEqual(firstData)
    // Fetch should not have been called again due to cache
    expect(callCount).toBe(callsAfterFirst)
  })

  it('should handle refetch for metrics', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockMetricsData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const { result } = renderHook(
      () => useQuery('metrics-refetch-test-v2', () => api.getHiringMetrics()),
    )

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const firstData = result.current.data
    expect(firstData?.totalHired).toBe(10)

    // Clear cache and call refetch
    queryCache.clear()
    await result.current.refetch()

    // After refetch, data should still be valid
    expect(result.current.data).toEqual(firstData)
    // Refetch should have been called successfully
    expect(result.current.error).toBeNull()
  })
})
