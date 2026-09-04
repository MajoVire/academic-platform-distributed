/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useOfflineStatus } from '../hooks/useOfflineStatus'
import { setApiClientBearerToken } from '../api/apiClient'
import keycloak from '../keycloak'
import {
  clearOfflineAuthSnapshot,
  getOfflineAuthSnapshot,
  getOfflineSessionTtlMs,
  isOfflineAuthSnapshotValid,
  saveOfflineAuthSnapshot,
  type OfflineAuthSnapshot,
} from '../auth/offline-session'

type AuthStatus =
  | 'loading'
  | 'authenticatedOnline'
  | 'authenticatedOffline'
  | 'notAuthenticated'

interface AuthContextType {
  authStatus: AuthStatus
  isInitialized: boolean
  isAuthenticated: boolean
  isAuthenticatedOnline: boolean
  isAuthenticatedOffline: boolean
  token: string | null
  roles: string[]
  login: () => Promise<void>
  logout: () => Promise<void>
  userId: string | null
  userName: string | null
  numericUserId: number
  authNotice: string | null
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function extractRealmRoles(): string[] {
  const realmAccess = keycloak.tokenParsed?.realm_access
  let roles: string[] = []

  if (realmAccess && Array.isArray(realmAccess.roles)) {
    roles = [...realmAccess.roles]
  }

  if (
    !roles.includes('PROFESSOR') &&
    !roles.includes('ADMIN') &&
    !roles.includes('STUDENT')
  ) {
    roles.push('STUDENT')
  }

  return roles
}

function getNumericUserId(userId: string | null): number {
  if (!userId) {
    return 1
  }

  const numericMatches = userId.match(/\d+/g)
  if (numericMatches) {
    return Number.parseInt(numericMatches.join('').substring(0, 8), 10)
  }

  return 1000 + (userId.charCodeAt(0) || 1)
}

function buildOfflineSnapshot(): OfflineAuthSnapshot | null {
  const sub = keycloak.tokenParsed?.sub || null
  const roles = extractRealmRoles()

  if (typeof sub !== 'string' || sub.trim().length === 0 || roles.length === 0) {
    return null
  }

  return {
    authenticated: true,
    userId: sub,
    username:
      keycloak.tokenParsed?.name ||
      keycloak.tokenParsed?.preferred_username ||
      null,
    roles,
    numericUserId: getNumericUserId(sub),
    offlineExpiresAt: Date.now() + getOfflineSessionTtlMs(),
  }
}

function isTemporaryAuthError(error: unknown): boolean {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error)

  const normalizedMessage = errorMessage.toLowerCase()

  return (
    normalizedMessage.includes('timeout') ||
    normalizedMessage.includes('timed out') ||
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('iframe') ||
    normalizedMessage.includes('third party')
  )
}

