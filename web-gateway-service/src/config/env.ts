import 'dotenv/config'

export type CorsOrigin = string | string[] | boolean

export interface GatewayConfig {
  port: number
  academicServiceUrl: string
  keycloakIssuerUri: string
  keycloakJwkSetUri: string
  corsOrigin: CorsOrigin
  requestTimeoutMs: number
  nodeEnv: string
}

function parsePositiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value.trim() === '') {
    return fallback
  }

  const parsedValue = Number.parseInt(value, 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }

  return parsedValue
}

function parseCorsOrigin(value: string | undefined): CorsOrigin {
  const rawValue = value?.trim() || 'http://localhost:5173'

  if (rawValue === '*') {
    return true
  }

  const origins = rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)

  if (origins.length === 0) {
    return 'http://localhost:5173'
  }

  return origins.length === 1 ? origins[0] : origins
}

function parseUrl(value: string | undefined, fallback: string, name: string): string {
  const candidate = value?.trim() || fallback

  try {
    const parsedUrl = new URL(candidate)
    return parsedUrl.toString().replace(/\/+$/, '')
  } catch {
    throw new Error(`${name} must be a valid URL`)
  }
}

export function loadGatewayConfig(): GatewayConfig {
  const keycloakIssuerUri = parseUrl(
    process.env.KEYCLOAK_ISSUER_URI,
    'http://localhost:8180/realms/academic-platform',
    'KEYCLOAK_ISSUER_URI',
  )

  return {
    port: parsePositiveInteger(process.env.WEB_GATEWAY_PORT, 3000, 'WEB_GATEWAY_PORT'),
    academicServiceUrl: parseUrl(
      process.env.ACADEMIC_SERVICE_URL,
      'http://academic-service:8080',
      'ACADEMIC_SERVICE_URL',
    ),
    keycloakIssuerUri,
    keycloakJwkSetUri: parseUrl(
      process.env.KEYCLOAK_JWK_SET_URI,
      `${keycloakIssuerUri}/protocol/openid-connect/certs`,
      'KEYCLOAK_JWK_SET_URI',
    ),
    corsOrigin: parseCorsOrigin(process.env.GATEWAY_CORS_ORIGIN),
    requestTimeoutMs: parsePositiveInteger(process.env.REQUEST_TIMEOUT_MS, 5000, 'REQUEST_TIMEOUT_MS'),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  }
}
