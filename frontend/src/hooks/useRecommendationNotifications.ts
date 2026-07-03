import { useEffect, useState } from 'react'
import { connectSocket } from '../realtime/socketClient'
import type { RecommendationGeneratedEvent } from '../types/academic'
import { appendStudentRecommendation } from '../offline/local-data-cache'

const REGISTER_STUDENT_EVENT = 'register-student'
const RECOMMENDATION_GENERATED_EVENT = 'recommendation-generated'

function normalizeStudentId(value: number): number | null {
  return Number.isInteger(value) && value > 0 ? value : null
}

export function useRecommendationNotifications(studentId: number) {
  const [connected, setConnected] = useState(false)
  const [notification, setNotification] =
    useState<RecommendationGeneratedEvent | null>(null)

  useEffect(() => {
    const normalizedStudentId = normalizeStudentId(studentId)

    if (normalizedStudentId === null) {
      console.warn(
        '[WebSocket] studentId inválido para notificaciones:',
        studentId,
      )
      setConnected(false)
      setNotification(null)
      return undefined
    }

    const socket = connectSocket()
    const studentRoom = `student:${normalizedStudentId}`

    const registerStudent = () => {
      socket.emit(REGISTER_STUDENT_EVENT, {
        studentId: String(normalizedStudentId),
      })

      console.log(`[WebSocket] Registrado en ${studentRoom}`)
    }

    const handleConnect = () => {
      setConnected(true)
      registerStudent()
    }

    const handleDisconnect = () => {
      setConnected(false)
    }

    const handleRecommendation = (
      data: RecommendationGeneratedEvent,
    ) => {
      if (data.studentId !== normalizedStudentId) {
        console.warn(
          '[WebSocket] Evento ignorado por studentId no coincidente',
          {
            expected: normalizedStudentId,
            received: data.studentId,
          },
        )
        return
      }

      console.log('[WebSocket] Evento recibido:', data)
      console.log(
        `[WebSocket] Recomendación: ${data.recommendation.title}`,
      )

      void appendStudentRecommendation(normalizedStudentId, {
        title: data.recommendation.title,
        reason: data.recommendation.reason,
        studentId: data.studentId,
        resourceId: data.resourceId,
      }).catch((error) => {
        console.error('[WebSocket] No se pudo persistir la recomendación localmente', error)
      })

      setNotification(data)
    }

    setNotification(null)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(RECOMMENDATION_GENERATED_EVENT, handleRecommendation)

    if (socket.connected) {
      setConnected(true)
      registerStudent()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off(RECOMMENDATION_GENERATED_EVENT, handleRecommendation)
    }
  }, [studentId])

  return {
    connected,
    notification,
  }
}
