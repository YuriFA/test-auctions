import { formatPrice, parseOptionalNumber } from '@shared/lib'
import { Button, ButtonGroup, Input, Label } from '@shared/ui'
import { Minus, Plus } from 'lucide-react'
import { useController, useFormContext } from 'react-hook-form'

import { nextStepPrice, prevStepPrice } from '../lib/bet-form-schema'
import type { BetPriceConstraints } from '../lib/bet-form-schema'

export interface PriceFieldProps {
  constraints: BetPriceConstraints
  available: number | null
  disabled?: boolean
}

export function PriceField({ constraints, available, disabled }: PriceFieldProps) {
  const { control, setValue } = useFormContext<{ price: string }>()
  const { field, fieldState } = useController({ control, name: 'price' })
  const priceInputId = 'bet-price'

  const hasStep = (constraints.step ?? 0) > 0
  const numericValue = parseOptionalNumber(field.value)
  const seedForEmpty = available ?? constraints.min ?? constraints.base ?? 0
  const canStepUp =
    hasStep && (numericValue == null || nextStepPrice(numericValue, constraints) > numericValue)
  const canStepDown =
    hasStep && (numericValue == null || prevStepPrice(numericValue, constraints) < numericValue)

  const applyStep = (next: number) => {
    setValue('price', String(next), { shouldValidate: true, shouldDirty: true })
  }

  const handleStepUp = () => {
    applyStep(nextStepPrice(numericValue ?? seedForEmpty, constraints))
  }
  const handleStepDown = () => {
    applyStep(prevStepPrice(numericValue ?? seedForEmpty, constraints))
  }

  const placeholder = available != null ? String(available) : '0'

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={priceInputId}>Цена ставки (с НДС, ₽)</Label>
      {hasStep ? (
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Уменьшить на шаг"
            disabled={!canStepDown || disabled}
            onClick={handleStepDown}
          >
            <Minus />
          </Button>
          <Input
            id={priceInputId}
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            placeholder={placeholder}
            aria-invalid={Boolean(fieldState.error)}
            className="w-28 text-center"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Увеличить на шаг"
            disabled={!canStepUp || disabled}
            onClick={handleStepUp}
          >
            <Plus />
          </Button>
        </ButtonGroup>
      ) : (
        <Input
          id={priceInputId}
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          placeholder={placeholder}
          aria-invalid={Boolean(fieldState.error)}
          className="w-32 text-center"
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        />
      )}
      {fieldState.error?.message && (
        <span className="text-xs text-destructive">{fieldState.error.message}</span>
      )}
      {available != null && !fieldState.error && (
        <span className="text-xs text-muted-foreground">
          Доступная цена — {formatPrice(available)}
          {constraints.step != null && constraints.step > 0
            ? ` · шаг ${formatPrice(constraints.step)}`
            : ''}
        </span>
      )}
    </div>
  )
}
