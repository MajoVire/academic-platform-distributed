import { dbPromise } from './indexeddb'
import type { StudentProgressApiResponse } from '../types/academic'
import type { CachedProgressRecord } from './types'

function toCachedProgress(progress: StudentProgressApiResponse): CachedProgressRecord {
  const completedResourceIds = Array.from(new Set(progress.completedResourceIds)).sort((left, right) => left - right)

  return {
    studentId: progress.studentId,
    completedResourceIds,
    totalCompletedResources: progress.totalCompletedResources,
    lastCompletedAt: progress.lastCompletedAt,
    updatedAt: new Date().toISOString(),
  }
}

function toApiProgress(record: CachedProgressRecord): StudentProgressApiResponse {
  return {
    studentId: record.studentId,
    completedResourceIds: [...record.completedResourceIds],
    totalCompletedResources: record.totalCompletedResources,
    lastCompletedAt: record.lastCompletedAt,
  }
}

export async function saveStudentProgress(
  progress: StudentProgressApiResponse,
): Promise<void> {
  const db = await dbPromise
  await db.put('progress', toCachedProgress(progress))
}

export async function getStudentProgressFromCache(
  studentId: number,
): Promise<StudentProgressApiResponse | null> {
  const db = await dbPromise
  const record = await db.get('progress', studentId)

  return record ? toApiProgress(record) : null
}

export async function markResourceCompletedLocally(
  studentId: number,
  resourceId: number,
  completedAt: string = new Date().toISOString(),
): Promise<StudentProgressApiResponse> {
  const currentProgress = await getStudentProgressFromCache(studentId)
  const completedResourceIds = new Set(currentProgress?.completedResourceIds ?? [])
  completedResourceIds.add(resourceId)

  const nextProgress: StudentProgressApiResponse = {
    studentId,
    completedResourceIds: Array.from(completedResourceIds).sort((left, right) => left - right),
    totalCompletedResources: completedResourceIds.size,
    lastCompletedAt: completedAt,
  }

  await saveStudentProgress(nextProgress)

  return nextProgress
}

export async function deleteStudentProgress(studentId: number): Promise<void> {
  const db = await dbPromise
  await db.delete('progress', studentId)
}
