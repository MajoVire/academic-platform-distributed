import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getStudentRecommendations } from '../api/academicApi'
import type { Recommendation } from '../types/academic'
import RecommendationCard from '../components/ui/RecommendationCard'
import { IoSparklesOutline } from 'react-icons/io5'

export function RecommendationsPage() {
  const { studentId } = useParams<{ studentId?: string }>()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const defaultStudentId = studentId ? parseInt(studentId, 10) : 1

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const response = await getStudentRecommendations(defaultStudentId)
        if (response && response.recommendations) {
          setRecommendations(response.recommendations)
        } else {
          setRecommendations([])
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError('Ocurrió un problema de conexión con el servicio de recomendaciones de Python.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [defaultStudentId])

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <IoSparklesOutline className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
          Sugerencias de Cursos
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          Sugerencias académicas personalizadas inferidas dinámicamente por nuestro microservicio inteligente de Python FastAPI.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          // Skeletons de carga
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="animate-pulse h-40 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
          ))
        ) : recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <RecommendationCard
              key={index}
              title={rec.title}
              reason={rec.reason}
            />
          ))
        ) : (
          !error && (
            <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 bg-white/40 dark:bg-slate-950/20">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <IoSparklesOutline className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-600 dark:text-slate-400">Sin recomendaciones activas</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Completa recursos de aprendizaje en la pestaña de Materias para que nuestro motor inteligente pueda comenzar a sugerir materias y especialidades.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default RecommendationsPage