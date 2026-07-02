
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

  const operation = {
    type: 'COMPLETE_RESOURCE' as const,
    payload: {
      studentId,
      resourceId,
    },
    createdAt: new Date().toISOString(),
  }

  if (!navigator.onLine) {
    await addPendingOperation(operation)
    return
  }

  await apiClient.post(
    `/api/students/${studentId}/resources/${resourceId}/complete`,
  )
}

// Obtiene las estadísticas de progreso globales de un estudiante (cuántos recursos completó y porcentaje).
export async function getStudentProgress(
  studentId: number,
): Promise<StudentProgressApiResponse> {
  const { data } = await apiClient.get<StudentProgressApiResponse>(
    `/api/students/${studentId}/progress`,
  )
  return data
}

// Llama al motor inteligente de Python (FastAPI) para recibir sugerencias personalizadas
// de nuevos cursos basadas en lo que el estudiante ya ha estudiado.
export async function getStudentRecommendations(
  studentId: number,
): Promise<StudentRecommendationsResponse> {
  const { data } = await apiClient.get<StudentRecommendationsResponse>(
    `/api/students/${studentId}/recommendations`,
  )
  return data
}
// Obtiene el contador optimizado de todos los recursos del catálogo para evitar el problema N+1
export async function getCatalogResourceCountApi(): Promise<number> {
  const { data } = await apiClient.get<number>('/api/catalog/resources/count')
  return data
}

export async function enrollInCourse(studentId: number, courseId: number): Promise<void> {
  await apiClient.post(`/api/students/${studentId}/courses/${courseId}/enroll`)
}

export async function getProfessorStudents(professorId: number): Promise<number[]> {
  const { data } = await apiClient.get<number[]>(`/api/professors/${professorId}/students`)
  return data
}

export async function getStudentEnrolledCourses(studentId: number): Promise<number[]> {
  const { data } = await apiClient.get<number[]>(`/api/students/${studentId}/courses`)
  return data
}
