export type Subject = {
  id: number
  name: string
  description?: string
}

export type Course = {
  id: number
  subjectId: number
  title: string
  description?: string
}

export type Resource = {
  id: number
  courseId: number
  title: string
  type?: string
  url?: string
  completed?: boolean
}

export type Progress = {
  studentId: number
  completedResources: number
  totalResources: number
  percentage: number
  completedResourceIds?: number[]
}

export type StudentProgressApiResponse = {
  studentId: number
  completedResourceIds: number[]
  totalCompletedResources: number
  lastCompletedAt?: string
}

export type Recommendation = {
  id?: number
  studentId?: number
  resourceId?: number
  title: string
  reason: string
}

export type StudentRecommendationsResponse = {
  studentId: number
  recommendations: Recommendation[]
}
