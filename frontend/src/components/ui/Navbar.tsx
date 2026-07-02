import { NavLink } from 'react-router'
import { 
   IoHomeOutline, 
   IoHome, 
   IoBookOutline, 
   IoBook, 
   IoBarChartOutline, 
   IoBarChart, 
   IoSparklesOutline, 
   IoSparkles,
   IoPeopleOutline,
   IoPeople,
   IoLogOutOutline,
   IoLogInOutline,
   IoCompassOutline,
   IoCompass
} from 'react-icons/io5'
import ThemeToggle from './ThemeToggle'
import logoPNG from '../../assets/logo.png'
import { useAuth } from '../../context/AuthProvider'

// Interfaz que define la estructura de cada botón de la barra de navegación.
interface NavItem {
  label: string // Texto del botón (ej. "Inicio", "Materias")
  to: string // URL de destino de React Router (ej. "/progress")
  iconOutline: any // Icono con borde (modo inactivo)
  iconSolid: any // Icono relleno (modo activo)
  roles?: string[] // Roles que pueden ver este item (vacío = público o cualquier autenticado)
}

// Lista ordenada de los elementos que irán en el menú de navegación de la app.
const navigationItems: NavItem[] = [
  { 
    label: 'Inicio', 
    to: '/', 
    iconOutline: IoHomeOutline, 
    iconSolid: IoHome 
  },
  { 
    label: 'Explorar', 
    to: '/explore', 
    iconOutline: IoCompassOutline, 
    iconSolid: IoCompass,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
  },
  { 
    label: 'Cursos', 
    to: '/my-courses', 
    iconOutline: IoBookOutline, 
    iconSolid: IoBook,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
  },
  { 
    label: 'Progreso', 
    to: '/progress', 
    iconOutline: IoBarChartOutline, 
    iconSolid: IoBarChart,
    roles: ['STUDENT', 'ADMIN'],
  },
  { 
    label: 'Recomendaciones', 
    to: '/recommendations', 
    iconOutline: IoSparklesOutline, 
    iconSolid: IoSparkles,
    roles: ['STUDENT', 'ADMIN'],
  },
  { 
    label: 'Gestión', 
    to: '/admin/students', 
    iconOutline: IoPeopleOutline, 
    iconSolid: IoPeople,
    roles: ['PROFESSOR', 'ADMIN'],
  },
]

/**
 * Devuelve la etiqueta legible del rol principal del usuario.
 */
function getRoleBadge(hasRole: (r: string) => boolean): string | null {
  if (hasRole('ADMIN')) return 'Admin'
  if (hasRole('PROFESSOR')) return 'Profesor'
  if (hasRole('STUDENT')) return 'Estudiante'
  return null
}

export function Navbar() {
  const { isAuthenticated, login, logout, userName, hasRole } = useAuth()

  // Filtra los items de navegación según el rol del usuario
  const visibleItems = navigationItems.filter((item) => {
    // El item "Inicio" siempre se muestra
    if (!item.roles) return true
    // Si no está autenticado, solo mostrar items sin roles (Inicio)
    if (!isAuthenticated) return false
    // Si está autenticado, mostrar solo items donde tenga al menos un rol permitido
    return item.roles.some((role) => hasRole(role))
  })

  const roleBadge = isAuthenticated ? getRoleBadge(hasRole) : null

  return (
    <>
      {/* =========================================================================
          1. NAVBAR SUPERIOR FIJO (Para computadoras / escritorios md en adelante)
          ========================================================================= */}
      <header className="hidden md:block sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-900/80 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 h-24 flex items-center justify-between">
          {/* Bloque Izquierdo: Logo y Navegación juntos */}
          <div className="flex items-center gap-8">
            {/* Logo / Marca a la izquierda */}
            <NavLink to="/" className="flex items-center gap-4 text-slate-800 dark:text-slate-100 group">
              <img 
                src={logoPNG} 
                alt="Logo Plataforma" 
                className="w-20 h-20 object-contain flex-shrink-0 transition-all duration-300 group-hover:scale-105"
              />
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Plataforma Académica
              </span>
            </NavLink>

            {/* Menú de Navegación filtrado por rol */}
            <nav className="flex items-center gap-1.5">
              {visibleItems.map((item) => {
                const IconOutline = item.iconOutline
                const IconSolid = item.iconSolid
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative px-4 py-2.5 rounded-xl text-[15px] font-bold transition-all duration-300 flex items-center gap-2 ${
                        // Si la ruta está activa, se colorea de azul con un fondo levemente azulado
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/20'
                          : 'text-blue-950/70 dark:text-slate-300 hover:text-blue-950 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Alterna el icono entre sólido y bordeado dependiendo de si la ruta está activa */}
                        {isActive ? <IconSolid className="w-4.5 h-4.5" /> : <IconOutline className="w-4.5 h-4.5" />}
                        {item.label}
                        {/* Una sutil línea azul inferior para el elemento activo */}
                        {isActive && (
                          <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Badge de rol */}
                {roleBadge && (
                  <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/40">
                    {roleBadge}
                  </span>
                )}
                <button onClick={() => logout()} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer" title="Cerrar sesión">
                  <span className="hidden lg:inline max-w-[120px] truncate">{userName}</span>
                  <IoLogOutOutline className="w-5.5 h-5.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => login()} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer" title="Iniciar sesión">
                <span className="hidden lg:inline">Ingresar</span>
                <IoLogInOutline className="w-5.5 h-5.5" />
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. NAVBAR INFERIOR FIJO (Para celulares / pantallas sm e inferiores)
          ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-900/60 transition-colors duration-300 pb-safe">
        <div className={`grid h-full max-w-md mx-auto items-center px-2`} style={{ gridTemplateColumns: `repeat(${visibleItems.length}, 1fr)` }}>
          {visibleItems.map((item) => {
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
                      {/* Si está activo, añade un pequeño punto verde parpadeante de notificación */}
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

      {/* =========================================================================
          3. CABECERA MÓVIL SUPERIOR SIMPLE (Para celulares / pantallas sm e inferiores)
          ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 w-full h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-900/60 transition-colors duration-300 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={logoPNG} 
            alt="Logo Plataforma" 
            className="w-14 h-14 object-contain flex-shrink-0"
          />
          <span className="font-black text-lg tracking-tight text-slate-800 dark:text-slate-100">
            Plataforma Académica
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {roleBadge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/40">
                  {roleBadge}
                </span>
              )}
              <button onClick={() => logout()} className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors cursor-pointer" title="Cerrar sesión">
                <IoLogOutOutline className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <button onClick={() => login()} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer" title="Iniciar sesión">
              <IoLogInOutline className="w-6 h-6" />
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>
    </>
  )
}

export default Navbar


