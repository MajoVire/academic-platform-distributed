import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { useAuth } from '../../context/AuthProvider'
import { AccessDenied } from './AccessDenied'

/**
 * Componente guarda para rutas protegidas.
 * - Si el usuario no está autenticado → redirige a Keycloak.
 * - Si se pasan allowedRoles y el usuario no tiene ninguno → muestra AccessDenied.
 * - Si pasa ambas validaciones → renderiza las rutas hijas con <Outlet />.
 */
export function PrivateRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, login, hasRole } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      login()
    }
  }, [isAuthenticated, login])

  // Mientras redirige a Keycloak
  if (!isAuthenticated) {
    return null
  }

  // Validación de roles: si se especifican roles permitidos, el usuario debe tener al menos uno
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) => hasRole(role))
    if (!hasPermission) {
      return <AccessDenied />
    }
  }

  return <Outlet />
}

