import amqp from 'amqplib'
import { emitRecommendationGenerated } from '../services/notification.service.js'
import { getSocketServer } from '../realtime/socket-server.js'
import type { RecommendationGeneratedEvent } from '../types/event.js'

export async function initializeRabbitMQConsumer() {
  try {
    const connection = await amqp.connect({
      hostname: process.env.RABBITMQ_HOST || 'localhost',
      port: Number(process.env.RABBITMQ_PORT || 5672),
      username: process.env.RABBITMQ_USERNAME || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
    })

    const channel = await connection.createChannel()

    const exchange =
      process.env.ACADEMIC_NOTIFICATIONS_EXCHANGE ??
      'academic.notifications.exchange'

    const queue = 'academic.notifications.queue'

    const routingKey =
      process.env.ACADEMIC_RECOMMENDATION_GENERATED_ROUTING_KEY ??
      'academic.recommendation.generated'

    await channel.assertExchange(exchange, 'topic', {
      durable: true,
    })

    await channel.assertQueue(queue, {
      durable: true,
    })

    await channel.bindQueue(queue, exchange, routingKey)

    console.log(`[RabbitMQ] Cola ${queue} enlazada al exchange ${exchange}`)

    const io = getSocketServer()
    console.log('[RabbitMQ] Conexión establecida correctamente.')

    await channel.consume(queue, (message) => {
      if (!message) return

      try {
        const event = JSON.parse(
          message.content.toString(),
        ) as RecommendationGeneratedEvent

        console.log('[RabbitMQ] Evento recibido:', event.eventType)

        if (event.eventType !== 'RECOMMENDATION_GENERATED') {
          throw new Error(
            `eventType no soportado: ${event.eventType}`,
          )
        }

        emitRecommendationGenerated(io, event)

        channel.ack(message)
      } catch (error) {
        console.error('[RabbitMQ] Error procesando mensaje:', error)

        channel.nack(message, false, false)
      }
    })

    return { connection, channel }
  } catch (error) {
    console.error('[RabbitMQ] Error al conectar:', error)
  }
}
