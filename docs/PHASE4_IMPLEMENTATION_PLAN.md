# Phase 4: Real API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect Hiring Dashboard to real backend APIs, implement authentication, caching, and error handling for production-ready integration with Solace ATS.

**Architecture:** 
- API client with error handling, timeouts, and retry logic
- Authentication layer using Entra ID OAuth (Device Code flow)
- Query caching with invalidation strategy
- Loading states and error boundaries for UX
- Comprehensive test coverage (unit + integration)

**Tech Stack:** React 19, TypeScript, Zustand (state), Recharts (charts), fetch API + custom client, MSW (mocking for tests)

---

## File Structure

### New Files to Create
```
Solace/frontend/src/modules/reports-analytics/
├── api/
│   ├── client.ts           (HTTP client with error handling, timeouts)
│   ├── endpoints.ts        (API endpoint definitions)
│   ├── cache.ts            (Caching layer with invalidation)
│   └── errors.ts           (Custom error types)
├── auth/
│   ├── useAuth.ts          (React hook for auth state)
│   ├── authService.ts      (Entra ID OAuth integration)
│   └── types.ts            (Auth types)
├── hooks/
│   ├── useQuery.ts         (Custom query hook with caching)
│   ├── useMutation.ts      (Custom mutation hook)
│   └── useErrorHandler.ts  (Error handling hook)
├── components/
│   ├── ErrorBoundary.tsx   (React error boundary)
│   └── HiringDashboardTab/
│       └── LoadingState.tsx (Skeleton loaders)
└── tests/
    ├── api.test.ts         (API client tests)
    ├── auth.test.ts        (Auth integration tests)
    └── hooks.test.ts       (Query hook tests)
```

### Modified Files
```
Solace/frontend/src/modules/reports-analytics/
├── api.ts                  (Replace stubs with real calls)
├── pages/HiringDashboardPage.tsx
├── components/HiringDashboardTab/
│   ├── CurrentOpeningsTab.tsx
│   ├── HistoricalAnalyticsPage.tsx
│   └── (components using new hooks)
├── ReportsLayout.tsx       (Add error boundary)
└── .env.local / .env.production (Environment config)
```

---

## Task 1: Create HTTP Client with Error Handling

**Files:**
- Create: `api/client.ts`
- Create: `api/errors.ts`
- Modify: `api.ts`

### Step 1: Define custom error types

```typescript
// api/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public response?: any,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error') {
    super(message)
    this.name = 'NetworkError'
  }
}

export type ApiErrorType = ApiError | TimeoutError | NetworkError
```

- [ ] Write code
- [ ] Commit: `feat: add custom error types for API layer`

### Step 2: Create HTTP client with timeout and retry

```typescript
// api/client.ts
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

  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    const timeout = options.timeout ?? this.config.timeout
    const retries = options.retries ?? this.config.retries

    return this.requestWithRetry(url, options, retries, timeout)
  }

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
        const data = await response.json().catch(() => ({}))
        throw new ApiError(response.status, response.statusText, data)
      }

      return response.json() as Promise<T>
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (retriesLeft > 0) {
          await new Promise(r => setTimeout(r, options.retries ?? 1000))
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

// Factory function
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
```

- [ ] Write code
- [ ] Commit: `feat: add HTTP client with timeout and retry logic`

### Step 3: Create API endpoint definitions

```typescript
// api/endpoints.ts
export const ENDPOINTS = {
  // Analytics
  summary: '/api/analytics/summary',
  activeSla: '/api/analytics/active-sla',
  jobDetail: (jobCode: string) => `/api/analytics/job/${jobCode}`,
  
  // Historical
  historicalPositions: '/api/analytics/historical-positions',
  historicalMetrics: '/api/analytics/historical-metrics',
  
  // Supporting endpoints
  businessUnits: '/api/analytics/business-units',
  departments: (bu: string) => `/api/analytics/business-units/${bu}/departments`,
  positions: (bu: string, dept: string) => 
    `/api/analytics/business-units/${bu}/departments/${dept}/positions`,
} as const
```

- [ ] Write code
- [ ] Commit: `feat: define API endpoint constants`

### Step 4: Update api.ts with real endpoint calls

