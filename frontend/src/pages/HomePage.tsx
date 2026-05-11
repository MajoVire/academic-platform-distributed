import { Link } from 'react-router'
import { IoBookOutline, IoBarChartOutline, IoSparklesOutline, IoArrowForward } from 'react-icons/io5'
import Button from '../components/ui/Button'

export function HomePage() {
  return (
    <div className="space-y-16 py-4 md:py-8">
      {/* =========================================================================
          Sección Hero (Premium con Gradientes Micro-animados)
          ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-slate-900 dark:via-blue-950/45 dark:to-slate-950 p-8 md:p-16 text-left border border-blue-500/10 dark:border-blue-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent_60%)] pointer-events-none" />
        
        <div className="relative max-w-3xl z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-blue-100 dark:text-blue-300">
            <IoSparklesOutline className="w-3.5 h-3.5 animate-pulse" />
            Sistemas Distribuidos + Web
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Potencia tu <br />
            <span className="bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
              Camino Académico
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-blue-100/80 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
            Explora materias, completa recursos interactivos en tiempo real, monitorea tu progreso con hilos concurrentes y obtén recomendaciones inteligentes basadas en Inteligencia Artificial.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link to="/subjects">
              <Button size="lg" className="shadow-lg hover:shadow-blue-500/20">
                Ver Materias
                <IoArrowForward className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/progress">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 dark:border-slate-800 dark:bg-slate-950/20 dark:hover:bg-slate-900/50">
                Mi Progreso
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Sección de Pilares del Proyecto (Características del Sistema Distribuido)
          ========================================================================= */}
      <section className="space-y-8 text-left">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Pilares Tecnológicos
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            Diseñado para cumplir con los estándares de comunicación distribuida híbrida (Java & Python) y concurrencia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1: Catálogo Académico */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/40 dark:hover:shadow-[0_0_20px_rgba(46,81,156,0.25)] transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <IoBookOutline className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
              Catálogo de Materias
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Consulta de forma interactiva materias organizadas en cursos complementarios con materiales de estudio integrados.
            </p>
          </div>

          {/* Pilar 2: Tareas Concurrentes */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/40 dark:hover:shadow-[0_0_20px_rgba(46,81,156,0.25)] transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <IoBarChartOutline className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
              Concurrencia en Hilos
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              El servidor de Spring Boot procesa el completado de recursos asíncronamente en hilos paralelos para máxima velocidad de respuesta.
            </p>
          </div>

          {/* Pilar 3: Recomendaciones AI */}
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500/40 dark:hover:shadow-[0_0_20px_rgba(46,81,156,0.25)] transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <IoSparklesOutline className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
              Recomendación de FastAPI
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              El motor en Python FastAPI infiere recomendaciones académicas inteligentes basándose en el título de los recursos estudiados.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
