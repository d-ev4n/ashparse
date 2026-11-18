
import { createContext, useContext, useState } from 'react'
import { loginUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('ashparse-token')
  )

  const [username, setUsername] = useState(
    () => sessionStorage.getItem('ashparse-username')
  )

  const login = async (credentials) => {
    const data = await loginUser(credentials)

    sessionStorage.setItem('ashparse-token', data.token)
    sessionStorage.setItem('ashparse-username', data.username)

    setToken(data.token)
    setUsername(data.username)

    return data
  }

  const logout = () => {
    sessionStorage.removeItem('ashparse-token')
    sessionStorage.removeItem('ashparse-username')

    setToken(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
