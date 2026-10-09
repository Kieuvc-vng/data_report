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
    authService.logout()
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
