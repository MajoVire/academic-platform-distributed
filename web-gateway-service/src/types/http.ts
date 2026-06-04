import type { IncomingHttpHeaders } from 'node:http'

export interface ForwardRequest {
  method: string
  path: string
  query?: unknown
  body?: unknown
  headers?: IncomingHttpHeaders
}

export interface ForwardResponse<T = unknown> {
  status: number
  data: T
  headers: Record<string, string>
}
