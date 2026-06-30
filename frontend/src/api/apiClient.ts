import axios from 'axios'
import keycloak from '../keycloak'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para añadir el token JWT de Keycloak a cada petición
apiClient.interceptors.request.use(
  async (config) => {
    if (keycloak.token) {
      try {
        // Refresca el token si expira en menos de 60 segundos
        await keycloak.updateToken(60)
      } catch (err) {
        console.error('Failed to refresh token in interceptor', err)
        keycloak.login()
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
    if (error.response?.status === 401) {
      console.warn('Unauthorized access, redirecting to login...')
      keycloak.login()
    }
    return Promise.reject(error)
  }
)
