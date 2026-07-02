import { BrowserRouter, Route, Routes } from 'react-router'
import { appRoutes } from './routes/appRoutes'
import { AuthProvider } from './context/AuthProvider'
import { PrivateRoute } from './components/Auth/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {appRoutes.map(({ element, path, isPrivate, roles }) => (
            <Route
              key={path}
              path={path}
              element={isPrivate ? <PrivateRoute allowedRoles={roles} /> : element}
            >
              {isPrivate && <Route index element={element} />}
            </Route>
          ))}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App


