import { IoSparklesOutline } from 'react-icons/io5'

// Propiedades recibidas para la tarjeta de recomendación de IA.
interface RecommendationCardProps {
  title: string // El nombre del tema o recurso que se recomienda.
  reason: string // La justificación inteligente ("Por qué se te recomienda esto").
}

export function RecommendationCard({ title, reason }: RecommendationCardProps) {
  return (
    // Diseño con fondo en degradado moderno (de azul a índigo) y efecto de hover con brillo neón azul
    <div className="group flex flex-col p-5 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 dark:from-blue-900/40 dark:to-slate-800 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-none hover:border-blue-500/40 dark:hover:border-blue-500/30 dark:hover:shadow-[0_0_25px_rgba(46,81,156,0.35)] transition-all duration-300 text-left">
      <div className="flex items-start gap-4">
        {/* Icono de Chispas con animación de pulsación constante */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-[pulse_3s_infinite]">
          <IoSparklesOutline className="w-5 h-5" />
        </div>
        
        <div className="flex-grow">
          {/* Subtítulo decorativo de IA */}
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            Recomendación Inteligente
          </span>
          {/* Nombre de la recomendación */}
          <h3 className="mt-1 text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
          {/* Motivo de la recomendación */}
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">¿Por qué?:</span> {reason}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecommendationCard

