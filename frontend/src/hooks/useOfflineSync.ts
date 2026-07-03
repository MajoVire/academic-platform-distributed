import { useEffect, useSyncExternalStore } from 'react'
import { useOfflineStatus } from './useOfflineStatus'
import { syncPendingOperations } from '../offline/sync-service'
import {
  getSyncState,
  subscribeSyncState,
  setIsOnline,
} from '../offline/sync-state'
import { syncPendingOperationCount } from '../offline/pending-operations'

export function useOfflineSync() {
  const isOnline = useOfflineStatus()
  const syncState = useSyncExternalStore(
    subscribeSyncState,
    getSyncState,
    getSyncState,
  )

  useEffect(() => {
    setIsOnline(isOnline)
  }, [isOnline])

  useEffect(() => {
    void syncPendingOperationCount()
  }, [])

  useEffect(() => {
    if (!isOnline) {
      return
    }

    void syncPendingOperations()
  }, [isOnline])

  return {
    ...syncState,
    isOnline,
  }
}
