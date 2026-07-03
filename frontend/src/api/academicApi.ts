
import { apiClient } from './apiClient'
import type {
  Course,
  Resource,
  StudentProgressApiResponse,
  StudentRecommendationsResponse,
  Subject,
} from '../types/academic'


import {
  getSubjects as getCachedSubjects,
  getCourses as getCachedCourses,
  getResources as getCachedResources,
  saveSubjects,
  saveCourses,
  saveResources,
} from '../offline/catalog-cache'

import { addPendingOperation } from '../offline/pending-operations'
import {
  getStudentProgressFromCache,
  markResourceCompletedLocally,
  saveStudentProgress,
} from '../offline/progress-cache'
import {
  appendStudentEnrolledCourse,
  getStudentEnrolledCoursesFromCache,
  getStudentRecommendationsFromCache,
  saveStudentEnrolledCourses,
  saveStudentRecommendations,
} from '../offline/local-data-cache'

export async function getSubjects(): Promise<Subject[]> {

  try {

    const { data } = await apiClient.get<Subject[]>('/api/subjects')

    await saveSubjects(data)

    return data

  } catch {

    return await getCachedSubjects()

  }
}

export async function getSubjectCourses(
  subjectId: number,
): Promise<Course[]> {

  try {

    const { data } = await apiClient.get<Course[]>(
      `/api/subjects/${subjectId}/courses`,
    )

    await saveCourses(data)

    return data

  } catch {

    const courses = await getCachedCourses()

    return courses.filter(course => course.subjectId === subjectId)

  }
}

// Consigue todos los recursos (videos, PDF, etc.) que pertenecen a un curso determinado.
export async function getCourseResources(
  courseId: number,
): Promise<Resource[]> {

  try {

    const { data } = await apiClient.get<Resource[]>(
      `/api/courses/${courseId}/resources`,
    )

    await saveResources(data)

    return data

  } catch {

    const resources = await getCachedResources()

    return resources.filter(resource => resource.courseId === courseId)

  }
}

export async function completeResource(
  studentId: number,
  resourceId: number,
): Promise<void> {
  await apiClient.post(
    `/api/students/${studentId}/resources/${resourceId}/complete`,
  )
}

export async function completeResourceLocally(
  studentId: number,
  resourceId: number,
  completedAt: string = new Date().toISOString(),
): Promise<StudentProgressApiResponse> {
  return markResourceCompletedLocally(studentId, resourceId, completedAt)
}

export async function completeResourceOffline(
  studentId: number,
  resourceId: number,
): Promise<StudentProgressApiResponse> {
  const completedAt = new Date().toISOString()

  await addPendingOperation({
    type: 'COMPLETE_RESOURCE',
    payload: {
      studentId,
      resourceId,
    },
    createdAt: completedAt,
  })

  return markResourceCompletedLocally(studentId, resourceId, completedAt)
}

// Obtiene las estadísticas de progreso globales de un estudiante (cuántos recursos completó y porcentaje).
export async function getStudentProgress(
  studentId: number,
): Promise<StudentProgressApiResponse> {
  try {
    const { data } = await apiClient.get<StudentProgressApiResponse>(
      `/api/students/${studentId}/progress`,
    )
    await saveStudentProgress(data)
    return data
  } catch {
    const cachedProgress = await getStudentProgressFromCache(studentId)

    return (
      cachedProgress ?? {
        studentId,
        completedResourceIds: [],
        totalCompletedResources: 0,
      }
    )
  }
}

// Llama al motor inteligente de Python (FastAPI) para recibir sugerencias personalizadas
// de nuevos cursos basadas en lo que el estudiante ya ha estudiado.
export async function getStudentRecommendations(
  studentId: number,
): Promise<StudentRecommendationsResponse> {
  try {
    const { data } = await apiClient.get<StudentRecommendationsResponse>(
      `/api/students/${studentId}/recommendations`,
    )
    await saveStudentRecommendations(data)
    return data
  } catch {
    const cachedRecommendations = await getStudentRecommendationsFromCache(studentId)

    return (
      cachedRecommendations ?? {
        studentId,
        recommendations: [],
      }
    )
  }
}
// Obtiene el contador optimizado de todos los recursos del catálogo para evitar el problema N+1
export async function getCatalogResourceCountApi(): Promise<number> {
  const { data } = await apiClient.get<number>('/api/catalog/resources/count')
  return data
}

export async function enrollInCourse(studentId: number, courseId: number): Promise<void> {
  await apiClient.post(`/api/students/${studentId}/courses/${courseId}/enroll`)
  await appendStudentEnrolledCourse(studentId, courseId)
}

export async function getProfessorStudents(professorId: number): Promise<number[]> {
  const { data } = await apiClient.get<number[]>(`/api/professors/${professorId}/students`)
  return data
}

export async function getStudentEnrolledCourses(studentId: number): Promise<number[]> {
  try {
    const { data } = await apiClient.get<number[]>(
      `/api/students/${studentId}/courses`,
    )
    await saveStudentEnrolledCourses(studentId, data)
    return data
  } catch {
    const cachedCourseIds = await getStudentEnrolledCoursesFromCache(studentId)

    if (cachedCourseIds.length > 0) {
      return cachedCourseIds
    }

    const cachedProgress = await getStudentProgressFromCache(studentId)
    if (!cachedProgress || cachedProgress.completedResourceIds.length === 0) {
      return []
    }

    const cachedResources = await getCachedResources()
    const inferredCourseIds = cachedResources
      .filter(resource => cachedProgress.completedResourceIds.includes(resource.id))
      .map(resource => resource.courseId)

    return Array.from(new Set(inferredCourseIds)).sort((left, right) => left - right)
  }
}
