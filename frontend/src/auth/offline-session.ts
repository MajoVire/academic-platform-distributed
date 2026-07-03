const OFFLINE_AUTH_STORAGE_KEY = 'academic-platform-offline-auth'
const DEFAULT_OFFLINE_SESSION_TTL_HOURS = 24

function getOfflineSessionTtlHours(): number {
  const configuredHours = Number.parseFloat(
    import.meta.env.VITE_OFFLINE_SESSION_TTL_HOURS ?? '',
  )

  return Number.isFinite(configuredHours) && configuredHours > 0
    ? configuredHours
    : DEFAULT_OFFLINE_SESSION_TTL_HOURS
}

export function getOfflineSessionTtlMs(): number {
  return getOfflineSessionTtlHours() * 60 * 60 * 1000
}

function isValidUserId(userId: unknown): userId is string {
  return typeof userId === 'string' && userId.trim().length > 0
}

function isValidRoles(roles: unknown): roles is string[] {
  return (
    Array.isArray(roles) &&
    roles.length > 0 &&
    roles.every((role) => typeof role === 'string' && role.trim().length > 0)
  )
}

export interface OfflineAuthSnapshot {
  authenticated: true
  userId: string | null
  username: string | null
  roles: string[]
  numericUserId: number
  offlineExpiresAt: number
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function saveOfflineAuthSnapshot(snapshot: OfflineAuthSnapshot): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(
    OFFLINE_AUTH_STORAGE_KEY,
    JSON.stringify(snapshot),
  )
}

export function getOfflineAuthSnapshot(): OfflineAuthSnapshot | null {
  if (!isBrowser()) {
    return null
  }

  const rawSnapshot = window.localStorage.getItem(OFFLINE_AUTH_STORAGE_KEY)
  if (!rawSnapshot) {
    return null
  }

  try {
    const parsedSnapshot = JSON.parse(rawSnapshot) as Partial<OfflineAuthSnapshot>

    if (
      parsedSnapshot?.authenticated !== true ||
      typeof parsedSnapshot.offlineExpiresAt !== 'number' ||
      !isValidUserId(parsedSnapshot.userId) ||
      !isValidRoles(parsedSnapshot.roles)
    ) {
      return null
    }

    return {
      authenticated: true,
      userId: parsedSnapshot.userId,
      username: typeof parsedSnapshot.username === 'string' ? parsedSnapshot.username : null,
      roles: parsedSnapshot.roles,
      numericUserId:
        typeof parsedSnapshot.numericUserId === 'number' && parsedSnapshot.numericUserId > 0
          ? parsedSnapshot.numericUserId
          : 1,
      offlineExpiresAt: parsedSnapshot.offlineExpiresAt,
    }
  } catch {
    return null
  }
}

export function clearOfflineAuthSnapshot(): void {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(OFFLINE_AUTH_STORAGE_KEY)
}

export function isOfflineAuthSnapshotValid(
  snapshot: OfflineAuthSnapshot | null,
): snapshot is OfflineAuthSnapshot {
  return (
    snapshot !== null &&
    snapshot.authenticated === true &&
    isValidUserId(snapshot.userId) &&
    isValidRoles(snapshot.roles) &&
    typeof snapshot.offlineExpiresAt === 'number' &&
    snapshot.offlineExpiresAt > Date.now()
  )
}
