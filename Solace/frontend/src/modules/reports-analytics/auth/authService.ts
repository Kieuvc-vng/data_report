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

      // Device Code Flow
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()

      // Poll for token
      this.pollForToken(data.device_code)
    } catch (error) {
      console.error('Device code flow error:', error)
      throw error
    }
  }

  private async pollForToken(deviceCode: string): Promise<void> {
    const maxAttempts = 120 // 10 minutes (120 attempts × 5 second intervals)
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

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
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

  private extractRoles(userData: Record<string, unknown>): string[] {
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
