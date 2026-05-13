import { BrowserRouter, Route, Routes } from 'react-router'
import { appRoutes } from './routes/appRoutes'

// Este es el componente raíz ("Root") de nuestra app.
// Configura el enrutador para que la app sepa qué página mostrar según la URL actual.
function App() {
  return (
    // BrowserRouter permite la navegación sin recargar la página completa.
    <BrowserRouter>
      <Routes>
        {/* Mapeamos cada ruta definida en appRoutes para crear sus respectivas pantallas en React */}
        {appRoutes.map(({ element, path }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App

