import { useNavigate } from 'react-router'
import { IoCloudOfflineOutline, IoHomeOutline } from 'react-icons/io5'

export function OfflineSessionRequired() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center">
          <IoCloudOfflineOutline className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Sesión local no disponible
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Esta sección requiere una sesión iniciada previamente. Sin conexión
            no podemos validar un nuevo acceso con Keycloak.
          </p>
        </div>

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
