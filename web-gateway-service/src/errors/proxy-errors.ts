export class GatewayValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GatewayValidationError'
  }
}

export class UpstreamServiceUnavailableError extends Error {
  constructor(message = 'academic-service is unavailable') {
    super(message)
    this.name = 'UpstreamServiceUnavailableError'
  }
}

export class UpstreamServiceTimeoutError extends Error {
  constructor(message = 'academic-service request timed out') {
    super(message)
    this.name = 'UpstreamServiceTimeoutError'
  }
}
