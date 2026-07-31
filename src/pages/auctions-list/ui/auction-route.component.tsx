import { ArrowRight, MapPin } from 'lucide-react'

interface Props {
  loadCity: string
  unloadCity: string
  direction?: string
}

export function AuctionRoute({ loadCity, unloadCity, direction }: Props) {
  const hasCities = Boolean(loadCity) || Boolean(unloadCity)
  const label = direction?.trim() || (hasCities ? `${loadCity} → ${unloadCity}`.trim() : '')

  if (!label) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MapPin className="size-4" aria-hidden />
        Маршрут не задан
      </p>
    )
  }

  if (loadCity && unloadCity) {
    return (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-foreground sm:text-lg">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          <span>{loadCity}</span>
        </span>
        <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
        <span>{unloadCity}</span>
      </p>
    )
  }

  return (
    <p className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
      <MapPin className="size-4 text-muted-foreground" aria-hidden />
      <span>{label}</span>
    </p>
  )
}
