import type { ReactNode } from 'react'
import Navbar from '../components/ui/Navbar'

// Este es el "molde" o cascarón de nuestra aplicación.
// En lugar de repetir el Navbar y los estilos de fondo en cada página,
// envolvemos las páginas dentro de este MainLayout para que se vean uniformes.
type MainLayoutProps = {
  children: ReactNode // Las páginas individuales que cargamos dinámicamente.
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    // Aplica el color de fondo adaptativo para Modo Claro (bg-slate-50) y Modo Oscuro (dark:bg-slate-950)
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 relative overflow-hidden">
      {/* Luces de fondo radiales sutiles para profundidad y modernidad */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.04] dark:bg-blue-400/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/[0.04] dark:bg-indigo-400/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Componente Navbar adaptativo (Mobile-First) */}
      <Navbar />

      {/* 
          Contenedor principal de contenidos.
          * md:py-10 - padding vertical normal en escritorio.
          * pb-24 - padding inferior en móvil para evitar que el navbar fijo cubra el contenido ya que el footer está oculto en móvil.
      */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 pb-24 md:pb-10 transition-all z-10">
        {children}
      </main>

      {/* Pie de página corporativo premium (Oculto en móvil, con alta distinción en modo oscuro) */}
      <footer className="hidden md:block w-full border-t border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900 backdrop-blur-md transition-all duration-300 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
            <span className="font-extrabold text-xs text-blue-600/85 dark:text-blue-400 uppercase tracking-widest block">
              Ciencias de la Computación
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              © {new Date().getFullYear()} Plataforma Académica Distribuida. Todos los derechos reservados.
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              CUENCA-ECUADOR
            </span>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2.5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Desarrolladores
            </span>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-3.5 gap-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">Macas Y.</span>
              <span className="text-slate-300 dark:text-slate-800 select-none">•</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">Moreno C.</span>
              <span className="text-slate-300 dark:text-slate-800 select-none">•</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">Patiño D.</span>
              <span className="text-slate-300 dark:text-slate-800 select-none">•</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">Siguencia K.</span>
              <span className="text-slate-300 dark:text-slate-800 select-none">•</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">Vire M.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
