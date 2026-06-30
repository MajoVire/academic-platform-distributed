import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { getSubjectCourses, getSubjects } from '../api/academicApi'
import type { Course, Subject } from '../types/academic'
import CourseCard from '../components/ui/CourseCard'
import { IoChevronBackOutline } from 'react-icons/io5'

// =========================================================================
// PÁGINA DE CURSOS
// Esta página carga y muestra los cursos de una materia específica
// (filtrando por subjectId que viene en los parámetros de la URL).
// =========================================================================

// Importación de imágenes de cursos reales desde assets para que no haya imágenes rotas.
import sistemasDistribuidosImg from '../assets/sistemasDistribuidos.png'
import mensajeriaYColasImg from '../assets/mensajeriaYColas.png'
import disenosoftwareImg from '../assets/disenosoftware.png'

// Diccionario de imágenes asociadas al ID de cada curso para dibujarlas dinámicamente.
const courseImageMap: Record<number, string> = {
  1: sistemasDistribuidosImg,
  2: mensajeriaYColasImg,
  3: disenosoftwareImg,
}


export function CoursesPage() {
  // Obtiene el ID de la materia actual desde la URL (ej. /subjects/1/courses -> subjectId es "1")
  const { subjectId } = useParams<{ subjectId?: string }>()
  
  // Estados para los cursos cargados, la materia actual, la pantalla de carga y errores
  const [courses, setCourses] = useState<Course[]>([])
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dispara el efecto cada vez que cambie "subjectId" para volver a cargar los datos correctos
  useEffect(() => {
    const fetchCoursesAndSubject = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Cargar materias para encontrar el nombre de la materia actual
        const subjectsList = await getSubjects()
        
        if (subjectId) {
          const sId = parseInt(subjectId, 10)
          const currentSubject = subjectsList.find((s) => s.id === sId)
          if (currentSubject) {
            setSubject(currentSubject)
          }
          
          // Obtener los cursos pertenecientes a esta materia desde la API de Spring Boot
          const coursesData = await getSubjectCourses(sId)
          setCourses(coursesData)
        } else {
          // Si no hay id de materia, cargar todos los cursos de la plataforma iterando sobre las materias
          setSubject(null)
          let allCourses: Course[] = []
          for (const s of subjectsList) {
            const sCourses = await getSubjectCourses(s.id)
            allCourses = [...allCourses, ...sCourses]
          }
          setCourses(allCourses)
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Ocurrió un error al cargar los cursos. Comprueba la conexión con la API.')
      } finally {
        setLoading(false)
      }
    }

    fetchCoursesAndSubject()
  }, [subjectId])


  return (
    <div className="space-y-8 text-left">
      {/* Botón de Retorno a Materias */}
      <div className="flex items-center justify-between">
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
          {subject ? `Cursos de ${subject.name}` : 'Todos los Cursos'}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
          {subject ? subject.description : 'Listado general de los cursos de especialización complementaria.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeletal Skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse h-64 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
          ))
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description || ''}
              imageUrl={courseImageMap[course.id]}
              resourceCount={course.id === 1 ? 2 : course.id === 2 ? 2 : course.id === 3 ? 1 : undefined} // Contar semánticamente según init.sql
              to={`/courses/${course.id}/resources`}
            />
          ))
        ) : (
          !error && (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No hay cursos complementarios registrados para esta materia.
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default CoursesPage
