import { dbPromise } from './indexeddb'
import type { Subject } from '../types/academic'

const STORE = 'subjects'

export async function saveSubjects(subjects: Subject[]) {
  const db = await dbPromise

  const tx = db.transaction(STORE, 'readwrite')

  await tx.store.clear()

  for (const subject of subjects) {
    await tx.store.put(subject)
  }

  await tx.done
}

export async function getSubjectsOffline(): Promise<Subject[]> {
  const db = await dbPromise

  return db.getAll(STORE)
}

export async function clearSubjects() {
  const db = await dbPromise

  const tx = db.transaction(STORE, 'readwrite')

  await tx.store.clear()

  await tx.done
}
