import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type { Course, Resource, Subject } from '../types/academic'
import type { CachedProgressRecord, PendingOperation, PendingOperationStatus } from './types'

export const DATABASE_NAME = 'academic-platform-db'

export const DATABASE_VERSION = 2

export interface AcademicPlatformDB extends DBSchema {
  subjects: {
    key: Subject['id']
    value: Subject
  }
  courses: {
    key: Course['id']
    value: Course
    indexes: {
      bySubjectId: Course['subjectId']
    }
  }
  resources: {
    key: Resource['id']
    value: Resource
    indexes: {
      byCourseId: Resource['courseId']
    }
  }
  progress: {
    key: CachedProgressRecord['studentId']
    value: CachedProgressRecord
  }
  pending_operations: {
    key: number
    value: PendingOperation
    indexes: {
      byStatus: PendingOperationStatus
      byCreatedAt: string
    }
  }
}

export const dbPromise = openDB<AcademicPlatformDB>(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db, _oldVersion, _newVersion, transaction) {
    if (!db.objectStoreNames.contains('subjects')) {
      db.createObjectStore('subjects', {
        keyPath: 'id',
      })
    }

    if (!db.objectStoreNames.contains('courses')) {
      const coursesStore = db.createObjectStore('courses', {
        keyPath: 'id',
      })
      coursesStore.createIndex('bySubjectId', 'subjectId')
    } else {
      const coursesStore = transaction.objectStore('courses')
      if (!coursesStore.indexNames.contains('bySubjectId')) {
        coursesStore.createIndex('bySubjectId', 'subjectId')
      }
    }

    if (!db.objectStoreNames.contains('resources')) {
      const resourcesStore = db.createObjectStore('resources', {
        keyPath: 'id',
      })
      resourcesStore.createIndex('byCourseId', 'courseId')
    } else {
      const resourcesStore = transaction.objectStore('resources')
      if (!resourcesStore.indexNames.contains('byCourseId')) {
        resourcesStore.createIndex('byCourseId', 'courseId')
      }
    }

    if (!db.objectStoreNames.contains('progress')) {
      db.createObjectStore('progress', {
        keyPath: 'studentId',
      })
    }

    if (!db.objectStoreNames.contains('pending_operations')) {
      const queueStore = db.createObjectStore('pending_operations', {
        keyPath: 'id',
        autoIncrement: true,
      })
      queueStore.createIndex('byStatus', 'status')
      queueStore.createIndex('byCreatedAt', 'createdAt')
    } else {
      const queueStore = transaction.objectStore('pending_operations')
      if (!queueStore.indexNames.contains('byStatus')) {
        queueStore.createIndex('byStatus', 'status')
      }
      if (!queueStore.indexNames.contains('byCreatedAt')) {
        queueStore.createIndex('byCreatedAt', 'createdAt')
      }
    }
  },
})

export const getDatabase = () => dbPromise
