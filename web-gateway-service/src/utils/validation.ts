import { GatewayValidationError } from '../errors/proxy-errors.js'

function normalizeSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export function parsePositiveInteger(
  value: string | string[] | undefined,
  fieldName: string,
): number {
  const parsedValue = Number.parseInt(normalizeSingleValue(value) ?? '', 10)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new GatewayValidationError(`${fieldName} must be a positive integer`)
  }

  return parsedValue
}
