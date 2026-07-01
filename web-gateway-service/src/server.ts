import { createServer } from 'http'
import { createApp } from './app.js'
import { loadGatewayConfig } from './config/env.js'
import { initializeSocketServer } from './realtime/socket-server.js'
import { initializeRabbitMQConsumer } from './messaging/rabbitmq-consumer.js'

const config = loadGatewayConfig()

const app = createApp({ config })

const httpServer = createServer(app)

initializeSocketServer(httpServer)

httpServer.listen(config.port, '0.0.0.0', () => {
  console.log(`[web-gateway-service] listening on port ${config.port}`)
  console.log(`[web-gateway-service] forwarding requests to ${config.academicServiceUrl}`)
  console.log('[WebSocket] Socket.IO iniciado correctamente')

  initializeRabbitMQConsumer()
})