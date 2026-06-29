import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

let io: Server

export function initializeSocketServer(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`)

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