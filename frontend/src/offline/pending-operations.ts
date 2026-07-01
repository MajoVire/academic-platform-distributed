import { dbPromise } from './indexeddb'
import type { PendingOperation } from './types'

/**
 * Guardar operación pendiente cuando no hay internet
 */
export async function addPendingOperation(
  operation: PendingOperation,
) {
  const db = await dbPromise
  await db.add('pending_operations', operation)
}

/**
 * Obtener todas las operaciones pendientes
 */
export async function getPendingOperations(): Promise<PendingOperation[]> {
  const db = await dbPromise
  return db.getAll('pending_operations')
}

/**
 * Eliminar operación después de sincronizar
 */
export async function deletePendingOperation(id: number) {
  const db = await dbPromise
  await db.delete('pending_operations', id)
}