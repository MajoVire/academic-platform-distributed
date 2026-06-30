import MainLayout from '../layouts/MainLayout'
import CoursesPage from '../pages/CoursesPage'
import HomePage from '../pages/HomePage'
import ProgressPage from '../pages/ProgressPage'
import RecommendationsPage from '../pages/RecommendationsPage'
import ResourcesPage from '../pages/ResourcesPage'
import SubjectsPage from '../pages/SubjectsPage'

// Este archivo es el "mapa de carreteras" de la aplicación.
// Define qué componente/página renderizar según la URL que visite el usuario.
// Todas las páginas están envueltas en <MainLayout> para mantener el diseño visual (menú de navegación, fondo, etc.) coherente.
export const appRoutes = [
  {
    path: '/', // Página de inicio / Landing page
    isPrivate: false,
    element: (
      <MainLayout>
        <HomePage />
      </MainLayout>
    ),
  },
  {
    path: '/subjects', // Catálogo general de materias
    isPrivate: true,
    element: (
      <MainLayout>
        <SubjectsPage />
      </MainLayout>
    ),
  },
  {
    path: '/courses', // Todos los cursos en general
    isPrivate: true,
    element: (
      <MainLayout>
        <CoursesPage />
      </MainLayout>
    ),
  },
  {
    path: '/subjects/:subjectId/courses', // Cursos filtrados por una materia en específico
    isPrivate: true,
    element: (
      <MainLayout>
        <CoursesPage />
      </MainLayout>
    ),
  },
  {
    path: '/resources', // Todos los recursos en general
    isPrivate: true,
    element: (
      <MainLayout>
        <ResourcesPage />
      </MainLayout>
    ),
  },
  {
    path: '/courses/:courseId/resources', // Recursos asociados a un curso en específico
    isPrivate: true,
    element: (
      <MainLayout>
        <ResourcesPage />
      </MainLayout>
    ),
  },
  {
    path: '/progress', // Progreso académico del estudiante actual
    isPrivate: true,
    element: (
      <MainLayout>
        <ProgressPage />
      </MainLayout>
    ),
  },
  {
    path: '/students/:studentId/progress', // Progreso académico para un estudiante específico
    isPrivate: true,
    element: (
      <MainLayout>
        <ProgressPage />
      </MainLayout>
    ),
  },
  {
    path: '/recommendations', // Recomendaciones inteligentes del estudiante actual
    isPrivate: true,
    element: (
      <MainLayout>
        <RecommendationsPage />
      </MainLayout>
    ),
  },
  {
    path: '/students/:studentId/recommendations', // Recomendaciones inteligentes para un estudiante específico
    isPrivate: true,
    element: (
      <MainLayout>
        <RecommendationsPage />
      </MainLayout>
    ),
  },
]