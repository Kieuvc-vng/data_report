/**
 * API Endpoint Definitions
 * Centralized configuration for all API routes
 */

export const ENDPOINTS = {
  // Analytics endpoints
  summary: '/api/analytics/summary',
  activeSla: '/api/analytics/active-sla',
  jobDetail: (jobCode: string) => `/api/analytics/job/${jobCode}`,

  // Historical data endpoints
  historicalPositions: '/api/analytics/historical-positions',
  historicalMetrics: '/api/analytics/historical-metrics',

  // Supporting data endpoints
  businessUnits: '/api/analytics/business-units',
  departments: (bu: string) => `/api/analytics/business-units/${bu}/departments`,
  positions: (bu: string, dept: string) =>
    `/api/analytics/business-units/${bu}/departments/${dept}/positions`,
} as const
