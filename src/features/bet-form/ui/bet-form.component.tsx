import { usePlaceBet } from '@entities/auction'
import { zodResolver } from '@hookform/resolvers/zod'
import { isApiValidationError } from '@shared/api'
import { formatPrice, parseOptionalNumber } from '@shared/lib'
import { Alert, AlertDescription, AlertTitle, Button, ButtonGroup, Input, Label } from '@shared/ui'
import { Minus, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { applyValidationErrors, errorMessage } from '../lib/api-errors'
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
  const numericValue = parseOptionalNumber(currentValue)
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
          <ButtonGroup>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Уменьшить на шаг"
              disabled={!canStepDown || placeBet.isPending}
              onClick={onStepDown}
            >
              <Minus />
            </Button>
            <Input
              id={PRICE_INPUT_ID}
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              placeholder={placeholder}
              aria-invalid={Boolean(errors.price)}
              className="w-28 text-center"
              {...register('price')}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Увеличить на шаг"
              disabled={!canStepUp || placeBet.isPending}
              onClick={onStepUp}
            >
              <Plus />
            </Button>
          </ButtonGroup>
        ) : (
          <Input
            id={PRICE_INPUT_ID}
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            placeholder={placeholder}
            aria-invalid={Boolean(errors.price)}
            className="w-32 text-center"
            {...register('price')}
          />
        )}
        {errors.price?.message && (
          <span className="text-xs text-destructive">{errors.price.message}</span>
        )}
        {available != null && !errors.price && (
          <span className="text-xs text-muted-foreground">
            Доступная цена — {formatPrice(available)}
            {constraints.step != null && constraints.step > 0
              ? ` · шаг ${formatPrice(constraints.step)}`
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

export type { SetError }
