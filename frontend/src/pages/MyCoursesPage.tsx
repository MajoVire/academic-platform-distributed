import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { getSubjectCourses, getSubjects, getStudentEnrolledCourses } from '../api/academicApi'
import type { Course } from '../types/academic'
import { useAuth } from '../context/AuthProvider'
import CourseCard from '../components/ui/CourseCard'
import { IoBookOutline } from 'react-icons/io5'

// Importación de imágenes
import { courseImageMap } from '../utils/courseImages'

export function MyCoursesPage() {
  const navigate = useNavigate()
  const { userId, numericUserId, hasRole } = useAuth()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!userId) {
            setCourses([])
            return
        }

        const enrolledCourseIds = await getStudentEnrolledCourses(numericUserId)

        if (!enrolledCourseIds || enrolledCourseIds.length === 0) {
            setCourses([])
            return
        }

        // Cargar todos los cursos (ya que no hay un endpoint directo de cursos)
        const subjectsList = await getSubjects()
        let allCourses: Course[] = []
        for (const s of subjectsList) {
          const sCourses = await getSubjectCourses(s.id)
          allCourses = [...allCourses, ...sCourses]
        }

        // Filtrar solo los cursos inscritos
        const myEnrolledCourses = allCourses.filter(course => enrolledCourseIds.includes(course.id))
        
        setCourses(myEnrolledCourses)
      } catch (err) {
        console.error('Error fetching my courses:', err)
        setError('Ocurrió un error al cargar tus cursos inscritos. Comprueba la conexión con la API.')
      } finally {
        setLoading(false)
      }
    }

    fetchMyCourses()
  }, [userId])


  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
             <IoBookOutline className="w-8 h-8 text-blue-600" /> Mis Cursos Inscritos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
            Aquí encontrarás únicamente las materias en las que te has inscrito para continuar tu aprendizaje.
          </p>
        </div>
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
                resourceCount={course.id === 1 ? 2 : course.id === 2 ? 2 : course.id === 3 ? 1 : undefined}
                actionLabel="Continuar Aprendiendo"
                onClick={() => {
                  navigate(`/courses/${course.id}/resources`)
                }}
              />
          ))
        ) : (
          !error && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
               <IoBookOutline className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
               <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                 No tienes cursos inscritos
               </h3>
               <p className="text-slate-500 dark:text-slate-500 text-sm max-w-md mb-6">
                 Actualmente no te has matriculado en ningún curso. Visita la pestaña Explorar para revisar el catálogo completo y comenzar tu aprendizaje.
               </p>
               <Link 
                 to="/explore" 
                 className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
               >
                 Explorar Catálogo
               </Link>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default MyCoursesPage
