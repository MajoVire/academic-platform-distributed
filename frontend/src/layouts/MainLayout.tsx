import type { ReactNode } from 'react'
import Navbar from '../components/ui/Navbar'
import { useOfflineSync } from '../hooks/useOfflineSync'
import { useAuth } from '../context/AuthProvider'
// Este es el "molde" o cascarón de nuestra aplicación.
// En lugar de repetir el Navbar y los estilos de fondo en cada página,
// envolvemos las páginas dentro de este MainLayout para que se vean uniformes.
type MainLayoutProps = {
  children: ReactNode // Las páginas individuales que cargamos dinámicamente.
}

function MainLayout({ children }: MainLayoutProps) {
  const { authNotice } = useAuth()
  const {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncAt,
    lastSyncError,
  } = useOfflineSync()

  const syncMessage = !isOnline
    ? 'Sin conexión. Los cambios se guardarán localmente.'
    : isSyncing
      ? 'Sincronizando cambios pendientes...'
      : lastSyncError
        ? 'Error al sincronizar. Revisa los cambios pendientes.'
        : pendingCount > 0
          ? `Cambios pendientes: ${pendingCount}`
          : 'Todos los cambios sincronizados'

  const syncClasses = !isOnline
    ? 'bg-amber-500 text-white border-amber-500'
    : isSyncing
      ? 'bg-blue-600 text-white border-blue-600'
      : lastSyncError
        ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300 border-red-200 dark:border-red-900/40'
        : pendingCount > 0
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40'
  return (
    // Aplica el color de fondo adaptativo para Modo Claro (bg-slate-50) y Modo Oscuro (dark:bg-slate-950)
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 relative overflow-hidden">
      {/* Luces de fondo radiales sutiles para profundidad y modernidad */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.04] dark:bg-blue-400/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/[0.04] dark:bg-indigo-400/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Componente Navbar adaptativo (Mobile-First) */}
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 mt-3" aria-live="polite">
        {authNotice && (
          <div className="mb-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm border bg-amber-100 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border-amber-200 dark:border-amber-900/40">
            {authNotice}
          </div>
        )}
        <div className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm border ${syncClasses}`}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>{syncMessage}</span>
            <span className="text-xs font-medium opacity-90">
              {lastSyncAt
                ? `Última sincronización: ${new Date(lastSyncAt).toLocaleTimeString('es-EC')}`
                : 'Sin historial de sincronización'}
            </span>
          </div>
          {lastSyncError && isOnline && (
            <p className="mt-1 text-xs font-normal opacity-90">
              {lastSyncError}
            </p>
          )}
        </div>
      </div>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 pb-24 md:pb-10 transition-all z-10">
        {children}
      </main>

      {/* Pie de página Estilo Udemy (Simplificado) */}
      <footer className="w-full bg-[#1c1d1f] text-white mt-12 py-6 transition-all z-10 font-sans">
        <div className="max-w-7xl mx-auto px-6">
          {/* Bottom Bar: Logo y Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <span className="font-black text-2xl tracking-tight text-white">
                Plataforma Académica
              </span>
              <span className="text-xs text-slate-400 mt-1">
                © {new Date().getFullYear()} Inc.
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 text-xs text-slate-400">
              <span>Desarrolladores:</span>
              <span className="hover:text-white cursor-pointer">Macas Y.</span> •
              <span className="hover:text-white cursor-pointer">Moreno C.</span> •
              <span className="hover:text-white cursor-pointer">Patiño D.</span> •
              <span className="hover:text-white cursor-pointer">Siguencia K.</span> •
              <span className="hover:text-white cursor-pointer">Vire M.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
