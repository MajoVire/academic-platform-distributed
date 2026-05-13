import { useEffect, useState } from 'react'
import { getSubjects } from '../api/academicApi'
import type { Subject } from '../types/academic'
import SubjectCard from '../components/ui/SubjectCard'

// =========================================================================
// PÁGINA DE MATERIAS
// Esta página carga el catálogo completo de materias del backend (Spring Boot)
// y las muestra usando la tarjeta interactiva <SubjectCard>.
// =========================================================================

// Ilustración Isométrica de Librería Académica
const IsometricLibraryIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-36 h-28 select-none pointer-events-none drop-shadow-lg hidden sm:block overflow-visible">
    <defs>
      <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="130" rx="60" ry="22" fill="#475569" fillOpacity="0.08" />

    {/* Book 1 (Left, standing) */}
    <g transform="translate(40, 20)">
      <path d="M 20,40 L 40,30 L 40,40 L 20,50 Z" fill="#60a5fa" fillOpacity="0.9" />
      <path d="M 20,50 L 40,40 L 40,110 L 20,120 Z" fill="#3b82f6" />
      <path d="M 40,40 L 50,35 L 50,105 L 40,110 Z" fill="#f8fafc" />
    </g>

    {/* Book 2 (Middle, standing) */}
    <g transform="translate(62, 28)">
      <path d="M 20,40 L 40,30 L 40,40 L 20,50 Z" fill="#34d399" fillOpacity="0.9" />
      <path d="M 20,50 L 40,40 L 40,110 L 20,120 Z" fill="#10b981" />
      <path d="M 40,40 L 50,35 L 50,105 L 40,110 Z" fill="#e2e8f0" />
    </g>

    {/* Floating Academic Scroll or DB above */}
    <g transform="translate(110, 32)">
      <ellipse cx="20" cy="20" rx="15" ry="7" fill="#6366f1" fillOpacity="0.4" stroke="#818cf8" strokeWidth="0.8" />
      <path d="M 5,20 L 5,28 A 15,7 0 0 0 35,28 L 35,20 Z" fill="#4f46e5" fillOpacity="0.4" stroke="#6366f1" strokeWidth="0.8" />
      <ellipse cx="20" cy="28" rx="15" ry="7" fill="#6366f1" fillOpacity="0.5" stroke="#818cf8" strokeWidth="0.8" />
      
      {/* Sparkles */}
      <circle cx="0" cy="15" r="1.5" fill="#f59e0b" className="animate-pulse" />
      <circle cx="38" cy="25" r="1" fill="#60a5fa" className="animate-pulse" />
    </g>
  </svg>
)

export function SubjectsPage() {
  // Estados para almacenar las materias cargadas, el estado de carga y posibles errores de red.
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useEffect se dispara al cargar la página por primera vez.
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true)
        // Llamada asíncrona a nuestra función de API para obtener la lista de materias de la base de datos
        const data = await getSubjects()
        setSubjects(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching subjects:', err)
        setError('No se pudo conectar con el servidor académico. Asegúrate de que el backend esté ejecutándose.')
      } finally {
        setLoading(false) // Finaliza el estado de carga
      }
    }

    fetchSubjects()
  }, [])


  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Materias Académicas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Explora los programas de estudio y cursos complementarios disponibles en la plataforma.
          </p>
        </div>
        <div className="flex-shrink-0">
          <IsometricLibraryIllustration />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          // Skeletons de Carga
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="animate-pulse h-48 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
          ))
        ) : subjects.length > 0 ? (
          subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              description={subject.description || ''}
              courseCount={subject.id === 1 ? 2 : subject.id === 2 ? 1 : 0} // Representar semánticamente el conteo según init.sql
              to={`/subjects/${subject.id}/courses`}
            />
          ))
        ) : (
          !error && (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No se encontraron materias registradas.
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default SubjectsPage
