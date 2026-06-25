import axios from 'axios'
import keycloak from '../keycloak'

// Este es el "cartero" de nuestra app. Usamos Axios para crear un cliente HTTP 
// que se encargará de mandar y recibir todos los datos desde el backend.
export const apiClient = axios.create({
  // La URL base viene de las variables de entorno (el archivo .env),
  // si no existe, usamos una cadena vacía por defecto.
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json', // Le decimos al servidor que siempre le enviaremos datos en formato JSON.
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