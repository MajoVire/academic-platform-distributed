import { Link } from 'react-router'
import { useState } from 'react'

// Propiedades recibidas para renderizar una tarjeta de curso.
interface CourseCardProps {
  id: number
  title: string
  description: string
  subjectName?: string // Opcional, nombre de la materia a la que pertenece el curso.
  imageUrl?: string // URL de la imagen de portada.
  resourceCount?: number // Cantidad opcional de recursos asociados a este curso.
  to?: string // Ruta URL opcional si queremos que la tarjeta sea un enlace clickeable.
}

export function CourseCard({
  title,
  description,
  subjectName,
  imageUrl,
  resourceCount,
  to,
}: CourseCardProps) {
  // Estado local para manejar si ocurre un error al cargar la imagen, para poder poner un marcador de posición de respaldo.
  const [imageError, setImageError] = useState(false)

  // El diseño central de la tarjeta (imagen + detalles)
  const cardContent = (
    <div className="group flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-none hover:border-blue-500/50 dark:hover:border-blue-500/50 dark:hover:shadow-[0_0_20px_rgba(46,81,156,0.25)] transition-all duration-300 overflow-hidden">
      {/* Contenedor de Imagen (Espacio de portada del curso) */}
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImageError(true)} // Si la imagen falla en cargar, cambiamos el estado de error
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          // Vista alternativa si la imagen falla o no tiene URL
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center p-4">
            <svg
              className="w-12 h-12 text-blue-500/60 dark:text-blue-400/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        )}
        {/* Etiqueta flotante con el nombre de la materia */}
        {subjectName && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white shadow-sm">
            {subjectName}
          </span>
        )}
      </div>

      {/* Contenido textual de la Tarjeta */}
      <div className="flex flex-col flex-grow p-5 text-left">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-grow">
          {description}
        </p>
        
        {/* Muestra la cantidad de recursos de aprendizaje (como videos/lecturas) del curso */}
        {resourceCount !== undefined && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center text-xs font-medium text-slate-400 dark:text-slate-500">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            {resourceCount} {resourceCount === 1 ? 'recurso' : 'recursos'}
          </div>
        )}
      </div>
    </div>
  )

  // Si se le pasa la prop "to", devolvemos la tarjeta envuelta en un enlace (Link) de React Router.
  if (to) {
    return (
      <Link to={to} className="block h-full no-underline">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

export default CourseCard