```typescript
// api.ts (replace old stubs)
import { createHttpClient } from './api/client'
import { ENDPOINTS } from './api/endpoints'
import type { Position, HiringSummary } from './types'

const httpClient = createHttpClient()

export async function getHiringPositions(
  filters?: {
    businessUnit?: string
    department?: string
  },
): Promise<Position[]> {
  try {
    const endpoint = filters?.businessUnit
      ? ENDPOINTS.positions(filters.businessUnit, filters.department || '')
      : ENDPOINTS.activeSla

    const response = await httpClient.request<{ data: Position[] }>(endpoint)
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch hiring positions:', error)
    throw error
  }
}

export async function getHiringMetrics(
  filters?: {
    startDate?: string
    endDate?: string
    businessUnit?: string
    department?: string
  },
): Promise<HiringSummary> {
  try {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.businessUnit) params.append('businessUnit', filters.businessUnit)
    if (filters?.department) params.append('department', filters.department)

    const endpoint = `${ENDPOINTS.summary}${params.toString() ? '?' + params.toString() : ''}`

    return await httpClient.request<HiringSummary>(endpoint)
  } catch (error) {
    console.error('Failed to fetch hiring metrics:', error)
    throw error
  }
}

export async function getHistoricalData(
  params: any,
): Promise<any> {
  try {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value))
    })

    const endpoint = `${ENDPOINTS.historicalMetrics}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

    return await httpClient.request(endpoint)
  } catch (error) {
    console.error('Failed to fetch historical data:', error)
    throw error
  }
}

export async function getJobDetail(jobCode: string): Promise<Position> {
  try {
    return await httpClient.request<Position>(ENDPOINTS.jobDetail(jobCode))
  } catch (error) {
    console.error(`Failed to fetch job detail for ${jobCode}:`, error)
    throw error
  }
}

export async function getBusinessUnits(): Promise<string[]> {
  try {
    const response = await httpClient.request<{ data: string[] }>(
      ENDPOINTS.businessUnits,
    )
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch business units:', error)
    throw error
  }
}

export async function getDepartments(businessUnit: string): Promise<string[]> {
  try {
    const response = await httpClient.request<{ data: string[] }>(
      ENDPOINTS.departments(businessUnit),
    )
    return response.data || []
  } catch (error) {
    console.error(`Failed to fetch departments for ${businessUnit}:`, error)
    throw error
  }
}
```

- [ ] Write code
- [ ] Commit: `feat: implement real API calls in api.ts`

### Step 5: Test HTTP client in isolation

```bash
npm run test -- api/client.test.ts
```

Expected: All tests pass (will create in Task 6)

---

## Task 2: Create Caching Layer

**Files:**
- Create: `api/cache.ts`

### Step 1: Implement cache with TTL and invalidation

```typescript
// api/cache.ts
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // milliseconds
  forceRefresh?: boolean
}

export class QueryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTtl = 5 * 60 * 1000 // 5 minutes

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

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  invalidate(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const queryCache = new QueryCache()
```

- [ ] Write code
- [ ] Commit: `feat: add caching layer with TTL and invalidation`

### Step 2: Integrate cache into API layer

Modify `api.ts`:

```typescript
// Add at top after imports
import { queryCache } from './api/cache'

// Update getHiringPositions
export async function getHiringPositions(
  filters?: {
    businessUnit?: string
    department?: string
  },
): Promise<Position[]> {
  const cacheKey = `positions:${filters?.businessUnit}:${filters?.department}`
  
  const cached = queryCache.get<Position[]>(cacheKey)
  if (cached) return cached

  try {
    const endpoint = filters?.businessUnit
      ? ENDPOINTS.positions(filters.businessUnit, filters.department || '')
      : ENDPOINTS.activeSla

    const response = await httpClient.request<{ data: Position[] }>(endpoint)
    const data = response.data || []
    
    queryCache.set(cacheKey, data)
    return data
  } catch (error) {
    console.error('Failed to fetch hiring positions:', error)
    throw error
  }
}

// Update getHiringMetrics similarly
export async function getHiringMetrics(
  filters?: {
    startDate?: string
    endDate?: string
    businessUnit?: string
    department?: string
  },
): Promise<HiringSummary> {
  const cacheKey = `metrics:${filters?.startDate}:${filters?.endDate}:${filters?.businessUnit}:${filters?.department}`
  
  const cached = queryCache.get<HiringSummary>(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.businessUnit) params.append('businessUnit', filters.businessUnit)
    if (filters?.department) params.append('department', filters.department)

    const endpoint = `${ENDPOINTS.summary}${params.toString() ? '?' + params.toString() : ''}`

    const data = await httpClient.request<HiringSummary>(endpoint)
    queryCache.set(cacheKey, data)
    return data
  } catch (error) {
    console.error('Failed to fetch hiring metrics:', error)
    throw error
  }
}

