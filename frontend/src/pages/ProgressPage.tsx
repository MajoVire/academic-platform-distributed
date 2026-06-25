import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {
  getCourseResources,
  getStudentProgress,
  getSubjectCourses,
  getSubjects,
  getCatalogResourceCountApi,
} from '../api/academicApi'
import type { Course, Resource } from '../types/academic'
import ProgressCircle from '../components/ui/ProgressCircle'
import ProgressBar from '../components/ui/ProgressBar'

// =========================================================================
// PÁGINA DE PROGRESO DEL ESTUDIANTE
// Muestra el porcentaje total completado y detalles individuales del avance
// del estudiante 1. Es el panel de métricas y estadísticas principales.
// =========================================================================

type ProgressViewModel = {
  studentId: number
  completedResources: number
  totalResources: number
  percentage: number
  lastCompletedAt?: string
}

// Ilustración Isométrica de Crecimiento y Métricas
const IsometricProgressIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-36 h-28 select-none pointer-events-none drop-shadow-lg hidden sm:block overflow-visible">
    <ellipse cx="100" cy="130" rx="60" ry="22" fill="#475569" fillOpacity="0.08" />

    {/* Column 1 (Left, Short) */}
    <g transform="translate(40, 65)">
      <path d="M 10,20 L 25,12 L 40,20 L 25,28 Z" fill="#34d399" fillOpacity="0.8" />
      <path d="M 10,20 L 25,28 L 25,60 L 10,52 Z" fill="#10b981" />
      <path d="M 25,28 L 40,20 L 40,52 L 25,60 Z" fill="#059669" />
    </g>

    {/* Column 2 (Middle, Medium) */}
    <g transform="translate(80, 45)">
      <path d="M 10,20 L 25,12 L 40,20 L 25,28 Z" fill="#60a5fa" fillOpacity="0.8" />
      <path d="M 10,20 L 25,28 L 25,80 L 10,72 Z" fill="#3b82f6" />
      <path d="M 25,28 L 40,20 L 40,72 L 25,80 Z" fill="#1d4ed8" />
    </g>

    {/* Rising arrow/sparkle line */}
    <path d="M 40,110 Q 75,80 105,62" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="3 3" />
    <path d="M 105,62 L 99,64 L 103,69 Z" fill="#6366f1" />
  </svg>
)

import { useAuth } from '../context/AuthProvider'

export function ProgressPage() {
  // Obtenemos de forma opcional el id del estudiante desde la URL si existiera
  const { studentId } = useParams<{ studentId?: string }>()
  
  // Estados para almacenar la información del progreso, la carga y posibles errores
  const [progress, setProgress] = useState<ProgressViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { userName } = useAuth()
  
  // Si no se especifica un estudiante en la URL, usamos el estudiante 1 por defecto
  // TODO: Mapear usuario de Keycloak a ID de PostgreSQL
  const defaultStudentId = studentId ? parseInt(studentId, 10) : 1

  // Al cargar la página, llamamos a la API para traer las métricas del estudiante
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const [studentProgress, catalogResourceCount] = await Promise.all([
          getStudentProgress(defaultStudentId),
          getCatalogResourceCountApi(),
        ])

        const completedResources = studentProgress.totalCompletedResources
        const percentage =
          catalogResourceCount > 0
            ? Math.round((completedResources / catalogResourceCount) * 100)
            : 0

        setProgress({
          studentId: studentProgress.studentId,
          completedResources,
          totalResources: catalogResourceCount,
          percentage,
          lastCompletedAt: studentProgress.lastCompletedAt,
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching progress:', err)
        setError('Ocurrió un error al cargar el progreso estudiantil. Verifica la conexión con la API.')
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [defaultStudentId])


  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Mi Progreso Académico
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Consulta las estadísticas del material que has completado y el porcentaje global de tu especialidad académica.
          </p>
        </div>
        <div className="flex-shrink-0">
          <IsometricProgressIllustration />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        // Skeleton de carga
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-around gap-8 animate-pulse">
          <div className="w-32 h-32 rounded-full bg-slate-200/70 dark:bg-slate-800/60" />
          <div className="flex-grow space-y-4 w-full">
            <div className="h-4 w-1/3 bg-slate-200/70 dark:bg-slate-800/60 rounded" />
            <div className="h-3 w-2/3 bg-slate-200/70 dark:bg-slate-800/60 rounded" />
            <div className="h-6 w-full bg-slate-200/70 dark:bg-slate-800/60 rounded-full" />
          </div>
        </div>
      ) : progress ? (
        <div className="space-y-8">
          {/* Dashboard de Progreso */}
          <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-around gap-8 shadow-sm">
            {/* Círculo de Progreso SVG */}
            <div className="flex flex-col items-center gap-3">
              <ProgressCircle
                percentage={progress.percentage || 0}
                size={140}
                strokeWidth={8}
                className="hover:scale-[1.02] transition-transform duration-300"
              />
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Completado Global
              </span>
            </div>

            {/* Detalles textuales e indicador lineal */}
            <div className="flex-grow space-y-6 w-full md:max-w-xl text-left">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Resumen de Logros
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Actualmente has finalizado <span className="font-bold text-blue-600 dark:text-blue-400">{progress.completedResources}</span> de un total de <span className="font-bold text-slate-700 dark:text-slate-300">{progress.totalResources}</span> recursos de aprendizaje asignados a tu plan de estudio de Computación.
                </p>
                {progress.lastCompletedAt && (
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    Última actividad registrada:{' '}
                    {new Date(progress.lastCompletedAt).toLocaleString('es-EC')}
                  </p>
                )}
              </div>

              {/* Barra de progreso lineal */}
              <div className="space-y-2">
                <ProgressBar
                  percentage={progress.percentage || 0}
                  height="md"
                  showText={true}
                />
              </div>

              {/* Métricas destacadas */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Recursos Completados
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                    {progress.completedResources || 0}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Faltantes por Estudiar
                  </span>
                  <span className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1 block">
                    {(progress.totalResources || 0) - (progress.completedResources || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !error && (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            No se encontraron datos de progreso para este estudiante.
          </div>
        )
      )}
    </div>
  )
}

export default ProgressPage
