import type { ReactNode } from 'react'
import Navbar from '../components/ui/Navbar'

type MainLayoutProps = {
  children: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
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
