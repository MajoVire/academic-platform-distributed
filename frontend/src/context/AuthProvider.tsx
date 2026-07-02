import { createContext, useContext, useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import keycloak from '../keycloak'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  roles: string[]
  login: () => void
  logout: () => void
  userId: string | null
  userName: string | null
  numericUserId: number
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Extrae los roles del realm desde el token decodificado de Keycloak.
 * Los roles vienen en tokenParsed.realm_access.roles como un array de strings.
 */
function extractRealmRoles(): string[] {
  const realmAccess = keycloak.tokenParsed?.realm_access
  let roles: string[] = []
  
  if (realmAccess && Array.isArray(realmAccess.roles)) {
    roles = [...realmAccess.roles]
  }
  
  // Si es un usuario nuevo y no tiene roles explícitos de profesor o admin,
  // asumimos que es estudiante por defecto (igual que en el backend).
  if (!roles.includes('PROFESSOR') && !roles.includes('ADMIN') && !roles.includes('STUDENT')) {
    roles.push('STUDENT')
  }
  
  return roles
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [numericUserId, setNumericUserId] = useState<number>(1)
  const isRun = useRef(false)

  useEffect(() => {
    if (isRun.current) return
    isRun.current = true
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
        })
        
        setIsAuthenticated(authenticated)
        setToken(keycloak.token || null)
        setRoles(authenticated ? extractRealmRoles() : [])
        
        let numId = 1
        const sub = keycloak.tokenParsed?.sub
        if (sub) {
          const numericMatches = sub.match(/\d+/g)
          numId = numericMatches ? parseInt(numericMatches.join('').substring(0, 8), 10) : 1000 + (sub.charCodeAt(0) || 1)
        }
        setNumericUserId(numId)
        
        // Configurar auto-refresh del token
        keycloak.onTokenExpired = () => {
          keycloak.updateToken(30)
            .then(() => {
              setToken(keycloak.token || null)
              setRoles(extractRealmRoles())
            })
            .catch(() => {
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

  /**
   * Verifica si el usuario autenticado tiene un rol específico del realm.
   * Se usa para proteger vistas y ocultar/mostrar elementos de UI por rol.
   */
  const hasRole = (role: string): boolean => {
    return roles.includes(role)
  }

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
        roles,
        login: () => keycloak.login(),
        logout: () => keycloak.logout(),
        userId: keycloak.tokenParsed?.sub || null,
        numericUserId,
        userName: keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || null,
        hasRole,
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
