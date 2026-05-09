import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

type MainLayoutProps = {
  children: ReactNode
}

const navigationItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Materias', to: '/subjects' },
  { label: 'Cursos', to: '/courses' },
  { label: 'Recursos', to: '/resources' },
  { label: 'Progreso', to: '/progress' },
  { label: 'Recomendaciones', to: '/recommendations' },
]

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-3 px-4 py-4">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'font-semibold text-slate-950' : 'text-slate-600'
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

export default MainLayout
