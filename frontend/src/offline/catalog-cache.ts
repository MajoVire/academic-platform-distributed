import { dbPromise } from './indexeddb'
import type {
  CachedSubject,
  CachedCourse,
  CachedResource,
} from './types'

/* ===========================
   SUBJECTS
=========================== */

export async function saveSubjects(subjects: CachedSubject[]) {
  const db = await dbPromise

  const tx = db.transaction('subjects', 'readwrite')

  for (const subject of subjects) {
    await tx.store.put(subject)
  }

  await tx.done
}

export async function getSubjects(): Promise<CachedSubject[]> {
  const db = await dbPromise
  return db.getAll('subjects')
}

/* ===========================
   COURSES
=========================== */

export async function saveCourses(courses: CachedCourse[]) {
  const db = await dbPromise

  const tx = db.transaction('courses', 'readwrite')

  for (const course of courses) {
    await tx.store.put(course)
  }

  await tx.done
}

export async function getCourses(): Promise<CachedCourse[]> {
  const db = await dbPromise
  return db.getAll('courses')
}

/* ===========================
   RESOURCES
=========================== */

export async function saveResources(resources: CachedResource[]) {
  const db = await dbPromise

  const tx = db.transaction('resources', 'readwrite')

  for (const resource of resources) {
    await tx.store.put(resource)
  }

  await tx.done
}

export async function getResources(): Promise<CachedResource[]> {
  const db = await dbPromise
  return db.getAll('resources')
}