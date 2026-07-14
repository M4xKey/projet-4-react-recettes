import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const AUTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth`
const STORAGE_KEY = 'token'

function decoderPayload(token) {
  try {
    const base64 = token.split('.')[1]
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY))
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? decoderPayload(stored) : null
  })

  async function appelerAuth(chemin, identifiants) {
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

  function login(email, password) {
    return appelerAuth('/login', { email, password })
  }

  function register(email, password) {
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
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }
