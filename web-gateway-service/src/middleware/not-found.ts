import type { RequestHandler } from 'express'

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    status: 'NOT_FOUND',
    service: 'web-gateway-service',
    message: 'Route not found',
  })
}
