import { createContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  externalId: string
  name: string
  crp: string
  approach: string
  uf: string
  city?: string
  photoUrl?: string
  bio?: string
  role: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (code: string) => Promise<void>
  logout: () => void
  refreshToken: (refreshToken: string) => Promise<string>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user from localStorage and validate token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setLoading(false)
          return
        }

        // Fetch user profile
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (code: string) => {
    try {
      setError(null)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('accessToken', data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const refreshToken = async (refreshToken: string): Promise<string> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    localStorage.setItem('accessToken', data.accessToken)
    return data.accessToken
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}
