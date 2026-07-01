export interface RecommendationPayload {
  title: string
  reason: string
}

export interface RecommendationGeneratedEvent {
  eventId: string
  eventType: 'RECOMMENDATION_GENERATED'
  studentId: number
  status: string
  message: string
  timestamp: string
  subjectId: number
  courseId: number
  resourceId: number
  resourceTitle: string
  completedAt: string
  generatedAt: string
  sourceEventType: string
  recommendation: RecommendationPayload
}