import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { getCourseResources, getStudentProgress, completeResource } from '../api/academicApi'
import type { Resource } from '../types/academic'
import ResourceCard from '../components/ui/ResourceCard'
import { IoChevronBackOutline } from 'react-icons/io5'

export function ResourcesPage() {
  const { courseId } = useParams<{ courseId?: string }>()
  const [resources, setResources] = useState<Resource[]>([])
  const [completedIds, setCompletedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const studentId = 1 // ID del estudiante por defecto en la demo

  const fetchResourcesAndProgress = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Obtener progreso de completados
      const progressData = await getStudentProgress(studentId)
      if (progressData && progressData.completedResourceIds) {
        setCompletedIds(progressData.completedResourceIds)
      } else {
        setCompletedIds([])
      }

      // 2. Obtener recursos del curso o generales
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
          } catch (e) {
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

  useEffect(() => {
    fetchResourcesAndProgress()
  }, [courseId])

  const handleMarkCompleted = async (resourceId: number, resourceTitle: string) => {
    try {
      setPendingId(resourceId)
      setError(null)
      setSuccessMsg(null)

      // Ejecutar llamada al backend
      await completeResource(studentId, resourceId)

      // Actualizar estado local inmediato
      setCompletedIds((prev) => [...prev, resourceId])
      setSuccessMsg(`¡Excelente! Completaste "${resourceTitle}". Se ha registrado en la base de datos y enviado a la cola de recomendaciones de forma asíncrona.`)
      
      // Auto-ocultar mensaje de éxito
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

      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Recursos de Aprendizaje
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          Completa los recursos de estudio para asimilar la información y desbloquear sugerencias inteligentes de cursos.
        </p>
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
              onCompleteToggle={() => handleMarkCompleted(resource.id, resource.title)}
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
