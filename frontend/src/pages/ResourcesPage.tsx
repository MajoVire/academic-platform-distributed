import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { getCourseResources, getStudentProgress, completeResource } from '../api/academicApi'
import type { Resource } from '../types/academic'
import ResourceCard from '../components/ui/ResourceCard'
import { IoChevronBackOutline } from 'react-icons/io5'
import { useAuth } from '../context/AuthProvider'

// =========================================================================
// PÁGINA DE RECURSOS DEL CURSO
// Aquí el estudiante ve todos los materiales de un curso (ej. videos, lecturas).
// Al pulsar "Completar recurso", se guarda su progreso en segundo plano,
// viajando por la arquitectura concurrente de Spring Boot.
// =========================================================================

// Ilustración Isométrica de Recursos Académicos y Carpetas
const IsometricResourcesIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-36 h-28 select-none pointer-events-none drop-shadow-lg hidden sm:block overflow-visible">
    <ellipse cx="100" cy="130" rx="60" ry="22" fill="#475569" fillOpacity="0.08" />

    {/* Carpeta Isométrica */}
    <g transform="translate(60, 40)">
      {/* Tapa trasera */}
      <path d="M 10,40 L 40,25 L 70,40 L 70,80 L 10,80 Z" fill="#2563eb" fillOpacity="0.6" />
      
      {/* Documento 1 flotando */}
      <path d="M 20,25 L 45,12 L 65,22 L 65,65 L 20,65 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <line x1="30" y1="28" x2="50" y2="18" stroke="#94a3b8" strokeWidth="1" />
      <line x1="30" y1="36" x2="55" y2="24" stroke="#cbd5e1" strokeWidth="1" />

      {/* Tapa delantera */}
      <path d="M 5,45 L 35,30 L 45,35 L 75,50 L 75,85 L 5,85 Z" fill="#3b82f6" />
    </g>

    {/* Sparkles */}
    <circle cx="50" cy="50" r="1.5" fill="#f59e0b" className="animate-pulse" />
    <circle cx="150" cy="70" r="1.5" fill="#10b981" className="animate-pulse" />
  </svg>
)

export function ResourcesPage() {
  // Extraemos el ID del curso actual de la URL
  const { courseId } = useParams<{ courseId?: string }>()
  const { numericUserId, hasRole } = useAuth()

  // Solo STUDENT y ADMIN pueden completar recursos
  const canComplete = hasRole('STUDENT') || hasRole('ADMIN')

  // Estados locales para los recursos, los IDs completados, estados de carga y peticiones de red pendientes
  const [resources, setResources] = useState<Resource[]>([])
  const [completedIds, setCompletedIds] = useState<number[]>([]) // Lista de IDs de recursos ya estudiados
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<number | null>(null) // ID del recurso que se está completando en este momento
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Función para descargar los recursos de la materia y el progreso del estudiante actual
  const fetchResourcesAndProgress = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Obtener la lista de recursos que este estudiante ya completó de la base de datos
      const progressData = await getStudentProgress(numericUserId)
      if (progressData && progressData.completedResourceIds) {
        setCompletedIds(progressData.completedResourceIds)
      } else {
        setCompletedIds([])
      }

      // 2. Cargar los recursos específicos de este curso
      if (courseId) {
        const cId = parseInt(courseId, 10)
        const resourcesData = await getCourseResources(cId)
        setResources(resourcesData)
      } else {
        // Cargar todos los recursos de todos los cursos
        let allResources: Resource[] = []
        // Recorrer los cursos conocidos (id 1, 2, 3 según init.sql)
        for (const cId of [1, 2, 3]) {
          try {
            const res = await getCourseResources(cId)
            allResources = [...allResources, ...res]
          } catch {
            // Ignorar errores parciales de cursos inexistentes
          }
        }
        setResources(allResources)
      }
    } catch (err) {
      console.error('Error fetching resources:', err)
      setError('Error al obtener la lista de recursos académicos. Asegúrate de iniciar los servicios.')
    } finally {
      setLoading(false)
    }
  }

  // Recarga los recursos cada vez que el usuario cambie de curso
  useEffect(() => {
    fetchResourcesAndProgress()
  }, [courseId])

  // Método estrella: Se ejecuta al pulsar el botón "Completar recurso".
  // Envía la petición a la API asíncrona de Spring Boot, que procesa la finalización
  // concurrentemente con hilos de ejecución de base de datos y publica un evento en RabbitMQ
  // para que FastAPI de Python actualice sus recomendaciones.
  const handleMarkCompleted = async (resourceId: number, resourceTitle: string) => {
    try {
      setPendingId(resourceId) // Activa el icono de "Procesando..." para este recurso específico
      setError(null)
      setSuccessMsg(null)

      // Ejecutar llamada al backend
      await completeResource(numericUserId, resourceId)

      // Actualizar estado local inmediato para pintar la tarjeta de verde de forma instantánea
      setCompletedIds((prev) => [...prev, resourceId])
      setSuccessMsg(`¡Excelente! Completaste "${resourceTitle}". Se ha registrado en la base de datos y enviado a la cola de recomendaciones de forma asíncrona.`)
      
      // Auto-ocultar mensaje de éxito a los 7 segundos
      setTimeout(() => setSuccessMsg(null), 7000)
    } catch (err) {
      console.error('Error completing resource:', err)
      setError('No se pudo marcar el recurso como completado en el servidor.')
    } finally {
      setPendingId(null)
    }
  }


  return (
    <div className="space-y-8 text-left">
      {/* Botón de Retorno */}
      <div className="flex items-center">
        <Link
          to="/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <IoChevronBackOutline className="w-4 h-4" />
          Volver a Materias
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Recursos de Aprendizaje
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Completa los recursos de estudio para asimilar la información y desbloquear sugerencias inteligentes de cursos.
          </p>
        </div>
        <div className="flex-shrink-0">
          <IsometricResourcesIllustration />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium animate-[fadeIn_0.3s_ease-out]">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeletal Skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse h-56 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
          ))
        ) : resources.length > 0 ? (
          resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              id={resource.id}
              title={resource.title}
              description={resource.type === 'video' ? 'Video explicativo con guía práctica paso a paso.' : 'Material de lectura teórica y ejercicios prácticos de afianzamiento.'}
              type={resource.type || 'video'}
              isCompleted={completedIds.includes(resource.id)}
              onCompleteToggle={canComplete ? () => handleMarkCompleted(resource.id, resource.title) : undefined}
              isPending={pendingId === resource.id}
            />
          ))
        ) : (
          !error && (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No hay recursos académicos registrados para este curso.
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default ResourcesPage
