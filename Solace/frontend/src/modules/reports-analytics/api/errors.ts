/**
 * Custom API Error Types
 * Provides structured error handling for HTTP requests
 */

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
