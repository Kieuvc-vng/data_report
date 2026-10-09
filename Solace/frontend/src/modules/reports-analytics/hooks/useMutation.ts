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
