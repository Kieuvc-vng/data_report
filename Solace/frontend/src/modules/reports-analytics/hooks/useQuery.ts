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
        // Proper type checking for error
        let apiError: ApiErrorType
        if (err instanceof Error) {
          apiError = err as ApiErrorType
        } else {
          apiError = new Error(String(err)) as unknown as ApiErrorType
        }

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
  }, [queryFn, cacheKey, options?.retry, options?.onError, options?.onSuccess, options?.enabled])

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
