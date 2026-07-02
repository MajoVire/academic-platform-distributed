import { createRoot } from 'react-dom/client'
import './index.css' // Los estilos globales de Tailwind CSS y personalizaciones.
import App from './App.tsx' // El componente raíz de nuestra aplicación.
import { registerSW } from 'virtual:pwa-register'

// Este es el punto de partida absoluto de la aplicación React. 
// Busca el elemento HTML con id="root" en el archivo index.html
// y "renderiza" (dibuja) nuestra aplicación dentro de él.
createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>
)
registerSW()
