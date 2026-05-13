import axios from 'axios'

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