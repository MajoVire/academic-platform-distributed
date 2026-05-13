import { Link } from 'react-router'

// Propiedades recibidas para la tarjeta de materia (ej. "Computación" o "Diseño")
interface SubjectCardProps {
  id: number
  name: string
  description: string
  courseCount?: number // Cantidad de cursos que tiene dentro esta materia
  to?: string // Enlace para redirigir al listado de cursos de esta materia al hacer click
}

export function SubjectCard({
  name,
  description,
  courseCount,
  to,
}: SubjectCardProps) {
  const cardContent = (
    // Estructura visual de la tarjeta con icono superior, título grande, descripción y contador de cursos abajo.
    <div className="group flex flex-col justify-between h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-500/40 dark:hover:border-blue-400/40 dark:hover:shadow-[0_12px_30px_rgba(66,111,192,0.12)] transition-all duration-300 ease-out">
      <div className="text-left">
        {/* Encabezado con Icono de Libro SVG, que se agranda en hover */}
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>
        
        {/* Título de la Materia */}
        <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {name}
        </h3>
        {/* Descripción resumida */}
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer de la tarjeta con el badge de número de cursos y el botón "Ver cursos" */}
      {courseCount !== undefined && (
        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span className="bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
            {courseCount} {courseCount === 1 ? 'curso' : 'cursos'}
          </span>
          <span className="flex items-center text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
            Ver cursos
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      )}
    </div>
  )

  // Si se provee la prop "to", devolvemos el contenido envuelto en un enlace (Link) clickeable.
  if (to) {
    return (
      <Link to={to} className="block h-full no-underline">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

export default SubjectCard

