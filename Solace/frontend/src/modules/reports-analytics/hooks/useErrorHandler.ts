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
            action: () => (window.location.href = '/login'),
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
