import type { ErrorRequestHandler } from 'express'
import {
  GatewayValidationError,
  UpstreamServiceTimeoutError,
  UpstreamServiceUnavailableError,
} from '../errors/proxy-errors.js'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next

  if (error instanceof GatewayValidationError) {
    response.status(400).json({
      status: 'BAD_REQUEST',
      service: 'web-gateway-service',
      message: error.message,
    })
    return
  }

  if (error instanceof UpstreamServiceTimeoutError) {
    response.status(504).json({
      status: 'GATEWAY_TIMEOUT',
      service: 'web-gateway-service',
      message: error.message,
    })
    return
  }

  if (error instanceof UpstreamServiceUnavailableError) {
    response.status(502).json({
      status: 'BAD_GATEWAY',
      service: 'web-gateway-service',
      message: error.message,
    })
    return
  }

  console.error('[web-gateway-service] Unexpected error', error)
  response.status(500).json({
    status: 'INTERNAL_SERVER_ERROR',
    service: 'web-gateway-service',
    message: 'Unexpected error',
  })
}
