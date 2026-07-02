import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { loadGatewayConfig } from '../config/env.js'
import { registerStudentSocketHandlers } from '../services/notification.service.js'

let io: Server

export function initializeSocketServer(server: HttpServer): Server {
  const { corsOrigin } = loadGatewayConfig()

  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`)
    registerStudentSocketHandlers(socket)

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Cliente desconectado: ${socket.id}`)
    })
  })

  return io
}

export function getSocketServer(): Server {
  if (!io) {
    throw new Error('Socket.IO todavía no ha sido inicializado.')
  }

  return io
}
