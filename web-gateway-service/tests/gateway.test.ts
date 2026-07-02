import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { UpstreamServiceTimeoutError } from '../src/errors/proxy-errors.js'
import type { AcademicServiceClient } from '../src/clients/academic-service.client.js'
import type { GatewayRole, TokenVerifier } from '../src/middleware/auth.js'

function createTokenVerifier(roles: GatewayRole[] = ['STUDENT']): TokenVerifier {
  return {
    verify: vi.fn().mockResolvedValue({
      subject: 'user-1',
      roles,
      claims: {
        sub: 'user-1',
        realm_access: {
          roles,
        },
      },
    }),
  }
}

function createTestApp(academicServiceClient: AcademicServiceClient, tokenVerifier: TokenVerifier = createTokenVerifier()) {
  return createApp({
    config: {
      port: 3000,
      academicServiceUrl: 'http://academic-service:8080',
      keycloakIssuerUri: 'http://localhost:8180/realms/academic-platform',
      keycloakJwkSetUri: 'http://keycloak:8080/realms/academic-platform/protocol/openid-connect/certs',
      corsOrigin: 'http://localhost:5173',
      requestTimeoutMs: 5000,
      nodeEnv: 'test',
    },
    academicServiceClient,
    tokenVerifier,
  })
}

describe('web-gateway-service', () => {
  it('exposes a local health endpoint for Kubernetes probes', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn(),
    }

    const app = createTestApp(academicServiceClient)

    const response = await request(app).get('/health').expect(200)

    expect(response.body).toEqual({
      status: 'UP',
      service: 'web-gateway-service',
    })
    expect(academicServiceClient.forward).not.toHaveBeenCalled()
  })

  it('forwards the health endpoint through academic-service', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn().mockResolvedValue({
        status: 200,
        data: {
          status: 'UP',
          service: 'academic-service',
        },
        headers: {},
      }),
    }

    const app = createTestApp(academicServiceClient)

    const response = await request(app).get('/api/health').expect(200)

    expect(response.body).toEqual({
      status: 'UP',
      service: 'web-gateway-service',
      upstream: {
        status: 'UP',
        service: 'academic-service',
      },
    })
    expect(academicServiceClient.forward).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/api/health',
      }),
    )
  })

  it('rejects invalid route parameters before forwarding', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn(),
    }

    const app = createTestApp(academicServiceClient)

    const response = await request(app)
      .get('/api/subjects/abc/courses')
      .set('Authorization', 'Bearer valid-token')
      .expect(400)

    expect(response.body.message).toContain('subjectId')
    expect(academicServiceClient.forward).not.toHaveBeenCalled()
  })

  it('maps upstream timeouts to 504 responses', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn().mockRejectedValue(new UpstreamServiceTimeoutError('academic-service request timed out')),
    }

    const app = createTestApp(academicServiceClient)

    const response = await request(app)
      .get('/api/subjects')
      .set('Authorization', 'Bearer valid-token')
      .expect(504)

    expect(response.body.message).toContain('timed out')
  })

  it('forwards completion requests to academic-service', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn().mockResolvedValue({
        status: 200,
        data: {
          status: 'OK',
          service: 'academic-service',
        },
        headers: {},
      }),
    }

    const app = createTestApp(academicServiceClient)

    await request(app)
      .post('/api/students/1/resources/2/complete')
      .set('Authorization', 'Bearer valid-token')
      .send({})
      .expect(200)

    expect(academicServiceClient.forward).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/api/students/1/resources/2/complete',
      }),
    )
  })

  it('rejects protected endpoints without a bearer token', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn(),
    }
    const tokenVerifier = createTokenVerifier()

    const app = createTestApp(academicServiceClient, tokenVerifier)

    await request(app).get('/api/subjects').expect(401)

    expect(tokenVerifier.verify).not.toHaveBeenCalled()
    expect(academicServiceClient.forward).not.toHaveBeenCalled()
  })

  it('rejects protected endpoints when the token is invalid', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn(),
    }
    const tokenVerifier: TokenVerifier = {
      verify: vi.fn().mockRejectedValue(new Error('invalid token')),
    }

    const app = createTestApp(academicServiceClient, tokenVerifier)

    await request(app)
      .get('/api/subjects')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)

    expect(tokenVerifier.verify).toHaveBeenCalledWith('invalid-token')
    expect(academicServiceClient.forward).not.toHaveBeenCalled()
  })

  it('forwards Authorization to academic-service after validating a token', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn().mockResolvedValue({
        status: 200,
        data: [],
        headers: {},
      }),
    }
    const app = createTestApp(academicServiceClient)

    await request(app)
      .get('/api/subjects')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)

    expect(academicServiceClient.forward).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer valid-token',
        }),
      }),
    )
  })

  it('rejects valid tokens with insufficient roles', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn(),
    }
    const app = createTestApp(academicServiceClient, createTokenVerifier(['PROFESSOR']))

    await request(app)
      .get('/api/students/1/recommendations')
      .set('Authorization', 'Bearer professor-token')
      .expect(403)

    expect(academicServiceClient.forward).not.toHaveBeenCalled()
  })
})
