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
