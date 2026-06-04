import axios, { isAxiosError, type AxiosError, type Method } from 'axios'
import type { ForwardRequest, ForwardResponse } from '../types/http.js'
import { sanitizeForwardHeaders } from '../utils/http.js'
import { UpstreamServiceTimeoutError, UpstreamServiceUnavailableError } from '../errors/proxy-errors.js'

export interface AcademicServiceClient {
  forward<T = unknown>(request: ForwardRequest): Promise<ForwardResponse<T>>
}

interface AcademicServiceClientOptions {
  baseUrl: string
  timeoutMs: number
}

function normalizeHeaders(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== 'object') {
    return {}
  }

  return Object.entries(headers as Record<string, unknown>).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      if (typeof value === 'string') {
        accumulator[key] = value
        return accumulator
      }

      if (Array.isArray(value)) {
        accumulator[key] = value.join(', ')
      }

      return accumulator
    },
    {},
  )
}

function mapAxiosError(error: unknown): Error {
  if (!isAxiosError(error)) {
    return new UpstreamServiceUnavailableError()
  }

  const axiosError = error as AxiosError
  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    return new UpstreamServiceTimeoutError(axiosError.message)
  }

  return new UpstreamServiceUnavailableError(axiosError.message)
}

export function createAcademicServiceClient(options: AcademicServiceClientOptions): AcademicServiceClient {
  const httpClient = axios.create({
    baseURL: options.baseUrl,
    timeout: options.timeoutMs,
    validateStatus: () => true,
  })

  return {
    async forward<T>(request: ForwardRequest): Promise<ForwardResponse<T>> {
      try {
        const response = await httpClient.request<T>({
          method: request.method as Method,
          url: request.path,
          params: request.query,
          data: request.body,
          headers: sanitizeForwardHeaders(request.headers ?? {}),
          validateStatus: () => true,
        })

        return {
          status: response.status,
          data: response.data,
          headers: normalizeHeaders(response.headers),
        }
      } catch (error) {
        throw mapAxiosError(error)
      }
    },
  }
}
