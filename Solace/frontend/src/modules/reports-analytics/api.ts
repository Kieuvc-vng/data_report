import type { Position, HiringSummary } from './types'

/**
 * Hiring Dashboard API endpoints
 * These stubs will be implemented with real API calls in Phase 4
 */

/**
 * Fetches all hiring positions
 * @returns Array of positions with hiring pipeline data
 */
export async function getHiringPositions(): Promise<Position[]> {
  // TODO: Implement real API call in Phase 4
  return []
}

/**
 * Fetches hiring metrics and summary statistics
 * @returns Hiring summary with key metrics
 */
export async function getHiringMetrics(): Promise<HiringSummary> {
  // TODO: Implement real API call in Phase 4
  return {
    dateRange: { start: '', end: '' },
    totalHired: 0,
    salaryRange: '',
    hcTotal: 0,
    pipeline: { cv: 0, firstInterview: 0, secondInterview: 0, offers: 0 },
    timeToFill: 0,
    offerAcceptanceRate: 0,
    offersCount: 0,
    onboardedCount: 0,
    rejectReasons: {
      allReasons: {},
      candidateWithdrawn: 0,
    },
  }
}

/**
 * Fetches historical hiring data based on provided parameters
 * @param params Query parameters for filtering historical data
 * @returns Historical data for analytics
 */
export async function getHistoricalData(params: any): Promise<any> {
  // TODO: Implement real API call in Phase 4
  return {}
}
