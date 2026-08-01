import { ApiValidationError } from '@shared/api'
import { describe, expect, it, vi } from 'vitest'

import { applyValidationErrors, errorMessage } from './api-errors'

function makeValidationError(errors: Array<{ field: string; message: string }>) {
  return new ApiValidationError({
    code: 'VALIDATION_ERROR',
    title: 'Validation failed',
    message: 'Validation failed',
    errors,
  })
}

describe('errorMessage', () => {
  it('returns the error message when error is an Error instance', () => {
    const result = errorMessage(new Error('Сервер недоступен'))
    expect(result).toBe('Сервер недоступен')
  })

  it('returns a Russian fallback for non-Error values', () => {
    const result = errorMessage('something')
    expect(result).toContain('Попробуйте ещё раз')
  })

  it('returns a Russian fallback for null', () => {
    const result = errorMessage(null)
    expect(result).toContain('Попробуйте ещё раз')
  })
})

describe('applyValidationErrors', () => {
  it('maps price field error to price form field', () => {
    const setError = vi.fn()
    const error = makeValidationError([{ field: 'price', message: 'Цена обязательна' }])
    applyValidationErrors(error, setError as never)
    expect(setError).toHaveBeenCalledWith('price', { message: 'Цена обязательна' })
  })

  it('maps unknown field errors to root.serverError', () => {
    const setError = vi.fn()
    const error = makeValidationError([{ field: 'auction_uuid', message: 'Not found' }])
    applyValidationErrors(error, setError as never)
    expect(setError).toHaveBeenCalledWith('root.serverError', {
      message: 'auction_uuid: Not found',
    })
  })

  it('takes the first price error when multiple price errors arrive', () => {
    const setError = vi.fn()
    const error = makeValidationError([
      { field: 'price', message: 'Первая ошибка' },
      { field: 'price', message: 'Вторая ошибка' },
    ])
    applyValidationErrors(error, setError as never)
    const priceCalls = (setError as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => args[0] === 'price',
    )
    expect(priceCalls).toHaveLength(1)
    expect(priceCalls[0][1].message).toBe('Первая ошибка')
  })
})
