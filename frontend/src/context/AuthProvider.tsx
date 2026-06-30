import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import keycloak from '../keycloak'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: () => void
  logout: () => void
  userId: string | null
  userName: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
        })
        
        setIsAuthenticated(authenticated)
        setToken(keycloak.token || null)
        
        // Configurar auto-refresh
        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30).catch(() => {
            console.error('Error refreshing token')
            keycloak.logout()
          })
        }
      } catch (error) {
        console.error('Keycloak initialization failed', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initKeycloak()
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login: () => keycloak.login(),
        logout: () => keycloak.logout(),
        userId: keycloak.tokenParsed?.sub || null,
        userName: keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
