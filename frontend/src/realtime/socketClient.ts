import { io, Socket } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:3000'

let socket: Socket | null = null

export function connectSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })
  }

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}