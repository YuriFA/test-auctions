import { formatVolume, formatWeight } from '@entities/auction'
import { Box, Package, Scale, Truck } from 'lucide-react'

interface Props {
  name: string
  weight: number | null
  volume: number | null
  bodyType: string
}

export function AuctionCargo({ name, weight, volume, bodyType }: Props) {
  const hasAny = Boolean(name) || weight != null || volume != null || Boolean(bodyType)
  if (!hasAny) {
    return null
  }

  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {name && (
        <div className="flex w-full shrink-0 items-center gap-1.5">
          <Package className="size-3.5" aria-hidden />
          <dt className="sr-only">Груз</dt>
          <dd>{name}</dd>
        </div>
      )}
      {weight != null && (
        <div className="flex items-center gap-1.5">
          <Scale className="size-3.5" aria-hidden />
          <dt className="sr-only">Вес</dt>
          <dd>{formatWeight(weight)}</dd>
        </div>
      )}
      {volume != null && (
        <div className="flex items-center gap-1.5">
          <Box className="size-3.5" aria-hidden />
          <dt className="sr-only">Объём</dt>
          <dd>{formatVolume(volume)}</dd>
        </div>
      )}
      {bodyType && (
        <div className="flex items-center gap-1.5">
          <Truck className="size-3.5" aria-hidden />
          <dt className="sr-only">Тип кузова</dt>
          <dd>{bodyType}</dd>
        </div>
      )}
    </dl>
  )
}
