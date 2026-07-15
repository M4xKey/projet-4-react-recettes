import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Utilisateur } from '../types'

interface AuthContextValue {
  token: string | null
  user: Utilisateur | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const AUTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth`
const STORAGE_KEY = 'token'

function decoderPayload(token: string): Utilisateur | null {
  try {
    const base64 = token.split('.')[1]
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState<Utilisateur | null>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? decoderPayload(stored) : null
  })

  async function appelerAuth(chemin: string, identifiants: { email: string; password: string }) {
    const res = await fetch(`${AUTH_URL}${chemin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(identifiants),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Une erreur est survenue')
    }
    sessionStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(decoderPayload(data.token))
  }

  function login(email: string, password: string) {
    return appelerAuth('/login', { email, password })
  }

  function register(email: string, password: string) {
    return appelerAuth('/register', { email, password })
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth }
