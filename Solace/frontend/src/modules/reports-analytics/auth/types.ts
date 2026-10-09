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
