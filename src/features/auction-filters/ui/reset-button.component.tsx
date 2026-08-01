import { Button } from '@shared/ui'
import type { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { isDefaultFilters } from '../lib/search-params'
import type { AuctionsListFilters } from '../lib/search-params'

export interface ResetButtonProps extends React.ComponentProps<typeof Button> {
  control: Control<AuctionsListFilters>
  defaultValues: AuctionsListFilters
  onReset: () => void
}

export function ResetButton({ control, defaultValues, onReset, ...rest }: ResetButtonProps) {
  // NOTE: `useWatch` without `name` types its return as `DeepPartial`, but with
  // `defaultValue` the runtime values are always complete — cast back.
  const values = useWatch({ control, defaultValue: defaultValues }) as AuctionsListFilters
  const isDefault = isDefaultFilters(values)

  return (
    <Button type="button" variant="ghost" onClick={onReset} disabled={isDefault} {...rest}>
      Сбросить
    </Button>
  )
}
