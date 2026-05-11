import { NavLink } from 'react-router'
import { 
  IoHomeOutline, 
  IoHome, 
  IoBookOutline, 
  IoBook, 
  IoBarChartOutline, 
  IoBarChart, 
  IoSparklesOutline, 
  IoSparkles 
} from 'react-icons/io5'
import ThemeToggle from './ThemeToggle'

interface NavItem {
  label: string
  to: string
  iconOutline: any
  iconSolid: any
}

const navigationItems: NavItem[] = [
  { 
    label: 'Inicio', 
    to: '/', 
    iconOutline: IoHomeOutline, 
    iconSolid: IoHome 
  },
  { 
    label: 'Materias', 
    to: '/subjects', 
    iconOutline: IoBookOutline, 
    iconSolid: IoBook 
  },
  { 
    label: 'Progreso', 
    to: '/progress', 
    iconOutline: IoBarChartOutline, 
    iconSolid: IoBarChart 
  },
  { 
    label: 'Recomendaciones', 
    to: '/recommendations', 
    iconOutline: IoSparklesOutline, 
    iconSolid: IoSparkles 
  },
]

export function Navbar() {
  return (
    <>
      {/* =========================================================================
          1. NAVBAR SUPERIOR ELEGANTE (md y superior - Escritorio / Tablet Grande)
          ========================================================================= */}
      <header className="hidden md:block sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-900/80 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Logo / Marca */}
          <NavLink to="/" className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black tracking-tighter text-sm shadow-md group-hover:scale-105 transition-all duration-300">
              PA
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Plataforma Académica
            </span>
          </NavLink>

          {/* Menú de Navegación */}
          <nav className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const IconOutline = item.iconOutline
              const IconSolid = item.iconSolid
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? <IconSolid className="w-4 h-4" /> : <IconOutline className="w-4 h-4" />}
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Acciones (Tema) */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. NAVBAR INFERIOR FIJO (sm y inferior - Móviles)
          ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-900/60 transition-colors duration-300 pb-safe">
        <div className="grid grid-cols-4 h-full max-w-md mx-auto items-center px-2">
          {navigationItems.map((item) => {
            const IconOutline = item.iconOutline
            const IconSolid = item.iconSolid
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1.5 h-full transition-colors duration-300 cursor-pointer ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      {isActive ? (
                        <IconSolid className="w-5.5 h-5.5 transition-transform duration-300 scale-105" />
                      ) : (
                        <IconOutline className="w-5.5 h-5.5 transition-transform duration-300 hover:scale-105" />
                      )}
                      {isActive && (
                        <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold tracking-tight">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Cabecera Móvil Simple para Logo y Cambiar Tema en Móviles */}
      <header className="md:hidden sticky top-0 z-40 w-full h-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-900/60 transition-colors duration-300 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            PA
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
            Plataforma Académica
          </span>
        </div>
        <ThemeToggle />
      </header>
    </>
  )
}

export default Navbar
