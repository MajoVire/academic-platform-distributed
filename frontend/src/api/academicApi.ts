import { apiClient } from './apiClient'
import type {
  Course,
  Progress,
  Resource,
  StudentRecommendationsResponse,
  Subject,
} from '../types/academic'

export async function getSubjects(): Promise<Subject[]> {
  const { data } = await apiClient.get<Subject[]>('/api/subjects')
  return data
}

export async function getSubjectCourses(subjectId: number): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>(
    `/api/subjects/${subjectId}/courses`,
  )
  return data
}

export async function getCourseResources(courseId: number): Promise<Resource[]> {
  const { data } = await apiClient.get<Resource[]>(
    `/api/courses/${courseId}/resources`,
  )
  return data
}

export async function completeResource(
  studentId: number,
  resourceId: number,
): Promise<void> {
  await apiClient.post(
    `/api/students/${studentId}/resources/${resourceId}/complete`,
  )
}

export async function getStudentProgress(
  studentId: number,
): Promise<Progress> {
  const { data } = await apiClient.get<Progress>(
    `/api/students/${studentId}/progress`,
  )
  return data
}

export async function getStudentRecommendations(
  studentId: number,
): Promise<StudentRecommendationsResponse> {
  const { data } = await apiClient.get<StudentRecommendationsResponse>(
    `/api/students/${studentId}/recommendations`,
  )
  return data
}