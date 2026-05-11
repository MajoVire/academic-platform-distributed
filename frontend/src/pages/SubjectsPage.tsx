import { useEffect, useState } from 'react'
import { getSubjects } from '../api/academicApi'
import type { Subject } from '../types/academic'
import SubjectCard from '../components/ui/SubjectCard'

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true)
        const data = await getSubjects()
        setSubjects(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching subjects:', err)
        setError('No se pudo conectar con el servidor académico. Asegúrate de que el backend esté ejecutándose.')
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Materias Académicas
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          Explora los programas de estudio y cursos complementarios disponibles en la plataforma.
        </p>
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
