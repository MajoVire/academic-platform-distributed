import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { createAcademicServiceClient } from './clients/academic-service.client.js'
import { loadGatewayConfig, type GatewayConfig } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFoundHandler } from './middleware/not-found.js'
import { createGatewayRouter } from './routes/gateway.routes.js'
import type { AcademicServiceClient } from './clients/academic-service.client.js'

export interface CreateAppDependencies {
  config?: GatewayConfig
  academicServiceClient?: AcademicServiceClient
}

export function createApp(dependencies: CreateAppDependencies = {}) {
  const config = dependencies.config ?? loadGatewayConfig()
  const academicServiceClient =
    dependencies.academicServiceClient ??
    createAcademicServiceClient({
      baseUrl: config.academicServiceUrl,
      timeoutMs: config.requestTimeoutMs,
    })

  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'))

  app.use('/api', createGatewayRouter({ academicServiceClient }))
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
