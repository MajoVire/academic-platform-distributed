import { BrowserRouter, Route, Routes } from 'react-router'
import { appRoutes } from './routes/appRoutes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {appRoutes.map(({ element, path }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}

export default App
