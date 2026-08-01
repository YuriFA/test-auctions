import { formatPrice } from '@shared/lib'

export interface PriceRowProps {
  label: string
  value: number | null
  sub?: number | null
}

export function PriceRow({ label, value, sub }: PriceRowProps) {
  if (value == null) {
    return null
  }
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{formatPrice(value)}</dd>
      {sub != null && <dd className="text-xs text-muted-foreground">без НДС {formatPrice(sub)}</dd>}
    </div>
  )
}
