/**
 * Hiring Dashboard API Layer
 * Real API implementations with error handling, retry logic, and caching
 */

import { createHttpClient } from './api/client'
import { ENDPOINTS } from './api/endpoints'
import { queryCache } from './api/cache'
import { deduplicator, logPerformance } from './api/performance'
import type { Position, HiringSummary } from './types'

const httpClient = createHttpClient()

/**
 * Fetches all hiring positions
 * @param filters Optional filters for business unit and department
 * @returns Array of positions with hiring pipeline data
 */
export async function getHiringPositions(
  filters?: {
    businessUnit?: string
    department?: string
  },
): Promise<Position[]> {
  const cacheKey = `positions:${filters?.businessUnit}:${filters?.department}`

  return deduplicator.execute(cacheKey, async () => {
    const cached = queryCache.get<Position[]>(cacheKey)
    if (cached) return cached

    const startTime = performance.now()
    try {
      const endpoint = filters?.businessUnit
        ? ENDPOINTS.positions(filters.businessUnit, filters.department || '')
        : ENDPOINTS.activeSla // List all active positions when no filter provided

      const response = await httpClient.request<{ data: Position[] }>(endpoint)
      const data = response.data || []

      queryCache.set(cacheKey, data)
      const duration = performance.now() - startTime
      logPerformance('getHiringPositions', duration, true)
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logPerformance('getHiringPositions', duration, false)
      console.error('Failed to fetch hiring positions:', error)
      throw error
    }
  })
}

/**
 * Fetches hiring metrics and summary statistics
 * @param filters Optional filters for date range, business unit, and department
 * @returns Hiring summary with key metrics
 */
export async function getHiringMetrics(
  filters?: {
    startDate?: string
    endDate?: string
    businessUnit?: string
    department?: string
  },
): Promise<HiringSummary> {
  const cacheKey = `metrics:${filters?.startDate}:${filters?.endDate}:${filters?.businessUnit}:${filters?.department}`

  return deduplicator.execute(cacheKey, async () => {
    const cached = queryCache.get<HiringSummary>(cacheKey)
    if (cached) return cached

    const startTime = performance.now()
    try {
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.businessUnit) params.append('businessUnit', filters.businessUnit)
      if (filters?.department) params.append('department', filters.department)

      const endpoint = `${ENDPOINTS.summary}${params.toString() ? '?' + params.toString() : ''}`

      const data = await httpClient.request<HiringSummary>(endpoint)
      queryCache.set(cacheKey, data)
      const duration = performance.now() - startTime
      logPerformance('getHiringMetrics', duration, true)
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logPerformance('getHiringMetrics', duration, false)
      console.error('Failed to fetch hiring metrics:', error)
      throw error
    }
  })
}

/**
 * Fetches historical hiring data based on provided parameters
 * @param params Query parameters for filtering historical data
 * @returns Historical data for analytics
 */
export async function getHistoricalData(
  params: Record<string, string | number>,
): Promise<Record<string, unknown>> {
  const cacheKey = `historical:${Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(':')}`

  return deduplicator.execute(cacheKey, async () => {
    const cached = queryCache.get<Record<string, unknown>>(cacheKey)
    if (cached) return cached

    const startTime = performance.now()
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value))
      })

      const endpoint = `${ENDPOINTS.historicalMetrics}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const data = await httpClient.request<Record<string, unknown>>(endpoint)
      queryCache.set(cacheKey, data)
      const duration = performance.now() - startTime
      logPerformance('getHistoricalData', duration, true)
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logPerformance('getHistoricalData', duration, false)
      console.error('Failed to fetch historical data:', error)
      throw error
    }
  })
}

/**
 * Fetches details for a specific job position
 * @param jobCode The job code identifier
 * @returns Position details
 */
export async function getJobDetail(jobCode: string): Promise<Position> {
  const cacheKey = `jobDetail:${jobCode}`

  return deduplicator.execute(cacheKey, async () => {
    const cached = queryCache.get<Position>(cacheKey)
    if (cached) return cached

    const startTime = performance.now()
    try {
      const data = await httpClient.request<Position>(ENDPOINTS.jobDetail(jobCode))
      queryCache.set(cacheKey, data)
      const duration = performance.now() - startTime
      logPerformance('getJobDetail', duration, true)
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logPerformance('getJobDetail', duration, false)
      console.error(`Failed to fetch job detail for ${jobCode}:`, error)
      throw error
    }
  })
}

/**
 * Fetches list of available business units
 * @returns Array of business unit names
 */
export async function getBusinessUnits(): Promise<string[]> {
  const cacheKey = 'businessUnits'

  return deduplicator.execute(cacheKey, async () => {
    const cached = queryCache.get<string[]>(cacheKey)
    if (cached) return cached

    const startTime = performance.now()
    try {
      const response = await httpClient.request<{ data: string[] }>(
        ENDPOINTS.businessUnits,
      )
      const data = response.data || []
      queryCache.set(cacheKey, data)
      const duration = performance.now() - startTime
      logPerformance('getBusinessUnits', duration, true)
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logPerformance('getBusinessUnits', duration, false)
      console.error('Failed to fetch business units:', error)
      throw error
    }
  })
}

/**
 * Fetches departments for a specific business unit
 * @param businessUnit Business unit identifier
 * @returns Array of department names
 */
export async function getDepartments(businessUnit: string): Promise<string[]> {
  const cacheKey = `departments:${businessUnit}`

  return deduplicator.execute(cacheKey, async () => {
    const cached = queryCache.get<string[]>(cacheKey)
    if (cached) return cached

    const startTime = performance.now()
    try {
      const response = await httpClient.request<{ data: string[] }>(
        ENDPOINTS.departments(businessUnit),
      )
      const data = response.data || []
      queryCache.set(cacheKey, data)
      const duration = performance.now() - startTime
      logPerformance('getDepartments', duration, true)
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logPerformance('getDepartments', duration, false)
      console.error(`Failed to fetch departments for ${businessUnit}:`, error)
      throw error
    }
  })
}

/**
 * Export queryCache for cache invalidation in hooks and other modules
 */
export { queryCache }
