import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthProvider'

export function PrivateRoute() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      login()
    }
  }, [isAuthenticated, login])

  if (!isAuthenticated) {
    return null // O un componente de carga mientras redirige
  }

  return <Outlet />
}