// Export cache for invalidation
export { queryCache }
```

- [ ] Modify api.ts with cache integration
- [ ] Commit: `feat: integrate caching into API calls`

---

## Task 3: Create Authentication Integration

**Files:**
- Create: `auth/types.ts`
- Create: `auth/authService.ts`
- Create: `auth/useAuth.ts`

### Step 1: Define auth types

```typescript
// auth/types.ts
export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  roles: string[]
  department?: string
}

export interface AuthContext {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  login(): Promise<void>
  logout(): Promise<void>
  refreshToken(): Promise<void>
}

export type UserRole = 'hrbp' | 'head_of_ta'
```

- [ ] Write code
- [ ] Commit: `feat: define authentication types`

### Step 2: Implement Entra ID OAuth service

```typescript
// auth/authService.ts
import type { AuthToken, AuthUser } from './types'

export class AuthService {
  private clientId = import.meta.env.VITE_ENTRA_CLIENT_ID || 'your-client-id'
  private tenantId = import.meta.env.VITE_ENTRA_TENANT_ID || 'your-tenant-id'
  private redirectUri = `${window.location.origin}/auth/callback`
  
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    this.loadFromStorage()
  }

  async initiateDeviceCodeFlow(): Promise<void> {
    try {
      // In development, skip auth
      if (import.meta.env.VITE_MULTIUSER === 'false') {
        this.setMockUser()
        return
      }

      // Device Code Flow (for server-side apps / CLIs)
      // Note: In real implementation, this would use MSAL library
      const response = await fetch(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/devicecode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: this.clientId,
            scope: 'https://graph.microsoft.com/.default',
          }).toString(),
        },
      )

      const data = await response.json()
      console.log('Device Code:', data.device_code)
      console.log('User Code:', data.user_code)
      console.log('Verification URI:', data.verification_uri)

      // Poll for token
      this.pollForToken(data.device_code)
    } catch (error) {
      console.error('Device code flow error:', error)
      throw error
    }
  }

  private async pollForToken(deviceCode: string): Promise<void> {
    const maxAttempts = 120 // 2 minutes
    let attempts = 0

    while (attempts < maxAttempts) {
      attempts++

      try {
        const response = await fetch(
          `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: this.clientId,
              device_code: deviceCode,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }).toString(),
          },
        )

        const data = await response.json()

        if (data.access_token) {
          this.setToken({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
          })
          return
        }

        if (data.error === 'authorization_pending') {
          await new Promise(r => setTimeout(r, 5000)) // Wait 5 seconds
          continue
        }

        throw new Error(data.error || 'Token fetch failed')
      } catch (error) {
        console.error('Token poll error:', error)
        throw error
      }
    }

    throw new Error('Token request timeout')
  }

  async getUser(): Promise<AuthUser> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      const userData = await response.json()

      return {
        id: userData.id,
        email: userData.userPrincipalName,
        name: userData.displayName,
        roles: this.extractRoles(userData),
        department: userData.department,
      }
    } catch (error) {
      console.error('Failed to get user info:', error)
      throw error
    }
  }

  private extractRoles(userData: any): string[] {
    // Map Entra ID roles/groups to app roles
    const roles: string[] = []
    
    // In real implementation, check user's groups in Azure
    // For now, use a simple mapping based on email/department
    if (userData.jobTitle?.includes('Head')) {
      roles.push('head_of_ta')
    } else if (userData.department) {
      roles.push('hrbp')
    }

    return roles
  }

  private setToken(token: AuthToken): void {
    this.accessToken = token.accessToken
    this.refreshToken = token.refreshToken || null
    this.saveToStorage(token)
  }

  private setMockUser(): void {
    // Mock user for development
    this.accessToken = 'mock-token'
    localStorage.setItem(
      'auth_token',
      JSON.stringify({
        accessToken: 'mock-token',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }),
    )
  }

  async logout(): Promise<void> {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: this.clientId,
            refresh_token: this.refreshToken,
            grant_type: 'refresh_token',
            scope: 'https://graph.microsoft.com/.default',
          }).toString(),
        },
      )

      const data = await response.json()
      this.setToken({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      })
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      throw error
    }
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  isTokenExpired(): boolean {
    const tokenData = localStorage.getItem('auth_token')
    if (!tokenData) return true

    try {
      const { expiresAt } = JSON.parse(tokenData)
      return Date.now() > expiresAt
    } catch {
      return true
    }
  }

  private saveToStorage(token: AuthToken): void {
    localStorage.setItem(
      'auth_token',
      JSON.stringify({
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: Date.now() + token.expiresIn * 1000,
      }),
    )
  }

  private loadFromStorage(): void {
    const tokenData = localStorage.getItem('auth_token')
    if (tokenData) {
      try {
        const { accessToken, refreshToken, expiresAt } = JSON.parse(tokenData)
        if (Date.now() < expiresAt) {
          this.accessToken = accessToken
          this.refreshToken = refreshToken
        }
      } catch {
        localStorage.removeItem('auth_token')
      }
    }
  }
}

export const authService = new AuthService()
```

- [ ] Write code
- [ ] Commit: `feat: implement Entra ID OAuth authentication service`

### Step 3: Create useAuth React hook

```typescript
// auth/useAuth.ts
import { create } from 'zustand'
import { authService } from './authService'
import type { AuthContext, AuthUser } from './types'

interface AuthState extends AuthContext {
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  
  setLoading: (isLoading) =>
    set({ isLoading }),
  
  setError: (error) =>
    set({ error }),
  
  login: async () => {
    set({ isLoading: true, error: null })
    try {
      await authService.initiateDeviceCodeFlow()
      const user = await authService.getUser()
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      })
      throw error
    }
  },
  
  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      })
      throw error
    }
  },
  
  refreshToken: async () => {
    try {
      await authService.refreshAccessToken()
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error(String(error)),
      })
      throw error
    }
  },
}))

export function useAuth(): AuthContext {
  return useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    logout: state.logout,
    refreshToken: state.refreshToken,
  }))
}

// Hook to get access token
export function useAccessToken(): string | null {
  return authService.getAccessToken()
}

// Initialize auth on app load
export async function initializeAuth(): Promise<void> {
  const store = useAuthStore.getState()
  
  if (authService.isTokenExpired()) {
    await store.refreshToken().catch(() => {
      // Auth failed, user needs to login
      console.log('Token expired, user needs to re-authenticate')
    })
  }
}
```

- [ ] Write code
- [ ] Commit: `feat: create useAuth React hook for authentication state management`

---

## Task 4: Create Custom Query Hooks

**Files:**
- Create: `hooks/useQuery.ts`
- Create: `hooks/useMutation.ts`
- Create: `hooks/useErrorHandler.ts`

### Step 1: Implement useQuery hook

```typescript
// hooks/useQuery.ts
import { useEffect, useState, useCallback } from 'react'
import { queryCache } from '../api/cache'
import type { ApiErrorType } from '../api/errors'
import { TimeoutError, NetworkError } from '../api/errors'

interface UseQueryOptions {
  enabled?: boolean
  staleTime?: number
  retry?: number
  onError?: (error: ApiErrorType) => void
  onSuccess?: (data: any) => void
  cacheKey?: string
}

interface UseQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: ApiErrorType | null
  refetch: () => Promise<void>
  invalidate: () => void
}

export function useQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: UseQueryOptions = {},
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorType | null>(null)

  const cacheKey = options.cacheKey || queryKey

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = queryCache.get<T>(cacheKey)
    if (cached) {
      setData(cached)
      return
    }

    setIsLoading(true)
    setError(null)

    let retries = options.retry ?? 2

    while (retries >= 0) {
      try {
        const result = await queryFn()
        queryCache.set(cacheKey, result)
        setData(result)
        options.onSuccess?.(result)
        setIsLoading(false)
        return
      } catch (err) {
        const apiError = err as ApiErrorType

        if (retries > 0 && (apiError instanceof TimeoutError || apiError instanceof NetworkError)) {
          retries--
          await new Promise(r => setTimeout(r, 1000))
          continue
        }

        setError(apiError)
        options.onError?.(apiError)
        setIsLoading(false)
        throw err
      }
    }
  }, [queryFn, cacheKey, options])

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData().catch(() => {
        // Error handled in state
      })
    }
  }, [fetchData, options.enabled])

  const refetch = useCallback(async () => {
    queryCache.delete(cacheKey)
    await fetchData()
  }, [fetchData, cacheKey])

  const invalidate = useCallback(() => {
    queryCache.delete(cacheKey)
    setData(null)
  }, [cacheKey])

  return { data, isLoading, error, refetch, invalidate }
}
```

- [ ] Write code
- [ ] Commit: `feat: implement useQuery hook with caching and retry`

### Step 2: Implement useMutation hook

```typescript
// hooks/useMutation.ts
import { useState, useCallback } from 'react'
import type { ApiErrorType } from '../api/errors'

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: ApiErrorType) => void
}

interface UseMutationResult<T> {
  mutate: () => Promise<T>
  data: T | null
  isLoading: boolean
  error: ApiErrorType | null
  reset: () => void
}

export function useMutation<T>(
  mutationFn: () => Promise<T>,
  options: UseMutationOptions<T> = {},
): UseMutationResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorType | null>(null)

  const mutate = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await mutationFn()
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const apiError = err as ApiErrorType
      setError(apiError)
      options.onError?.(apiError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [mutationFn, options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { mutate, data, isLoading, error, reset }
}
```

- [ ] Write code
- [ ] Commit: `feat: implement useMutation hook for API mutations`

### Step 3: Implement useErrorHandler hook

```typescript
// hooks/useErrorHandler.ts
import { useCallback } from 'react'
import { ApiError, TimeoutError, NetworkError } from '../api/errors'
import type { ApiErrorType } from '../api/errors'

interface ErrorMessage {
  title: string
  message: string
  action?: () => void
}

export function useErrorHandler() {
  const handleError = useCallback(
    (error: ApiErrorType): ErrorMessage => {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          return {
            title: 'Not Found',
            message: 'The requested resource was not found.',
          }
        }

        if (error.statusCode === 401) {
          return {
            title: 'Unauthorized',
            message: 'Your session has expired. Please log in again.',
            action: () => window.location.href = '/login',
          }
        }

        if (error.statusCode === 403) {
          return {
            title: 'Forbidden',
            message: 'You do not have permission to access this resource.',
          }
        }

        if (error.statusCode === 500) {
          return {
            title: 'Server Error',
            message: 'An error occurred on the server. Please try again later.',
          }
        }

        return {
          title: 'Error',
          message: error.message || 'An unexpected error occurred.',
        }
      }

      if (error instanceof TimeoutError) {
        return {
          title: 'Request Timeout',
          message: 'The request took too long. Please try again.',
        }
      }

      if (error instanceof NetworkError) {
        return {
          title: 'Network Error',
          message: 'Unable to connect to the server. Check your connection.',
        }
      }

      return {
        title: 'Error',
        message: 'An unexpected error occurred.',
      }
    },
    [],
  )

  return { handleError }
}
```

- [ ] Write code
- [ ] Commit: `feat: implement useErrorHandler hook for error formatting`

---

## Task 5: Create Error Boundary and Loading Components

**Files:**
- Create: `components/ErrorBoundary.tsx`
- Create: `components/HiringDashboardTab/LoadingState.tsx`

### Step 1: Implement ErrorBoundary component

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-semibold text-red-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-red-700">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

- [ ] Write code
- [ ] Commit: `feat: add ErrorBoundary component`

### Step 2: Implement LoadingState skeleton component

```typescript
// components/HiringDashboardTab/LoadingState.tsx
export const AccordionSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-gray-200 h-12 rounded animate-pulse"
      />
    ))}
  </div>
)

export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-gray-200 h-24 rounded animate-pulse"
      />
    ))}
  </div>
)

export const ChartSkeleton: React.FC = () => (
  <div className="bg-gray-200 h-64 rounded animate-pulse" />
)
```

- [ ] Write code
- [ ] Commit: `feat: add loading skeleton components`

---

## Task 6: Integrate Hooks into Components

**Files:**
- Modify: `components/HiringDashboardTab/CurrentOpeningsTab.tsx`
- Modify: `components/HiringDashboardTab/HistoricalAnalyticsPage.tsx`
- Modify: `pages/HiringDashboardPage.tsx`

### Step 1: Update CurrentOpeningsTab to use useQuery

Replace mock data with real API calls:

```typescript
// components/HiringDashboardTab/CurrentOpeningsTab.tsx
import React, { useState } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { getHiringPositions, getHiringMetrics } from '../../api'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import { AccordionSkeleton, MetricsSkeleton } from './LoadingState'

export const CurrentOpeningsTab: React.FC = () => {
  const [businessUnit, setBusinessUnit] = useState('')
  const { handleError } = useErrorHandler()

  // Fetch positions
  const {
    data: positions,
    isLoading: positionsLoading,
    error: positionsError,
    refetch: refetchPositions,
  } = useQuery(
    `positions:${businessUnit}`,
    () => getHiringPositions({ businessUnit: businessUnit || undefined }),
    {
      cacheKey: `positions:${businessUnit}`,
    },
  )

  // Fetch metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery(
    'metrics:current',
    () => getHiringMetrics({ businessUnit: businessUnit || undefined }),
    {
      cacheKey: 'metrics:current',
    },
  )

  if (positionsError) {
    const { title, message, action } = handleError(positionsError)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900">{title}</h3>
        <p className="text-sm text-red-700">{message}</p>
        {action && (
          <button
            onClick={action}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Business Unit Filter */}
      <select
        value={businessUnit}
        onChange={(e) => setBusinessUnit(e.target.value)}
        className="mb-6 px-3 py-2 border rounded"
      >
        <option value="">All Business Units</option>
        {/* TODO: Load from API */}
      </select>

      {/* Metrics Section */}
      {metricsLoading ? (
        <MetricsSkeleton />
      ) : (
        metrics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Total Hired</div>
              <div className="text-2xl font-bold">{metrics.totalHired}</div>
            </div>
            {/* More metric cards */}
          </div>
        )
      )}

      {/* Positions Accordion */}
      {positionsLoading ? (
        <AccordionSkeleton />
      ) : positions && positions.length > 0 ? (
        <div className="space-y-4">
          {/* Render position accordions */}
        </div>
      ) : (
        <p className="text-gray-500">No positions found</p>
      )}

      {/* Refresh Button */}
      <button
        onClick={async () => {
          await refetchPositions()
          await refetchMetrics()
        }}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Data
      </button>
    </div>
  )
}
```

- [ ] Modify component
- [ ] Commit: `feat: integrate useQuery into CurrentOpeningsTab`

### Step 2: Update HistoricalAnalyticsPage to use useQuery

```typescript
// components/HiringDashboardTab/HistoricalAnalyticsPage.tsx
import React, { useState } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { getHistoricalData } from '../../api'
import { useErrorHandler } from '../../hooks/useErrorHandler'

export const HistoricalAnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  })
  const { handleError } = useErrorHandler()

  const {
    data: historicalData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    `historical:${filters.startDate}:${filters.endDate}`,
    () => getHistoricalData(filters),
    {
      cacheKey: `historical:${filters.startDate}:${filters.endDate}`,
      enabled: !!filters.startDate && !!filters.endDate,
    },
  )

  if (error) {
    const { title, message } = handleError(error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900">{title}</h3>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Date Range Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="px-3 py-2 border rounded"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
          className="px-3 py-2 border rounded"
        />
      </div>

      {/* Data Display */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : historicalData ? (
        <div>
          {/* Render historical data */}
        </div>
      ) : (
        <p className="text-gray-500">Select date range to view data</p>
      )}
    </div>
  )
}
```

- [ ] Modify component
- [ ] Commit: `feat: integrate useQuery into HistoricalAnalyticsPage`

### Step 3: Wrap HiringDashboardPage with ErrorBoundary

```typescript
// pages/HiringDashboardPage.tsx
import React, { useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import {
  CurrentOpeningsTab,
  HistoricalAnalyticsPage,
} from '../components/HiringDashboardTab'

type Tab = 'current' | 'historical'

export const HiringDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('current')

  return (
    <ErrorBoundary>
      <div className="w-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'current'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Current Opening Positions
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'historical'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Historical Data
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'current' && <CurrentOpeningsTab />}
          {activeTab === 'historical' && <HistoricalAnalyticsPage />}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default HiringDashboardPage
```

- [ ] Modify component
- [ ] Commit: `feat: add ErrorBoundary to HiringDashboardPage`

---

## Task 7: Setup Environment Variables

**Files:**
- Create: `.env.local`
- Create: `.env.production`
- Create: `.env.example`

### Step 1: Create environment variable files

```env
# .env.local (development)
VITE_API_PROXY=http://localhost:4000
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=debug
VITE_APP_ENV=development
VITE_MULTIUSER=false
VITE_ENTRA_CLIENT_ID=your-client-id
VITE_ENTRA_TENANT_ID=your-tenant-id
```

```env
# .env.production
VITE_API_PROXY=/api
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=error
VITE_APP_ENV=production
VITE_MULTIUSER=true
VITE_ENTRA_CLIENT_ID=your-production-client-id
VITE_ENTRA_TENANT_ID=your-production-tenant-id
```

```env
# .env.example
VITE_API_PROXY=http://localhost:4000
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=debug
VITE_APP_ENV=development
VITE_MULTIUSER=false
VITE_ENTRA_CLIENT_ID=
VITE_ENTRA_TENANT_ID=
```

- [ ] Write .env files
- [ ] Add to .gitignore: `.env.local`
- [ ] Commit: `chore: add environment configuration files`

---

## Task 8: Create Unit Tests

**Files:**
- Create: `tests/api.test.ts`
- Create: `tests/auth.test.ts`
- Create: `tests/hooks.test.ts`

### Step 1: Setup test infrastructure

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom msw
npm install --save-dev @vitest/ui
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/modules/reports-analytics/tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] Run setup commands
- [ ] Commit: `chore: setup vitest and testing libraries`

### Step 2: Write API client tests

```typescript
// tests/api.test.ts
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
```

- [ ] Write code
- [ ] Run: `npm run test api.test.ts`
- [ ] Commit: `test: add API client unit tests`

### Step 3: Write authentication tests

```typescript
// tests/auth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../auth/authService'

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize without token', () => {
    expect(authService.getAccessToken()).toBeNull()
  })

  it('should save and retrieve token from storage', () => {
    const token = {
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
    }

    // Mock setToken by calling logout first
    authService.logout()
    
    // Verify it was cleared
    expect(authService.getAccessToken()).toBeNull()
  })

  it('should detect expired token', () => {
    localStorage.setItem(
      'auth_token',
      JSON.stringify({
        accessToken: 'test',
        expiresAt: Date.now() - 1000,
      }),
    )

    expect(authService.isTokenExpired()).toBe(true)
  })

  it('should detect valid token', () => {
    localStorage.setItem(
      'auth_token',
      JSON.stringify({
        accessToken: 'test',
        expiresAt: Date.now() + 3600000,
      }),
    )

    const newService = new AuthService()
    expect(newService.isTokenExpired()).toBe(false)
  })
})
```

- [ ] Write code
- [ ] Run: `npm run test auth.test.ts`
- [ ] Commit: `test: add authentication service tests`

### Step 4: Write custom hooks tests

```typescript
// tests/hooks.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQuery } from '../hooks/useQuery'

describe('useQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'test' }
    const queryFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useQuery('test', queryFn))

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
      useQuery('test', queryFn, { retry: 0 }),
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

    const { result } = renderHook(() => useQuery('test', queryFn))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)

    await result.current.refetch()

    expect(queryFn).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] Write code
- [ ] Run: `npm run test hooks.test.ts`
- [ ] Commit: `test: add custom hooks tests`

---

## Task 9: Integration Testing

**Files:**
- Create: `tests/integration.test.ts`

### Step 1: Write integration tests

```typescript
// tests/integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setupServer } from 'msw'
import { http, HttpResponse } from 'msw'
import { renderHook, waitFor } from '@testing-library/react'
import { useQuery } from '../hooks/useQuery'
import * as api from '../api'

// Mock API server
const server = setupServer(
  http.get('http://localhost:4000/api/analytics/summary', () => {
    return HttpResponse.json({
      totalHired: 10,
      salaryRange: '$50K - $100K',
      hcTotal: 50,
    })
  }),

  http.get('http://localhost:4000/api/analytics/active-sla', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          title: 'Senior Engineer',
          pipeline: { cv: 10, firstInterview: 5, secondInterview: 2, offers: 1 },
        },
      ],
    })
  }),
)

