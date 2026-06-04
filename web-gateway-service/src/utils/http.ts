import type { IncomingHttpHeaders } from 'node:http'
import type { Response } from 'express'
import type { ForwardResponse } from '../types/http.js'

const FORWARDED_REQUEST_HEADERS = new Set([
  'accept',
  'accept-language',
  'authorization',
  'content-type',
  'origin',
  'referer',
  'user-agent',
  'x-correlation-id',
  'x-request-id',
])

const FORWARDED_RESPONSE_HEADERS = new Set([
  'cache-control',
  'content-language',
  'content-type',
  'etag',
  'last-modified',
  'location',
  'x-correlation-id',
  'x-request-id',
])

export function sanitizeForwardHeaders(headers: IncomingHttpHeaders): Record<string, string> {
  return Object.entries(headers).reduce<Record<string, string>>((accumulator, [key, value]) => {
    const normalizedKey = key.toLowerCase()
    const normalizedValue = Array.isArray(value) ? value.join(', ') : value

    if (FORWARDED_REQUEST_HEADERS.has(normalizedKey) && typeof normalizedValue === 'string' && normalizedValue.length > 0) {
      accumulator[normalizedKey] = normalizedValue
    }

    return accumulator
  }, {})
}

export function setForwardedResponseHeaders(response: Response, headers: Record<string, string>): void {
  Object.entries(headers).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase()
    if (FORWARDED_RESPONSE_HEADERS.has(normalizedKey)) {
      response.setHeader(normalizedKey, value)
    }
  })
}

export function sendUpstreamResponse<T>(response: Response, upstreamResponse: ForwardResponse<T>): void {
  setForwardedResponseHeaders(response, upstreamResponse.headers)
  response.status(upstreamResponse.status).send(upstreamResponse.data)
}
