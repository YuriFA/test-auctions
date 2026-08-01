import { Button } from '@shared/ui'
import type { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { isDefaultFilters } from '../lib/search-params'
import type { AuctionsListFilters } from '../lib/search-params'

export interface ResetButtonProps {
  control: Control<AuctionsListFilters>
  defaultValues: AuctionsListFilters
  onReset: () => void
}

export function ResetButton({ control, defaultValues, onReset }: ResetButtonProps) {
  // `useWatch` без `name` типизирует возврат как `DeepPartial`, но с `defaultValue`
  // в runtime значения всегда полные — приводим тип обратно.
  const values = useWatch({ control, defaultValue: defaultValues }) as AuctionsListFilters
  const isDefault = isDefaultFilters(values)

  return (
    <Button type="button" variant="ghost" onClick={onReset} disabled={isDefault}>
      Сбросить
    </Button>
  )
}
