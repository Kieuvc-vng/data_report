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
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const refreshToken = useAuthStore((state) => state.refreshToken)

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
  }
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
