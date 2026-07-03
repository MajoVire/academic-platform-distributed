export interface OfflineSyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncAt: string | null
  lastSyncError: string | null
}

type SyncStateListener = () => void

let state: OfflineSyncState = {
  isOnline: navigator.onLine,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,
  lastSyncError: null,
}

const listeners = new Set<SyncStateListener>()

function emit(): void {
  listeners.forEach((listener) => listener())
}

function setState(partialState: Partial<OfflineSyncState>): void {
  state = {
    ...state,
    ...partialState,
  }
  emit()
}

export function getSyncState(): OfflineSyncState {
  return state
}

export function subscribeSyncState(listener: SyncStateListener): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function setIsOnline(isOnline: boolean): void {
  setState({ isOnline })
}

export function setIsSyncing(isSyncing: boolean): void {
  setState({ isSyncing })
}

export function setPendingCount(pendingCount: number): void {
  setState({ pendingCount })
}

export function setLastSyncAt(lastSyncAt: string | null): void {
  setState({ lastSyncAt })
}

export function setLastSyncError(lastSyncError: string | null): void {
  setState({ lastSyncError })
}

export function resetSyncError(): void {
  setState({ lastSyncError: null })
}
