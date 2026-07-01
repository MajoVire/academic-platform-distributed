import type { Server, Socket } from 'socket.io'
import type { RecommendationGeneratedEvent } from '../types/event.js'

const REGISTER_STUDENT_EVENT = 'register-student'
const RECOMMENDATION_GENERATED_EVENT = 'recommendation-generated'
const STUDENT_ROOM_PREFIX = 'student:'

interface RegisterStudentPayload {
  studentId?: unknown
}

function normalizeStudentId(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()
  if (!/^[0-9]+$/.test(trimmedValue)) {
    return null
  }

  const parsedValue = Number.parseInt(trimmedValue, 10)
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function createStudentRoom(studentId: number): string {
  return `${STUDENT_ROOM_PREFIX}${studentId}`
}

export function registerStudentSocketHandlers(socket: Socket): void {
  socket.on(REGISTER_STUDENT_EVENT, (payload: RegisterStudentPayload) => {
    const studentId = normalizeStudentId(payload?.studentId)

    if (studentId === null) {
      console.warn(
        `[WebSocket] Registro rechazado para socket ${socket.id}: studentId inválido`,
      )
      return
    }

    const nextRoom = createStudentRoom(studentId)
    const currentRoom =
      typeof socket.data.studentRoom === 'string'
        ? socket.data.studentRoom
        : null

    if (currentRoom && currentRoom !== nextRoom) {
      socket.leave(currentRoom)
      console.log(
        `[WebSocket] Socket ${socket.id} salió de ${currentRoom}`,
      )
    }

    socket.join(nextRoom)
    socket.data.studentId = studentId
    socket.data.studentRoom = nextRoom

    console.log(
      `[WebSocket] Socket ${socket.id} registrado en ${nextRoom}`,
    )
  })
}

export function emitRecommendationGenerated(
  io: Server,
  event: RecommendationGeneratedEvent,
): void {
  const studentId = normalizeStudentId(event.studentId)

  if (studentId === null) {
    throw new Error('RECOMMENDATION_GENERATED requiere un studentId válido')
  }

  const room = createStudentRoom(studentId)

  io.to(room).emit(RECOMMENDATION_GENERATED_EVENT, event)

  console.log(
    `[WebSocket] Notificación enviada a ${room}`,
  )
}
