import type { ApiValidationError } from '@shared/api'
import type { UseFormSetError } from 'react-hook-form'

export function applyValidationErrors(
  error: ApiValidationError,
  setError: UseFormSetError<{ price: string }>,
) {
  let priceError: string | null = null
  for (const item of error.validation.errors) {
    if (item.field === 'price') {
      priceError ??= item.message
    } else {
      setError('root.serverError', { message: `${item.field}: ${item.message}` })
    }
  }
  if (priceError) {
    setError('price', { message: priceError })
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'
}
