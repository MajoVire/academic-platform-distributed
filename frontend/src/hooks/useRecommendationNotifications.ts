import { useEffect, useState } from 'react'
import { connectSocket } from '../realtime/socketClient'
import type { RecommendationGeneratedEvent } from '../types/academic'



export function useRecommendationNotifications() {
  const [connected, setConnected] = useState(false)
  const [notification, setNotification] =
  useState<RecommendationGeneratedEvent | null>(null)

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

    socket.on(
      'recommendation-generated',
      (data: RecommendationGeneratedEvent) => {
        console.log('[WebSocket] Evento recibido:', data)

        console.log(
          `[WebSocket] Recomendación: ${data.recommendation.title}`,
        )

        setNotification(data)
      },
    )

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