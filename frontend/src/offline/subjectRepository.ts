import { getDatabase } from './database'
import type { Subject } from '../types/academic'

const STORE = 'subjects'

export async function saveSubjects(subjects: Subject[]) {
  const db = await getDatabase()

  const tx = db.transaction(STORE, 'readwrite')

  await tx.store.clear()

  for (const subject of subjects) {
    await tx.store.put(subject)
  }

  await tx.done
}

export async function getSubjectsOffline(): Promise<Subject[]> {
  const db = await getDatabase()

  return db.getAll(STORE)
}

export async function clearSubjects() {
  const db = await getDatabase()

  const tx = db.transaction(STORE, 'readwrite')

  await tx.store.clear()

  await tx.done
}