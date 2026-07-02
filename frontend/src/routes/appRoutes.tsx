import MainLayout from '../layouts/MainLayout'
import CoursesPage from '../pages/CoursesPage'
import HomePage from '../pages/HomePage'
import ProgressPage from '../pages/ProgressPage'
import RecommendationsPage from '../pages/RecommendationsPage'
import ResourcesPage from '../pages/ResourcesPage'
import SubjectsPage from '../pages/SubjectsPage'
import StudentManagementPage from '../pages/StudentManagementPage'
import MyCoursesPage from '../pages/MyCoursesPage'

// Definición de la estructura de cada ruta de la aplicación
export interface AppRoute {
  path: string
  isPrivate: boolean
  roles?: string[] // Roles del realm de Keycloak permitidos para esta ruta (vacío = cualquier autenticado)
  element: React.ReactNode
}

// Este archivo es el "mapa de carreteras" de la aplicación.
// Define qué componente/página renderizar según la URL que visite el usuario.
// Todas las páginas están envueltas en <MainLayout> para mantener el diseño visual (menú de navegación, fondo, etc.) coherente.
export const appRoutes: AppRoute[] = [
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
    path: '/explore', // Catálogo general de materias
    isPrivate: true,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <SubjectsPage />
      </MainLayout>
    ),
  },
  {
    path: '/my-courses', // Cursos inscritos
    isPrivate: true,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <MyCoursesPage />
      </MainLayout>
    ),
  },
  {
    path: '/subjects', // Mantenemos la ruta anterior para compatibilidad o la redirigimos
    isPrivate: true,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <SubjectsPage />
      </MainLayout>
    ),
  },
  {
    path: '/courses', // Todos los cursos en general
    isPrivate: true,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <CoursesPage />
      </MainLayout>
    ),
  },
  {
    path: '/subjects/:subjectId/courses', // Cursos filtrados por una materia en específico
    isPrivate: true,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <CoursesPage />
      </MainLayout>
    ),
  },
  {
    path: '/resources', // Todos los recursos en general
    isPrivate: true,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <ResourcesPage />
      </MainLayout>
    ),
  },
  {
    path: '/courses/:courseId/resources', // Recursos asociados a un curso en específico
    isPrivate: true,
    roles: ['STUDENT', 'PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <ResourcesPage />
      </MainLayout>
    ),
  },
  {
    path: '/progress', // Progreso académico del estudiante actual (solo STUDENT y ADMIN)
    isPrivate: true,
    roles: ['STUDENT', 'ADMIN'],
    element: (
      <MainLayout>
        <ProgressPage />
      </MainLayout>
    ),
  },
  {
    path: '/students/:studentId/progress', // Progreso académico de un estudiante específico (solo PROFESSOR y ADMIN)
    isPrivate: true,
    roles: ['PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <ProgressPage />
      </MainLayout>
    ),
  },
  {
    path: '/recommendations', // Recomendaciones inteligentes del estudiante actual (solo STUDENT y ADMIN)
    isPrivate: true,
    roles: ['STUDENT', 'ADMIN'],
    element: (
      <MainLayout>
        <RecommendationsPage />
      </MainLayout>
    ),
  },
  {
    path: '/students/:studentId/recommendations', // Recomendaciones inteligentes de un estudiante específico (solo PROFESSOR y ADMIN)
    isPrivate: true,
    roles: ['PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <RecommendationsPage />
      </MainLayout>
    ),
  },
  {
    path: '/admin/students', // Panel de gestión de estudiantes (solo PROFESSOR y ADMIN)
    isPrivate: true,
    roles: ['PROFESSOR', 'ADMIN'],
    element: (
      <MainLayout>
        <StudentManagementPage />
      </MainLayout>
    ),
  },
]