describe('API Integration', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.close()
  })

  it('should fetch hiring metrics successfully', async () => {
    const { result } = renderHook(() =>
      useQuery('metrics', () => api.getHiringMetrics()),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({
      totalHired: 10,
      salaryRange: '$50K - $100K',
      hcTotal: 50,
    })
  })

  it('should fetch hiring positions successfully', async () => {
    const { result } = renderHook(() =>
      useQuery('positions', () => api.getHiringPositions()),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].title).toBe('Senior Engineer')
  })
})
```

- [ ] Write code
- [ ] Run: `npm run test integration.test.ts`
- [ ] Commit: `test: add integration tests for API calls`

---

## Task 10: Performance Optimization

**Files:**
- Create: `api/performance.ts`
- Modify: `api.ts`

### Step 1: Add request deduplication

```typescript
// api/performance.ts
interface PendingRequest {
  promise: Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
}

export class RequestDeduplicator {
  private pending = new Map<string, PendingRequest>()

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

export const deduplicator = new RequestDeduplicator()
```

- [ ] Write code
- [ ] Commit: `feat: add request deduplication for performance`

### Step 2: Integrate deduplication into API layer

Modify `api.ts`:

```typescript
import { deduplicator } from './api/performance'

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

    // ... rest of implementation
  })
}

