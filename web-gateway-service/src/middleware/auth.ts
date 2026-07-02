import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

const OFFICIAL_ROLES = new Set(['STUDENT', 'PROFESSOR', 'ADMIN'] as const)

export type GatewayRole = 'STUDENT' | 'PROFESSOR' | 'ADMIN'

export interface AuthenticatedUser {
  subject?: string
  roles: GatewayRole[]
  claims: JWTPayload
}

export interface TokenVerifier {
  verify(token: string): Promise<AuthenticatedUser>
}

interface AuthenticatedRequest extends Request {
  auth?: AuthenticatedUser
}

interface KeycloakJwtVerifierOptions {
  issuerUri: string
  jwkSetUri: string
}

function unauthorized(response: Response): void {
  response.status(401).json({
    status: 'UNAUTHORIZED',
    service: 'web-gateway-service',
    message: 'Valid Bearer token is required',
  })
}

function forbidden(response: Response): void {
  response.status(403).json({
    status: 'FORBIDDEN',
    service: 'web-gateway-service',
    message: 'Insufficient role for this endpoint',
  })
}

function extractRealmRoles(payload: JWTPayload): GatewayRole[] {
  const realmAccess = payload.realm_access
  if (!realmAccess || typeof realmAccess !== 'object' || !('roles' in realmAccess)) {
    return []
  }

  const roles = (realmAccess as { roles?: unknown }).roles
  if (!Array.isArray(roles)) {
    return []
  }

  return Array.from(
    new Set(
      roles
        .filter((role): role is string => typeof role === 'string')
        .map((role) => role.toUpperCase())
        .filter((role): role is GatewayRole => OFFICIAL_ROLES.has(role as GatewayRole)),
    ),
  )
}

export function createKeycloakJwtVerifier(options: KeycloakJwtVerifierOptions): TokenVerifier {
  const jwks = createRemoteJWKSet(new URL(options.jwkSetUri))

  return {
    async verify(token: string): Promise<AuthenticatedUser> {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: options.issuerUri,
      })

      return {
        subject: payload.sub,
        roles: extractRealmRoles(payload),
        claims: payload,
      }
    },
  }
}

export function authenticateBearerToken(tokenVerifier: TokenVerifier): RequestHandler {
  return async (request: Request, response: Response, next: NextFunction) => {
    const authorization = request.header('authorization')
    const match = authorization?.match(/^Bearer\s+(.+)$/i)

    if (!match) {
      unauthorized(response)
      return
    }

    try {
      ;(request as AuthenticatedRequest).auth = await tokenVerifier.verify(match[1].trim())
      next()
    } catch {
      unauthorized(response)
    }
  }
}

export function requireAnyRole(...allowedRoles: GatewayRole[]): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    const roles = (request as AuthenticatedRequest).auth?.roles ?? []
    if (roles.includes('ADMIN') || allowedRoles.some((role) => roles.includes(role))) {
      next()
      return
    }

    forbidden(response)
  }
}
