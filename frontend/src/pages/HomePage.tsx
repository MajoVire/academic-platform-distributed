import { useNavigate } from 'react-router'
import { 
  IoStar,
  IoStarHalf,
} from 'react-icons/io5'
import { useAuth } from '../context/AuthProvider'

export function HomePage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const handleProtectedAction = (path: string) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      login()
    }
  }

  // Cursos de muestra simulados
  const trendingCourses = [
    {
      id: 1,
      title: 'Docker y Sistemas Distribuidos Completos de Cero a Experto',
      author: 'Facultad de Ingeniería',
      rating: 4.8,
      reviews: '9,234',
      price: 'Materia Troncal',
      badge: 'Lo más visto',
      image: '/course_docker.png',
      path: '/subjects'
    },
    {
      id: 2,
      title: 'Concurrencia y Hilos Asíncronos con Spring Boot Avanzado',
      author: 'Departamento de Ciencias',
      rating: 4.9,
      reviews: '12,500',
      price: 'Materia Optativa',
      badge: 'Lo más visto',
      image: '/course_architecture.png',
      path: '/progress'
    },
    {
      id: 3,
      title: 'Inteligencia Artificial y Recomendaciones con Python',
      author: 'Centro de Investigación',
      rating: 4.7,
      reviews: '5,120',
      price: 'Proyecto Final',
      badge: 'Novedad',
      image: '/course_python.png',
      path: '/recommendations'
    }
  ]

  return (
    <div className="space-y-16 pb-12 w-full max-w-[1340px] mx-auto text-left font-sans">
      
      {/* =========================================================================
          Sección Hero (Estilo Udemy)
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#5624d0] mt-0 md:mt-4 shadow-sm md:rounded-none">
        <div className="flex flex-col md:flex-row items-center justify-between">
          
          {/* Bloque Izquierdo: Contenido Blanco Flotante */}
          <div className="w-full md:w-[45%] md:absolute md:left-12 md:top-1/2 md:-translate-y-1/2 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-2xl z-10 mx-auto md:max-w-[450px]">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4 font-serif">
              Desarrolla habilidades demandadas
            </h1>
            <p className="text-base text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              Accede a las materias de tu plan de estudios con prácticas reales, asíncronas y distribuidas a través de una única plataforma institucional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => handleProtectedAction('/subjects')}
                className="bg-[#a435f0] hover:bg-[#8710d8] text-white font-bold py-3.5 px-6 transition-colors duration-200 text-center w-full shadow-sm"
              >
                {isAuthenticated ? 'Ir al Catálogo' : 'Explorar Materias'}
              </button>
              {!isAuthenticated && (
                <button 
                  onClick={() => login()}
                  className="bg-transparent border border-slate-800 dark:border-slate-200 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold py-3.5 px-6 transition-colors duration-200 text-center w-full"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>

          {/* Bloque Derecho: Imagen Fotorealista */}
          <div className="w-full md:w-3/4 md:ml-auto h-[350px] md:h-[450px] relative mt-8 md:mt-0 hidden md:block">
            <img 
              src="/hero_image.png" 
              alt="Estudiante usando plataforma" 
              className="w-full h-full object-contain object-bottom md:object-cover md:object-top"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          Sección Cursos en Tendencia (Tarjetas Udemy)
          ========================================================================= */}
      <section className="px-4 md:px-0 max-w-7xl mx-auto pt-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight font-serif">
          Cursos en tendencia
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trendingCourses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => handleProtectedAction(course.path)}
              className="group flex flex-col cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
            >
              {/* Imagen del Curso */}
              <div className="w-full h-44 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/40 transition-colors duration-300" />
              </div>

              {/* Información del Curso */}
              <div className="pt-3 pb-2 flex flex-col flex-grow">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight mb-1 line-clamp-2 group-hover:text-[#5624d0] dark:group-hover:text-[#a435f0] transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                  {course.author}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm font-bold text-[#b4690e] dark:text-[#f3ca8c]">
                    {course.rating}
                  </span>
                  <div className="flex text-[#b4690e] dark:text-[#f3ca8c] text-sm">
                    <IoStar />
                    <IoStar />
                    <IoStar />
                    <IoStar />
                    <IoStarHalf />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    ({course.reviews})
                  </span>
                </div>

                <div className="mt-auto">
                  <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {course.price}
                  </span>
                </div>
              </div>

              {/* Badge */}
              {course.badge && (
                <div className="mt-1">
                  <span className="inline-block bg-[#eceb98] dark:bg-[#3d3c0a] text-slate-900 dark:text-[#eceb98] font-bold text-xs px-2 py-1">
                    {course.badge}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default HomePage;