// Apply similar pattern to other endpoints
```

- [ ] Modify api.ts
- [ ] Commit: `feat: integrate request deduplication into API layer`

### Step 3: Add performance monitoring

```typescript
// api/performance.ts (add monitoring)
export function logPerformance(
  name: string,
  duration: number,
  success: boolean,
) {
  if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
    const status = success ? '✓' : '✗'
    console.log(
      `[API] ${status} ${name} completed in ${duration}ms`,
    )
  }
}

// Usage in api.ts:
const startTime = performance.now()
try {
  const result = await httpClient.request<Position[]>(endpoint)
  const duration = performance.now() - startTime
  logPerformance('getHiringPositions', duration, true)
  return result
} catch (error) {
  const duration = performance.now() - startTime
  logPerformance('getHiringPositions', duration, false)
  throw error
}
```

- [ ] Modify api.ts and api/performance.ts
- [ ] Commit: `feat: add API performance monitoring`

---

## Task 11: Documentation and Deployment

**Files:**
- Create: `API_INTEGRATION_GUIDE.md`
- Modify: `.env.example` (already created in Task 7)

### Step 1: Create API integration guide

```markdown
# API Integration Guide

## Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment (.env.local):**
   \`\`\`env
   VITE_API_PROXY=http://localhost:4000
   VITE_API_TIMEOUT=30000
   VITE_LOG_LEVEL=debug
   VITE_MULTIUSER=false
   \`\`\`

3. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Analytics
- `GET /api/analytics/summary` - Global metrics
- `GET /api/analytics/active-sla` - Job SLA status
- `GET /api/analytics/job/:job_code` - Job detail

### Historical
- `GET /api/analytics/historical-positions` - Historical positions
- `GET /api/analytics/historical-metrics` - Historical metrics

### Reference Data
- `GET /api/analytics/business-units` - Business units list
- `GET /api/analytics/business-units/:bu/departments` - Departments
- `GET /api/analytics/business-units/:bu/departments/:dept/positions` - Positions

## Error Handling

The API client handles three types of errors:

- **ApiError (HTTP):** Status codes 4xx, 5xx
- **TimeoutError:** Request exceeds timeout
- **NetworkError:** Connection issues

Use `useErrorHandler()` hook to format errors for UI.

## Caching

Cache is managed automatically with 5-minute TTL. To invalidate:

\`\`\`typescript
import { queryCache } from '@/api/cache'

queryCache.invalidate('positions:.*') // Invalidate all position caches
queryCache.clear() // Clear all cache
\`\`\`

## Testing

Run all tests:
\`\`\`bash
npm run test
\`\`\`

Run specific test file:
\`\`\`bash
npm run test api.test.ts
\`\`\`

Run with UI:
\`\`\`bash
npm run test:ui
\`\`\`

## Performance Targets

- FCP (First Contentful Paint): < 2s
- API response time: < 1s
- Cache hit rate: > 70%
```

- [ ] Write documentation
- [ ] Commit: `docs: add API integration guide`

### Step 2: Update package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

- [ ] Modify package.json
- [ ] Commit: `chore: add test scripts to package.json`

---

## Summary

Phase 4 Implementation includes:

### Core Features (Tasks 1-6)
- ✅ HTTP client with timeout and retry
- ✅ API endpoint definitions
- ✅ Real API calls (replacing stubs)
- ✅ Query caching layer
- ✅ Entra ID OAuth integration
- ✅ Custom hooks (useQuery, useMutation, useErrorHandler)
- ✅ Error boundaries and loading states
- ✅ Component integration

### Infrastructure (Tasks 7-11)
- ✅ Environment configuration
- ✅ Unit tests (API, Auth, Hooks)
- ✅ Integration tests
- ✅ Request deduplication
- ✅ Performance monitoring
- ✅ Documentation

### Key Deliverables
- Production-ready API client
- Comprehensive test coverage
- Secure authentication (Entra ID)
- Optimized performance
- Complete documentation

**Estimated time: 25-35 hours over 2-3 weeks**

---

**Ready to execute?** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement tasks sequentially.
