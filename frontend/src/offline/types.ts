import type {
  Subject,
  Course,
  Resource,
} from '../types/academic'

export type CachedSubject=Subject 

export type CachedCourse = Course

export type CachedResource = Resource

export interface CachedProgress {
  studentId: number
  resourceId: number
  completed: boolean
  completedAt?: string
  synchronized: boolean
}

export interface PendingOperation {
  id?: number
  type: 'COMPLETE_RESOURCE'
  payload: unknown
  createdAt: string
}