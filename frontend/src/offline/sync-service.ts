import { apiClient } from '../api/apiClient'
import { markResourceCompletedLocally } from './progress-cache'
import {
  deletePendingOperation,
  getPendingOperationById,
  getPendingOperations,
  updatePendingOperation,
  syncPendingOperationCount,
} from './pending-operations'
import type { PendingOperation } from './types'
import {
  resetSyncError,
  setIsSyncing,
  setLastSyncAt,
  setLastSyncError,
} from './sync-state'

let isSyncing = false
let inFlightSync: Promise<void> | null = null

function isTemporaryErrorMessage(message: string): boolean {
  return message.startsWith('temporary:')
}

function createTemporaryError(message: string): string {
  return `temporary: ${message}`
}

function createPermanentError(message: string): string {
  return `permanent: ${message}`
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return 'unexpected error'
}

function getHttpStatus(error: unknown): number | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { status?: unknown } }).response?.status === 'number'
  ) {
    return (error as { response: { status: number } }).response.status
  }

  return null
}

function isRetryableStoredOperation(operation: PendingOperation): boolean {
  if (operation.status === 'pending') {
    return true
  }

  if (operation.status !== 'error') {
    return false
  }

  return operation.lastError ? isTemporaryErrorMessage(operation.lastError) : false
}

async function syncSingleOperation(operationId: number): Promise<boolean> {
  const storedOperation = await getPendingOperationById(operationId)
  if (!storedOperation) {
    return true
  }

  if (!isRetryableStoredOperation(storedOperation)) {
    return true
  }

  await updatePendingOperation({
    ...storedOperation,
    status: 'syncing',
    attempts: storedOperation.attempts,
    lastError: storedOperation.lastError,
  })

  try {
    if (storedOperation.type !== 'COMPLETE_RESOURCE') {
      throw new Error(`unsupported pending operation: ${storedOperation.type}`)
    }

    const { studentId, resourceId } = storedOperation.payload

    await apiClient.post(
      `/api/students/${studentId}/resources/${resourceId}/complete`,
    )

    try {
      await markResourceCompletedLocally(
        studentId,
        resourceId,
        storedOperation.createdAt,
      )
    } catch (localError) {
      console.error('Local cache update failed after successful sync', localError)
      await deletePendingOperation(storedOperation.id!)
      await syncPendingOperationCount()
      setLastSyncError('El recurso se completó, pero no pudo actualizarse la copia local.')
      return true
    }

    await deletePendingOperation(storedOperation.id!)
    await syncPendingOperationCount()
    return true
  } catch (error) {
    const httpStatus = getHttpStatus(error)
    const message = getErrorMessage(error)

    if (httpStatus === 401) {
      await updatePendingOperation({
        ...storedOperation,
        status: 'pending',
        lastError: createTemporaryError(`unauthorized: ${message}`),
      })
      await syncPendingOperationCount()
      setLastSyncError(createTemporaryError(`unauthorized: ${message}`))
      return false
    }

    if (httpStatus === 403) {
      await updatePendingOperation({
        ...storedOperation,
        status: 'error',
        attempts: storedOperation.attempts + 1,
        lastError: createPermanentError(`forbidden: ${message}`),
      })
      await syncPendingOperationCount()
      setLastSyncError(createPermanentError(`forbidden: ${message}`))
      return true
    }

    if (httpStatus === 400 || httpStatus === 404) {
      await updatePendingOperation({
        ...storedOperation,
        status: 'error',
        attempts: storedOperation.attempts + 1,
        lastError: createPermanentError(`client-error-${httpStatus}: ${message}`),
      })
      await syncPendingOperationCount()
      setLastSyncError(createPermanentError(`client-error-${httpStatus}: ${message}`))
      return true
    }

    if (
      httpStatus === 500 ||
      httpStatus === 502 ||
      httpStatus === 503 ||
      httpStatus === 504 ||
      httpStatus === null
    ) {
      await updatePendingOperation({
        ...storedOperation,
        status: 'error',
        attempts: storedOperation.attempts + 1,
        lastError: createTemporaryError(
          httpStatus === null ? `network-error: ${message}` : `server-error-${httpStatus}: ${message}`,
        ),
      })
      await syncPendingOperationCount()
      setLastSyncError(
        createTemporaryError(
          httpStatus === null
            ? `network-error: ${message}`
            : `server-error-${httpStatus}: ${message}`,
        ),
      )
      return true
    }

    await updatePendingOperation({
      ...storedOperation,
      status: 'error',
      attempts: storedOperation.attempts + 1,
      lastError: createTemporaryError(`unexpected: ${message}`),
    })
    await syncPendingOperationCount()
    setLastSyncError(createTemporaryError(`unexpected: ${message}`))
    return true
  }
}

export async function syncPendingOperations(): Promise<void> {
  if (isSyncing) {
    return inFlightSync ?? Promise.resolve()
  }

  isSyncing = true
  setIsSyncing(true)
  resetSyncError()

  const execution = (async () => {
    try {
      const pendingOperations = await getPendingOperations()

      const staleSyncingOperations = pendingOperations.filter(
        (operation) => operation.status === 'syncing',
      )

      for (const staleOperation of staleSyncingOperations) {
        await updatePendingOperation({
          ...staleOperation,
          status: 'pending',
          lastError: createTemporaryError('stale syncing state recovered'),
        })
      }

      const refreshedOperations = await getPendingOperations()
      const candidates = refreshedOperations.filter(isRetryableStoredOperation)

      for (const operation of candidates) {
        if (!isSyncing) {
          break
        }

        const shouldContinue = await syncSingleOperation(operation.id!)
        if (!shouldContinue) {
          break
        }
      }

      await syncPendingOperationCount()
      setLastSyncAt(new Date().toISOString())
    } finally {
      isSyncing = false
      setIsSyncing(false)
    }
  })()

  inFlightSync = execution

  try {
    await execution
  } finally {
    inFlightSync = null
  }
}
