import { dbPromise } from './indexeddb'
import type { NewPendingOperation, PendingOperation, PendingOperationStatus } from './types'
import { setLastSyncError, setPendingCount } from './sync-state'

function normalizePendingOperation(operation: NewPendingOperation): PendingOperation {
  return {
    ...operation,
    status: operation.status ?? 'pending',
    attempts: operation.attempts ?? 0,
    lastError: operation.lastError?.trim() || undefined,
  }
}

export async function syncPendingOperationCount(): Promise<number> {
  const db = await dbPromise
  const operations = await db.getAll('pending_operations')
  const pendingCount = operations.filter(
    (operation) => operation.status !== 'synced',
  ).length
  setPendingCount(pendingCount)

  const hasPermanentErrors = operations.some(
    (operation) =>
      operation.status === 'error' &&
      typeof operation.lastError === 'string' &&
      operation.lastError.startsWith('permanent:'),
  )

  if (hasPermanentErrors) {
    setLastSyncError('Error al sincronizar. Hay operaciones que requieren revisión.')
  }

  return pendingCount
}

export async function addPendingOperation(operation: NewPendingOperation): Promise<number> {
  const db = await dbPromise
  const id = await db.add('pending_operations', normalizePendingOperation(operation))
  await syncPendingOperationCount()
  return id
}

export async function getPendingOperations(): Promise<PendingOperation[]> {
  const db = await dbPromise
  return db.getAllFromIndex('pending_operations', 'byCreatedAt')
}

export async function getPendingOperationById(id: number): Promise<PendingOperation | undefined> {
  const db = await dbPromise
  return db.get('pending_operations', id)
}

export async function getPendingOperationsByStatus(
  status: PendingOperationStatus,
): Promise<PendingOperation[]> {
  const db = await dbPromise
  return db.getAllFromIndex('pending_operations', 'byStatus', status)
}

export async function updatePendingOperation(operation: PendingOperation): Promise<void> {
  if (operation.id === undefined) {
    throw new Error('pending operation id is required to update it')
  }

  const db = await dbPromise
  await db.put('pending_operations', normalizePendingOperation(operation))
  await syncPendingOperationCount()
}

export async function deletePendingOperation(id: number): Promise<void> {
  const db = await dbPromise
  await db.delete('pending_operations', id)
  await syncPendingOperationCount()
}
