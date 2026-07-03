import type {
  Subject,
  Course,
  Resource,
} from '../types/academic'

export type CachedSubject = Subject

export type CachedCourse = Course

export type CachedResource = Resource

export interface CachedProgressRecord {
  studentId: number
  completedResourceIds: number[]
  totalCompletedResources: number
  lastCompletedAt?: string
  updatedAt: string
}

export type PendingOperationStatus = 'pending' | 'syncing' | 'synced' | 'error'

export interface PendingOperationPayload {
  studentId: number
  resourceId: number
}

export interface PendingOperation {
  id?: number
  type: 'COMPLETE_RESOURCE'
  payload: PendingOperationPayload
  createdAt: string
  status: PendingOperationStatus
  attempts: number
  lastError?: string
}

export type NewPendingOperation = Omit<PendingOperation, 'id' | 'status' | 'attempts'> &
  Partial<Pick<PendingOperation, 'status' | 'attempts' | 'lastError'>>
