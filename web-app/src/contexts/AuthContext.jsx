import { createContext, useContext, useState } from 'react'
import { getCurrentUser } from '../utils/mockAuth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user] = useState(getCurrentUser())
  const [token] = useState('static-auth-token')
  const [loading] = useState(false)

  const login = async () => {
    return { user: getCurrentUser(), token: 'static-auth-token' }
  }

  const register = async () => {
    return { user: getCurrentUser(), token: 'static-auth-token' }
  }

  const logout = () => {}

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: true,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
