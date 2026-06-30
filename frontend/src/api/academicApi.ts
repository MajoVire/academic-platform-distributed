import { apiClient } from './apiClient'
import type {
  Course,
  Resource,
  StudentProgressApiResponse,
  StudentRecommendationsResponse,
  Subject,
} from '../types/academic'

// Trae todas las materias registradas (como "Sistemas Distribuidos" o "Diseño de Software").
export async function getSubjects(): Promise<Subject[]> {
  const { data } = await apiClient.get<Subject[]>('/api/subjects')
  return data
}

// Obtiene los cursos asociados a una materia específica usando su ID.
export async function getSubjectCourses(subjectId: number): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>(
    `/api/subjects/${subjectId}/courses`,
  )
  return data
}

// Consigue todos los recursos (videos, PDF, etc.) que pertenecen a un curso determinado.
export async function getCourseResources(courseId: number): Promise<Resource[]> {
  const { data } = await apiClient.get<Resource[]>(
    `/api/courses/${courseId}/resources`,
  )
  return data
}

// Registra que un estudiante leyó/completó un recurso.
// Esto avisa al backend (Spring Boot), el cual procesa el progreso usando hilos concurrentes
// y manda un mensaje a RabbitMQ para avisar al servicio de recomendaciones de Python.
export async function completeResource(
  studentId: number,
  resourceId: number,
): Promise<void> {
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
