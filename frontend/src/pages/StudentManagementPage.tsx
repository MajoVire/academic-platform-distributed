import { useNavigate } from 'react-router'
import { IoBarChartOutline, IoSparklesOutline, IoPeopleOutline } from 'react-icons/io5'
import { useEffect, useState } from 'react'
import { getProfessorStudents } from '../api/academicApi'

// =========================================================================
// PÁGINA DE GESTIÓN DE ESTUDIANTES (Solo PROFESSOR y ADMIN)
// Permite al profesor ver la lista de estudiantes y acceder al progreso
// y recomendaciones de cada uno. Filtra los datos simulados basados
// en las inscripciones reales del backend.
// =========================================================================

// Datos simulados de estudiantes registrados en la plataforma.
const mockStudentsAll = [
  { id: 1, name: 'María García López', email: 'maria.garcia@academic.local' },
  { id: 2, name: 'Carlos Rodríguez Peña', email: 'carlos.rodriguez@academic.local' },
  { id: 3, name: 'Ana Martínez Vega', email: 'ana.martinez@academic.local' },
  { id: 4, name: 'Luis Fernández Torres', email: 'luis.fernandez@academic.local' },
  { id: 5, name: 'Sofia Morales Cruz', email: 'sofia.morales@academic.local' },
]

export function StudentManagementPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<typeof mockStudentsAll>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStudents() {
      try {
        // En producción el professorId vendría del token (ej. userId), aquí usamos 100 por el init.sql
        const professorId = 100 
        const enrolledIds = await getProfessorStudents(professorId)
        
        // Filtramos nuestro diccionario usando los IDs devueltos por el backend
        const enrolledStudents = mockStudentsAll.filter(s => enrolledIds.includes(s.id))
        setStudents(enrolledStudents)
      } catch (error) {
        console.error("Error cargando estudiantes", error)
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [])

  return (
    <div className="space-y-8 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <IoPeopleOutline className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Gestión de Estudiantes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Panel exclusivo para profesores y administradores. Consulta el progreso académico y las recomendaciones de cada estudiante inscrito.
          </p>
        </div>

        {/* Contador */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
            <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider block">
              Inscritos
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-300 block mt-0.5">
              {students.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Encabezado de tabla (solo escritorio) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Nombre</div>
          <div className="col-span-4">Correo</div>
          <div className="col-span-3 text-center">Acciones</div>
        </div>

        {/* Filas de estudiantes */}
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando inscripciones reales...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Ningún estudiante está inscrito en tus cursos todavía.</div>
        ) : (
          students.map((student, index) => (
            <div
              key={student.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 md:py-3.5 items-center transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                index !== students.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/60' : ''
              }`}
            >
              {/* ID */}
              <div className="md:col-span-1">
                <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">ID:</span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">#{student.id}</span>
              </div>

              {/* Nombre */}
              <div className="md:col-span-4">
                <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 block mb-0.5">Nombre:</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{student.name}</span>
              </div>

              {/* Email */}
              <div className="md:col-span-4">
                <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 block mb-0.5">Correo:</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{student.email}</span>
              </div>

              {/* Botones de acción */}
              <div className="md:col-span-3 flex items-center gap-2 md:justify-center mt-2 md:mt-0">
                <button
                  onClick={() => navigate(`/students/${student.id}/progress`)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors border border-blue-200/60 dark:border-blue-800/40 cursor-pointer"
                  title={`Ver progreso de ${student.name}`}
                >
                  <IoBarChartOutline className="w-3.5 h-3.5" />
                  Progreso
                </button>
                <button
                  onClick={() => navigate(`/students/${student.id}/recommendations`)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-colors border border-indigo-200/60 dark:border-indigo-800/40 cursor-pointer"
                  title={`Ver recomendaciones de ${student.name}`}
                >
                  <IoSparklesOutline className="w-3.5 h-3.5" />
                  Recomendaciones
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Nota informativa */}
      <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/10 border border-blue-200/60 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
        <strong>Nota:</strong> Los nombres son del diccionario local, pero la cantidad y pertenencia a tus cursos viene en vivo desde la base de datos de PostgreSQL usando el endpoint de inscripciones.
      </div>
    </div>
  )
}

export default StudentManagementPage
