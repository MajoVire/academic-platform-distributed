import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { UpstreamServiceTimeoutError } from '../src/errors/proxy-errors.js'
import type { AcademicServiceClient } from '../src/clients/academic-service.client.js'

function createTestApp(academicServiceClient: AcademicServiceClient) {
  return createApp({
    config: {
      port: 3000,
      academicServiceUrl: 'http://academic-service:8080',
      corsOrigin: 'http://localhost:5173',
      requestTimeoutMs: 5000,
      nodeEnv: 'test',
    },
    academicServiceClient,
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

    const response = await request(app).get('/api/subjects/abc/courses').expect(400)

    expect(response.body.message).toContain('subjectId')
    expect(academicServiceClient.forward).not.toHaveBeenCalled()
  })

  it('maps upstream timeouts to 504 responses', async () => {
    const academicServiceClient: AcademicServiceClient = {
      forward: vi.fn().mockRejectedValue(new UpstreamServiceTimeoutError('academic-service request timed out')),
    }

    const app = createTestApp(academicServiceClient)

    const response = await request(app).get('/api/subjects').expect(504)

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
      .send({})
      .expect(200)

    expect(academicServiceClient.forward).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/api/students/1/resources/2/complete',
      }),
    )
  })
})