function clearKeycloakCallbackParams(): void {
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.hash,
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isOnline = useOfflineStatus()
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [token, setToken] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [numericUserId, setNumericUserId] = useState<number>(1)
  const [authNotice, setAuthNotice] = useState<string | null>(null)
  const bootstrappingRef = useRef(false)
  const keycloakInitializedRef = useRef(false)

  const isInitialized = authStatus !== 'loading'
  const isAuthenticatedOnline = authStatus === 'authenticatedOnline'
  const isAuthenticatedOffline = authStatus === 'authenticatedOffline'
  const isAuthenticated = isAuthenticatedOnline || isAuthenticatedOffline

  function resetToAnonymousState(): void {
    setAuthStatus('notAuthenticated')
    setToken(null)
    setRoles([])
    setUserId(null)
    setUserName(null)
    setNumericUserId(1)
    setApiClientBearerToken(null)
  }

  function applyOnlineSession(): void {
    const currentUserId = keycloak.tokenParsed?.sub || null
    const currentUserName =
      keycloak.tokenParsed?.name ||
      keycloak.tokenParsed?.preferred_username ||
      null
    const currentRoles = extractRealmRoles()

    setAuthNotice(null)
    setAuthStatus('authenticatedOnline')
    setToken(keycloak.token || null)
    setRoles(currentRoles)
    setUserId(currentUserId)
    setUserName(currentUserName)
    setNumericUserId(getNumericUserId(currentUserId))
    setApiClientBearerToken(keycloak.token || null)

    const snapshot = buildOfflineSnapshot()
    if (snapshot) {
      saveOfflineAuthSnapshot(snapshot)
    }
  }

  function restoreOfflineSnapshotIfValid(): boolean {
    const snapshot = getOfflineAuthSnapshot()

    if (isOfflineAuthSnapshotValid(snapshot)) {
      applyOfflineSnapshot(snapshot)
      return true
    }

    return false
  }

  function applyOfflineSnapshot(snapshot: OfflineAuthSnapshot): void {
    setAuthNotice(null)
    setAuthStatus('authenticatedOffline')
    setToken(null)
    setRoles(snapshot.roles)
    setUserId(snapshot.userId)
    setUserName(snapshot.username)
    setNumericUserId(snapshot.numericUserId)
    setApiClientBearerToken(null)
  }

  async function bootstrapAuth(): Promise<void> {
    if (bootstrappingRef.current) {
      return
    }

    bootstrappingRef.current = true

    try {
      if (!isOnline) {
        const snapshot = getOfflineAuthSnapshot()

        if (isOfflineAuthSnapshotValid(snapshot)) {
          applyOfflineSnapshot(snapshot)
        } else {
          resetToAnonymousState()
        }

        return
      }

      if (keycloakInitializedRef.current) {
        if (!keycloak.token) {
          resetToAnonymousState()
          return
        }

        try {
          await keycloak.updateToken(30)
          keycloak.onTokenExpired = handleTokenExpired
          applyOnlineSession()
        } catch (error) {
          console.error('Failed to refresh keycloak session', error)

          if (restoreOfflineSnapshotIfValid()) {
            return
          }

          if (!isTemporaryAuthError(error)) {
            clearOfflineAuthSnapshot()
          }
          resetToAnonymousState()
        }

        return
      }

      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoFallback: false,
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      })

      keycloakInitializedRef.current = true
      keycloak.onTokenExpired = handleTokenExpired

      if (authenticated) {
        applyOnlineSession()
        clearKeycloakCallbackParams()
        return
      }

      clearOfflineAuthSnapshot()
      resetToAnonymousState()
    } catch (error) {
      console.error('Keycloak initialization failed', error)

      if (restoreOfflineSnapshotIfValid()) {
        return
      }

      if (!isTemporaryAuthError(error)) {
        clearOfflineAuthSnapshot()
      }
      resetToAnonymousState()
    } finally {
      bootstrappingRef.current = false
    }
  }

  function handleTokenExpired(): void {
    if (!navigator.onLine) {
      return
    }

    keycloak
      .updateToken(30)
      .then(() => {
        applyOnlineSession()
      })
      .catch((error) => {
        console.error('Error refreshing token', error)

        if (!navigator.onLine) {
          return
        }

        if (restoreOfflineSnapshotIfValid()) {
          return
        }

        clearOfflineAuthSnapshot()
        resetToAnonymousState()
        void keycloak.logout()
      })
  }

  useEffect(() => {
    void bootstrapAuth()
  }, [isOnline])

  useEffect(() => {
    keycloak.onTokenExpired = handleTokenExpired
    return () => {
      keycloak.onTokenExpired = undefined
    }
  }, [])

  useEffect(() => {
    if (isAuthenticatedOnline) {
      clearOfflineAuthSnapshot()
      const snapshot = buildOfflineSnapshot()
      if (snapshot) {
        saveOfflineAuthSnapshot(snapshot)
      }
    }
  }, [isAuthenticatedOnline])

  const hasRole = (role: string): boolean => {
    return roles.includes(role)
  }

  const login = async (): Promise<void> => {
    if (!navigator.onLine) {
      setAuthNotice('El inicio de sesión requiere conexión.')
      return
    }

    setAuthNotice(null)
    await keycloak.login()
  }

  const logout = async (): Promise<void> => {
    setAuthNotice(null)
    clearOfflineAuthSnapshot()
    keycloakInitializedRef.current = false
    resetToAnonymousState()

    if (navigator.onLine) {
      await keycloak.logout()
    }
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
        authStatus,
        isInitialized,
        isAuthenticated,
        isAuthenticatedOnline,
        isAuthenticatedOffline,
        token,
        roles,
        login,
        logout,
        userId,
        userName,
        numericUserId,
        authNotice,
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
