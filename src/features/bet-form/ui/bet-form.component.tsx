import { usePlaceBet } from '@entities/auction'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ApiValidationError } from '@shared/api'
import { isApiValidationError } from '@shared/api'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Label,
} from '@shared/ui'
import { Minus, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { BetFormValues, BetPriceConstraints } from '../lib/bet-form-schema'
import { betFormSchema, nextStepPrice, prevStepPrice } from '../lib/bet-form-schema'

export interface BetFormProps {
  auctionUuid: string
  constraints: BetPriceConstraints
  available: number | null
  onSuccess: () => void
}

const PRICE_INPUT_ID = 'bet-price'

export function BetForm({ auctionUuid, constraints, available, onSuccess }: BetFormProps) {
  const schema = useMemo(() => betFormSchema(constraints), [constraints])
  const placeBet = usePlaceBet(auctionUuid)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<{ price: string }, undefined, BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { price: '' },
    mode: 'onSubmit',
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await placeBet.mutateAsync(values.price)
      onSuccess()
    } catch (error) {
      if (isApiValidationError(error)) {
        applyValidationErrors(error, setError)
        return
      }
      setError('root.serverError', { message: errorMessage(error) })
    }
  })

  const hasStep = (constraints.step ?? 0) > 0
  const currentValue = watch('price')
  const numericValue = parseNumeric(currentValue)
  const seedForEmpty = available ?? constraints.min ?? constraints.base ?? 0
  const canStepUp =
    hasStep && (numericValue == null || nextStepPrice(numericValue, constraints) > numericValue)
  const canStepDown =
    hasStep && (numericValue == null || prevStepPrice(numericValue, constraints) < numericValue)

  const applyStep = (next: number) => {
    setValue('price', String(next), { shouldValidate: true, shouldDirty: true })
  }

  const onStepUp = () => {
    const from = numericValue ?? seedForEmpty
    applyStep(nextStepPrice(from, constraints))
  }
  const onStepDown = () => {
    const from = numericValue ?? seedForEmpty
    applyStep(prevStepPrice(from, constraints))
  }

  const rootError = errors.root?.serverError?.message
  const placeholder = available != null ? String(available) : '0'

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={PRICE_INPUT_ID}>Цена ставки (с НДС, ₽)</Label>
        {hasStep ? (
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupButton
                type="button"
                size="icon-sm"
                aria-label="Уменьшить на шаг"
                disabled={!canStepDown || placeBet.isPending}
                onClick={onStepDown}
              >
                <Minus />
              </InputGroupButton>
            </InputGroupAddon>
            <InputGroupInput
              id={PRICE_INPUT_ID}
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              placeholder={placeholder}
              aria-invalid={Boolean(errors.price)}
              {...register('price')}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-sm"
                aria-label="Увеличить на шаг"
                disabled={!canStepUp || placeBet.isPending}
                onClick={onStepUp}
              >
                <Plus />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <Input
            id={PRICE_INPUT_ID}
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            placeholder={placeholder}
            aria-invalid={Boolean(errors.price)}
            {...register('price')}
          />
        )}
        {errors.price?.message && (
          <span className="text-xs text-destructive">{errors.price.message}</span>
        )}
        {available != null && !errors.price && (
          <span className="text-xs text-muted-foreground">
            Доступная цена — {available.toLocaleString('ru-RU')} ₽
            {constraints.step != null && constraints.step > 0
              ? ` · шаг ${constraints.step.toLocaleString('ru-RU')} ₽`
              : ''}
          </span>
        )}
      </div>

      {rootError && (
        <Alert variant="destructive">
          <AlertTitle>Не удалось сохранить ставку</AlertTitle>
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={placeBet.isPending}>
          {placeBet.isPending ? 'Сохранение…' : 'Сделать ставку'}
        </Button>
        <Button type="reset" variant="ghost" disabled={placeBet.isPending}>
          Очистить
        </Button>
      </div>
    </form>
  )
}

type SetError = ReturnType<typeof useForm<{ price: string }, undefined, BetFormValues>>['setError']

function applyValidationErrors(error: ApiValidationError, setError: SetError) {
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

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'
}

function parseNumeric(value: string | undefined): number | null {
  if (value == null) {
    return null
  }
  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}
