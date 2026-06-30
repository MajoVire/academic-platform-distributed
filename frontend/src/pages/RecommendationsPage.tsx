import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getStudentRecommendations } from '../api/academicApi'
import type { Recommendation } from '../types/academic'
import RecommendationCard from '../components/ui/RecommendationCard'
import { IoSparklesOutline } from 'react-icons/io5'
import { useRecommendationNotifications } from '../hooks/useRecommendationNotifications'

// =========================================================================
// PÁGINA DE RECOMENDACIONES DE INTELIGENCIA ARTIFICIAL
// Esta página consume la API de Python FastAPI. El motor inteligente de Python
// procesa las finalizaciones asíncronas de recursos del estudiante,
// y a través de un algoritmo genera sugerencias oportunas y personalizadas.
// =========================================================================

// Ilustración Isométrica de Cerebro IA / Núcleo de Computo
const IsometricAIIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-36 h-28 select-none pointer-events-none drop-shadow-lg hidden sm:block overflow-visible">
    <ellipse cx="100" cy="130" rx="60" ry="22" fill="#475569" fillOpacity="0.08" />

    {/* Concentric glass rings */}
    <ellipse cx="100" cy="95" rx="45" ry="17" fill="none" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.4" />
    <ellipse cx="100" cy="80" rx="35" ry="13" fill="none" stroke="#a5b4fc" strokeWidth="1.2" strokeOpacity="0.5" />

    {/* Central Glowing AI core (isometric cube) */}
    <g transform="translate(85, 55)">
      {/* Cube left face */}
      <path d="M 0,15 L 15,22 L 15,37 L 0,30 Z" fill="#4f46e5" />
      {/* Cube right face */}
      <path d="M 15,22 L 30,15 L 30,30 L 15,37 Z" fill="#4338ca" />
      {/* Cube top face */}
      <path d="M 0,15 L 15,7 L 30,15 L 15,22 Z" fill="#818cf8" />
      
      {/* Glowing aura around cube */}
      <circle cx="15" cy="22" r="10" fill="#6366f1" fillOpacity="0.25" className="animate-pulse" />
    </g>

    {/* Small sparks / digital particles around */}
    <circle cx="65" cy="70" r="1.5" fill="#f43f5e" className="animate-pulse" />
    <circle cx="135" cy="65" r="2" fill="#10b981" className="animate-pulse" />
    <circle cx="120" cy="110" r="1" fill="#f59e0b" className="animate-pulse" />
  </svg>
)

export function RecommendationsPage() {
  // Obtenemos de manera opcional el ID del estudiante desde la URL si existiera
  const { studentId } = useParams<{ studentId?: string }>()

  // Estados locales para almacenar la lista de recomendaciones sugeridas por la IA,
  // la pantalla de carga (skeleton) y posibles errores de red con el backend de Python FastAPI.
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Por defecto usamos el estudiante con ID 1 en la simulación académica
  // TODO: Mapear usuario de Keycloak a ID de PostgreSQL
  const defaultStudentId = studentId ? parseInt(studentId, 10) : 1
  const { connected, notification } = useRecommendationNotifications()

  // Al cargar el componente o cambiar de estudiante, llamamos a la API de FastAPI (Python)
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const response = await getStudentRecommendations(defaultStudentId)
        
        // Si el motor de Python devolvió recomendaciones válidas, las guardamos en el estado
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <IoSparklesOutline className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            Sugerencias de Cursos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Sugerencias académicas personalizadas inferidas dinámicamente por nuestro microservicio inteligente de Python FastAPI.
          </p>
        </div>
        <div className="flex-shrink-0">
          <IsometricAIIllustration />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
  <h2 className="font-semibold mb-2">
    Estado del WebSocket
  </h2>

  <p>
    Estado:
    <span
      className={`ml-2 font-bold ${
        connected
          ? 'text-green-600'
          : 'text-red-600'
      }`}
    >
      {connected ? 'Conectado' : 'Desconectado'}
    </span>
  </p>

  {notification && (
    <div className="mt-4 rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-sm">
      <p><strong>Estudiante:</strong> {notification.studentId}</p>
      <p><strong>Estado:</strong> {notification.status}</p>
      <p><strong>Mensaje:</strong> {notification.message}</p>
      <p><strong>Hora:</strong> {notification.timestamp}</p>
    </div>
  )}
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
