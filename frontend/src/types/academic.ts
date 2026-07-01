// Representa una Materia académica (por ejemplo: Computación, Diseño, etc.)
export type Subject = {
  id: number
  name: string
  description?: string // Descripción opcional de lo que trata la materia
}

// Representa un Curso dentro de una materia (por ejemplo: Sistemas Distribuidos)
export type Course = {
  id: number
  subjectId: number // ID de la materia a la que pertenece
  title: string
  description?: string
}

// Representa un Recurso de estudio (un video de YouTube o un documento PDF/Texto)
export type Resource = {
  id: number
  courseId: number // ID del curso al que pertenece este recurso
  title: string
  type?: string // 'video' o 'document'
  url?: string
  completed?: boolean // Indica si el usuario ya lo estudió
}

// Representa el progreso de estudio acumulado del estudiante
export type Progress = {
  studentId: number
  completedResources: number // Cuántos recursos ha terminado el alumno
  totalResources: number // Total de recursos del plan de estudio
  percentage: number // Porcentaje calculado de 0 a 100
  completedResourceIds?: number[] // Lista con los IDs de los recursos ya completados
}

// Respuesta de la API para el progreso detallado de un estudiante
export type StudentProgressApiResponse = {
  studentId: number
  completedResourceIds: number[]
  totalCompletedResources: number
  lastCompletedAt?: string
}

// Representa una recomendación de curso o tema inteligente
export type Recommendation = {
  id?: number
  studentId?: number
  resourceId?: number
  title: string // Nombre de la recomendación o del curso recomendado
  reason: string // Por qué la IA (FastAPI) te recomienda esto
}

// Respuesta de la API que contiene el ID del estudiante y sus recomendaciones inteligentes
export type StudentRecommendationsResponse = {
  studentId: number
  recommendations: Recommendation[]
}

// Evento que llega por WebSocket cuando el worker de Python genera una recomendación.
export type RecommendationGeneratedEvent = {
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

  recommendation: {
    title: string
    reason: string
  }
}