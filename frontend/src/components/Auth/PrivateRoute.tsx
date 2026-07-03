import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../context/AuthProvider'
import { AccessDenied } from './AccessDenied'
import { OfflineSessionRequired } from './OfflineSessionRequired'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Guarda de rutas protegidas.
 * - Si la autenticación aún se está resolviendo → muestra un loader.
 * - Si existe sesión online u offline → permite renderizar la ruta.
 * - Si no hay sesión y el navegador está offline → muestra una vista local.
 * - Si no hay sesión y el navegador está online → vuelve al inicio.
 */
export function PrivateRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const {
    authStatus,
    isAuthenticatedOnline,
    isAuthenticatedOffline,
    hasRole,
  } = useAuth()

  if (authStatus === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isAuthenticatedOnline || isAuthenticatedOffline) {
    if (allowedRoles && allowedRoles.length > 0) {
      const hasPermission = allowedRoles.some((role) => hasRole(role))
      if (!hasPermission) {
        return <AccessDenied />
      }
    }

    return <Outlet />
  }

  if (!navigator.onLine) {
    return <OfflineSessionRequired />
  }

  return <Navigate to="/" replace />
}
