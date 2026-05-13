import { IoPlayCircleOutline, IoBookOutline, IoDocumentTextOutline, IoCheckmarkCircle, IoCheckmarkCircleOutline } from 'react-icons/io5'

// Propiedades recibidas para dibujar la tarjeta interactiva de recurso de aprendizaje
interface ResourceCardProps {
  id: number
  title: string
  description: string
  type: string // 'video' o 'reading' / 'lecture' / 'exercise'
  isCompleted: boolean // Si el alumno ya lo leyó/completó
  onCompleteToggle?: () => void // Función para mandar a guardar la finalización en el backend
  isPending?: boolean // Si se está ejecutando la llamada de API en segundo plano
}

export function ResourceCard({
  title,
  description,
  type,
  isCompleted,
  onCompleteToggle,
  isPending = false,
}: ResourceCardProps) {
  // Elige dinámicamente un icono de ionicons según el tipo de recurso para darle más color
  const getResourceIcon = () => {
    switch (type.toLowerCase()) {
      case 'video':
        return <IoPlayCircleOutline className="w-6 h-6 text-red-500" />
      case 'reading':
      case 'lecture':
        return <IoBookOutline className="w-6 h-6 text-green-500" />
      case 'exercise':
      case 'task':
        return <IoDocumentTextOutline className="w-6 h-6 text-amber-500" />
      default:
        return <IoDocumentTextOutline className="w-6 h-6 text-blue-500" />
    }
  };

  // Obtiene un nombre legible en español para el badge del tipo de recurso
  const getResourceTypeName = () => {
    switch (type.toLowerCase()) {
      case 'video': return 'Video'
      case 'reading': return 'Lectura'
      case 'exercise': return 'Ejercicio'
      case 'article': return 'Artículo'
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  };

  return (
    // Si ya está completado, se pinta con un sutil borde verde y fondo verdoso para indicar éxito.
    // De lo contrario, se pinta normal y resalta en azul al pasar el mouse por encima.
    <div className={`group flex flex-col justify-between h-full p-5 bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 text-left ${
      isCompleted 
        ? 'border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/20' 
        : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:shadow-[0_0_20px_rgba(46,81,156,0.25)]'
    }`}>
      <div>
        <div className="flex items-center justify-between">
          {/* Tipo de Recurso Badge (ej. "Video" con icono rojo de play) */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            {getResourceIcon()}
            {getResourceTypeName()}
          </span>

          {/* Estado de Completado Badge (se dibuja un check verde si ya está listo) */}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <IoCheckmarkCircle className="w-4 h-4" />
              Completado
            </span>
          )}
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
          {description}
        </p>
      </div>

      {/* Botón interactivo de acción al fondo de la tarjeta */}
      {onCompleteToggle && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              onCompleteToggle(); // Llama a la acción para guardar progreso
            }}
            disabled={isCompleted || isPending} // No se puede clickear si ya está completado o si está cargando
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 focus:outline-none cursor-pointer ${
              isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 cursor-default'
                : isPending
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'
            }`}
          >
            {isPending ? (
              <>
                {/* SVG animado de cargando si la llamada de red está en curso */}
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </>
            ) : isCompleted ? (
              <>
                <IoCheckmarkCircle className="w-4 h-4" />
                Completado
              </>
            ) : (
              <>
                <IoCheckmarkCircleOutline className="w-4 h-4" />
                Completar recurso
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ResourceCard

