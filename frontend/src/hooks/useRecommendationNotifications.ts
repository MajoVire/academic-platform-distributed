import { useEffect, useState } from 'react'
import { connectSocket } from '../realtime/socketClient'

export interface RecommendationNotification {
  studentId: number
  status: string
  message: string
  timestamp: string
}

export function useRecommendationNotifications() {
  const [connected, setConnected] = useState(false)
  const [notification, setNotification] =
    useState<RecommendationNotification | null>(null)

  useEffect(() => {
    const socket = connectSocket()

    socket.on('connect', () => {
      console.log('[WebSocket] Conectado')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('[WebSocket] Desconectado')
      setConnected(false)
    })

    socket.on('recommendation-generated', (data: RecommendationNotification) => {
      console.log('[WebSocket] Notificación recibida:', data)
      setNotification(data)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('recommendation-generated')
    }
  }, [])

  return {
    connected,
    notification,
  }
}