import { useNavigate } from 'react-router'
import { IoShieldOutline, IoHomeOutline } from 'react-icons/io5'

/**
 * Componente que se muestra cuando un usuario autenticado intenta acceder
 * a una vista para la cual no tiene el rol necesario.
 * Ejemplo: un STUDENT intentando acceder a /admin/students.
 */
export function AccessDenied() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icono de escudo */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-center">
          <IoShieldOutline className="w-10 h-10 text-red-500 dark:text-red-400" />
        </div>

        {/* Mensaje principal */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Acceso Denegado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            No tienes los permisos necesarios para acceder a esta sección.
            Tu rol actual no incluye los privilegios requeridos.
          </p>
        </div>

        {/* Botón de retorno */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors duration-200 shadow-sm cursor-pointer"
        >
          <IoHomeOutline className="w-4.5 h-4.5" />
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}
