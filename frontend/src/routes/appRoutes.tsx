import MainLayout from '../layouts/MainLayout'
import CoursesPage from '../pages/CoursesPage'
import HomePage from '../pages/HomePage'
import ProgressPage from '../pages/ProgressPage'
import RecommendationsPage from '../pages/RecommendationsPage'
import ResourcesPage from '../pages/ResourcesPage'
import SubjectsPage from '../pages/SubjectsPage'

export const appRoutes = [
  {
    path: '/',
    element: (
      <MainLayout>
        <HomePage />
      </MainLayout>
    ),
  },
  {
    path: '/subjects',
    element: (
      <MainLayout>
        <SubjectsPage />
      </MainLayout>
    ),
  },
  {
    path: '/courses',
    element: (
      <MainLayout>
        <CoursesPage />
      </MainLayout>
    ),
  },
  {
    path: '/subjects/:subjectId/courses',
    element: (
      <MainLayout>
        <CoursesPage />
      </MainLayout>
    ),
  },
  {
    path: '/resources',
    element: (
      <MainLayout>
        <ResourcesPage />
      </MainLayout>
    ),
  },
  {
    path: '/courses/:courseId/resources',
    element: (
      <MainLayout>
        <ResourcesPage />
      </MainLayout>
    ),
  },
  {
    path: '/progress',
    element: (
      <MainLayout>
        <ProgressPage />
      </MainLayout>
    ),
  },
  {
    path: '/students/:studentId/progress',
    element: (
      <MainLayout>
        <ProgressPage />
      </MainLayout>
    ),
  },
  {
    path: '/recommendations',
    element: (
      <MainLayout>
        <RecommendationsPage />
      </MainLayout>
    ),
  },
  {
    path: '/students/:studentId/recommendations',
    element: (
      <MainLayout>
        <RecommendationsPage />
      </MainLayout>
    ),
  },
]