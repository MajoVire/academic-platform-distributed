import axios from 'axios'
import keycloak from '../keycloak'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

function getCommonHeaders(): Record<string, string | undefined> {
  return apiClient.defaults.headers.common as Record<string, string | undefined>
}

export function setApiClientBearerToken(token: string | null): void {
  const commonHeaders = getCommonHeaders()

  if (token) {
    commonHeaders.Authorization = `Bearer ${token}`
    return
  }

  delete commonHeaders.Authorization
}

// Interceptor para añadir el token JWT de Keycloak a cada petición
apiClient.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      if (navigator.onLine) {
        try {
          // Refresca el token si expira en menos de 60 segundos
          await keycloak.updateToken(60)
        } catch (err) {
          console.error('Failed to refresh token in interceptor', err)
        }
      }
      config.headers.Authorization = `Bearer ${keycloak.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas (ej. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error)
  }
)
