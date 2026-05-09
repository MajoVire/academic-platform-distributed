import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getStudentRecommendations } from '../api/academicApi'
import type { Recommendation } from '../types/academic'

function RecommendationsPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecommendations() {
      if (!studentId) {
        setError('No se encontró el identificador del estudiante.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data = await getStudentRecommendations(Number(studentId))
        setRecommendations(data.recommendations)
      } catch (error) {
          console.error('Error cargando recomendaciones:', error)
          setError('No se pudieron cargar las recomendaciones académicas.')
      } finally {
        setIsLoading(false)
      }
    }

    loadRecommendations()
  }, [studentId])

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Recomendaciones académicas
          </h1>
          <p className="mt-2 text-slate-600">
            Estamos cargando las recomendaciones para el estudiante.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-slate-600">Cargando recomendaciones...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Recomendaciones académicas
          </h1>
          <p className="mt-2 text-slate-600">
            Aquí se mostrarán las recomendaciones generadas por el sistema.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-medium">Ocurrió un problema</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Estudiante #{studentId}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Recomendaciones académicas
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Estas recomendaciones se generan a partir de los recursos completados
          por el estudiante y buscan sugerir nuevos temas de aprendizaje.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No hay recomendaciones disponibles
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Completa algunos recursos académicos para que el sistema pueda
            generar recomendaciones personalizadas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((recommendation, index) => (
            <article
              key={`${recommendation.title}-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Recomendación
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                {recommendation.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {recommendation.reason}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecommendationsPage