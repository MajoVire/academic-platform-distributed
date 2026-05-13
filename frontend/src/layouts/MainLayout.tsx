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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">

      {/* Componente Navbar adaptativo (Mobile-First) */}
      <Navbar />

      {/* 
          Contenedor principal de contenidos.
          * md:py-10 - padding vertical normal en escritorio.
          * pb-24 - padding inferior en móvil para evitar que el navbar fijo cubra el contenido.
      */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 pb-24 md:pb-10 transition-all">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
