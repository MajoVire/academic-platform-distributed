import { openDB } from 'idb'

export const DATABASE_NAME = 'academic-platform-db'

export const DATABASE_VERSION = 1

export const dbPromise = openDB(
  DATABASE_NAME,
  DATABASE_VERSION,
  {
    upgrade(db) {
      if (!db.objectStoreNames.contains('subjects')) {
        db.createObjectStore('subjects', {
          keyPath: 'id',
        })
      }

      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', {
          keyPath: 'id',
        })
      }

      if (!db.objectStoreNames.contains('resources')) {
        db.createObjectStore('resources', {
          keyPath: 'id',
        })
      }

      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', {
          keyPath: ['studentId', 'resourceId'],
        })
      }

      if (!db.objectStoreNames.contains('pending_operations')) {
        db.createObjectStore('pending_operations', {
          keyPath: 'id',
          autoIncrement: true,
        })
      }
    },
  },
)