import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import {
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  signupRequest,
} from '../services/auth'
import { startBackendWakeup } from '../services/health'
import { clearAccessToken, setAccessToken } from '../lib/session'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isBooting, setIsBooting] = useState(true)
  const hasBootstrapped = useRef(false)

  const restoreSession = useEffectEvent(async () => {
    try {
      const data = await refreshSessionRequest()
      setAccessToken(data.access_token)
      setUser(data.user)
    } catch {
      clearAccessToken()
      setUser(null)
    } finally {
      setIsBooting(false)
    }
  })

  useEffect(() => {
    if (hasBootstrapped.current) {
      return
    }

    hasBootstrapped.current = true
    void startBackendWakeup().catch(() => {
      // Keep the UI usable even if the wakeup ping fails.
    })
    restoreSession()
  }, [])

  async function login(payload) {
    const data = await loginRequest(payload)
    setAccessToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  async function signup(payload) {
    const data = await signupRequest(payload)
    setAccessToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await logoutRequest()
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isBooting,
        isAuthenticated: Boolean(user),
        login,
        logout,
        signup,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
