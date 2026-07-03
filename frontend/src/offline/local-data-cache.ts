import type {
  Recommendation,
  StudentRecommendationsResponse,
} from '../types/academic'

const ENROLLED_COURSES_PREFIX = 'academic-platform-enrolled-courses'
const RECOMMENDATIONS_PREFIX = 'academic-platform-recommendations'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function getStorageKey(prefix: string, studentId: number): string {
  return `${prefix}:${studentId}`
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) {
    return null
  }

  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignorar errores de almacenamiento local para no romper la UI offline.
  }
}

function normalizeCourseIds(courseIds: unknown): number[] {
  if (!Array.isArray(courseIds)) {
    return []
  }

  return Array.from(
    new Set(
      courseIds
        .filter((courseId): courseId is number => Number.isInteger(courseId) && courseId > 0),
    ),
  ).sort((left, right) => left - right)
}

function normalizeRecommendation(recommendation: unknown): Recommendation | null {
  if (
    typeof recommendation !== 'object' ||
    recommendation === null ||
    typeof (recommendation as Recommendation).title !== 'string' ||
    typeof (recommendation as Recommendation).reason !== 'string'
  ) {
    return null
  }

  const value = recommendation as Recommendation

  return {
    title: value.title,
    reason: value.reason,
    ...(typeof value.id === 'number' ? { id: value.id } : {}),
    ...(typeof value.studentId === 'number' ? { studentId: value.studentId } : {}),
    ...(typeof value.resourceId === 'number' ? { resourceId: value.resourceId } : {}),
  }
}

export async function saveStudentEnrolledCourses(
  studentId: number,
  courseIds: number[],
): Promise<void> {
  writeJson(getStorageKey(ENROLLED_COURSES_PREFIX, studentId), normalizeCourseIds(courseIds))
}

export async function appendStudentEnrolledCourse(
  studentId: number,
  courseId: number,
): Promise<void> {
  const currentCourses = await getStudentEnrolledCoursesFromCache(studentId)
  const nextCourses = normalizeCourseIds([...currentCourses, courseId])

  await saveStudentEnrolledCourses(studentId, nextCourses)
}

export async function getStudentEnrolledCoursesFromCache(
  studentId: number,
): Promise<number[]> {
  const cachedCourses = readJson<unknown>(
    getStorageKey(ENROLLED_COURSES_PREFIX, studentId),
  )

  return normalizeCourseIds(cachedCourses)
}

export async function saveStudentRecommendations(
  response: StudentRecommendationsResponse,
): Promise<void> {
  const normalizedRecommendations = Array.isArray(response.recommendations)
    ? response.recommendations
        .map(normalizeRecommendation)
        .filter((value): value is Recommendation => value !== null)
    : []

  writeJson(getStorageKey(RECOMMENDATIONS_PREFIX, response.studentId), {
    studentId: response.studentId,
    recommendations: normalizedRecommendations,
  } satisfies StudentRecommendationsResponse)
}

export async function appendStudentRecommendation(
  studentId: number,
  recommendation: Recommendation,
): Promise<void> {
  const currentResponse =
    (await getStudentRecommendationsFromCache(studentId)) ?? {
      studentId,
      recommendations: [],
    }
  const nextRecommendations = [...currentResponse.recommendations, recommendation]
  const dedupedRecommendations = nextRecommendations.filter(
    (item, index, items) =>
      index ===
      items.findIndex(
        (candidate) =>
          candidate.title === item.title &&
          candidate.reason === item.reason &&
          candidate.resourceId === item.resourceId,
      ),
  )

  await saveStudentRecommendations({
    studentId,
    recommendations: dedupedRecommendations,
  })
}

export async function getStudentRecommendationsFromCache(
  studentId: number,
): Promise<StudentRecommendationsResponse | null> {
  const cachedResponse = readJson<unknown>(
    getStorageKey(RECOMMENDATIONS_PREFIX, studentId),
  )

  if (
    typeof cachedResponse !== 'object' ||
    cachedResponse === null ||
    typeof (cachedResponse as StudentRecommendationsResponse).studentId !== 'number' ||
    !Array.isArray((cachedResponse as StudentRecommendationsResponse).recommendations)
  ) {
    return null
  }

  const typedResponse = cachedResponse as StudentRecommendationsResponse

  return {
    studentId: typedResponse.studentId,
    recommendations: typedResponse.recommendations
      .map(normalizeRecommendation)
      .filter((value): value is Recommendation => value !== null),
  }
}
