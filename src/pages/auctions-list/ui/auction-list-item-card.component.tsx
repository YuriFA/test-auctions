import type { AuctionCardPrimaryAction, AuctionListItemVM } from '@entities/auction'
import { deriveAuctionCardPrimaryAction } from '@entities/auction'
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@shared/ui'
import { Link } from '@tanstack/react-router'

interface Props {
  item: AuctionListItemVM
  onIntent?: (auctionUuid: string) => void
}

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})
const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

// Parses an ISO string defensively; bad input collapses to an empty string so
// the cell renders "—" rather than the raw ISO value or "Invalid Date".
function tryFormatDate(iso: string | undefined): string {
  if (!iso) {
    return '—'
  }
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }
  return DATE_FORMATTER.format(parsed)
}

function formatPrice(value: number | null | undefined): string {
  if (value == null) {
    return '—'
  }
  return `${PRICE_FORMATTER.format(value)} ₽`
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) {
    return '—'
  }
  return PRICE_FORMATTER.format(value)
}

interface FieldProps {
  label: string
  value: string
}

function Field({ label, value }: FieldProps) {
  return (
    <div className="flex flex-col">
      <dt className="text-[0.625rem] tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-xs font-medium text-foreground">{value}</dd>
    </div>
  )
}

function PrimaryActionLink({
  action,
  auctionUuid,
}: {
  action: AuctionCardPrimaryAction
  auctionUuid: string
}) {
  if (action.kind === 'disabled') {
    return (
      <Button variant="outline" size="sm" disabled>
        {action.label}
      </Button>
    )
  }

  // Two distinct Link branches keep `to` a string literal — TanStack Router
  // infers params typing from the literal, so a computed value would lose it.
  if (action.route === 'bet') {
    return (
      <Button
        size="sm"
        nativeButton={false}
        render={<Link to="/auctions/$auctionUuid/bet" params={{ auctionUuid }} />}
      >
        {action.label}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link to="/auctions/$auctionUuid/bets" params={{ auctionUuid }} />}
    >
      {action.label}
    </Button>
  )
}

export function AuctionListItemCard({ item, onIntent }: Props) {
  const handleIntent = () => onIntent?.(item.auctionUuid)
  const action = deriveAuctionCardPrimaryAction({
    auctionStatus: item.auctionStatus,
    canSetBet: item.canSetBet,
    hasUserBet: item.hasUserBet,
  })

  return (
    <Card onMouseEnter={handleIntent} onFocus={handleIntent}>
      <CardHeader>
        <CardTitle>
          <Link
            to="/auctions/$auctionUuid"
            params={{ auctionUuid: item.auctionUuid }}
            aria-label={`Открыть аукцион ${item.cargoNum || 'без номера'}`}
          >
            {item.cargoNum || 'Без номера заявки'}
          </Link>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{item.aucTypeLabel}</Badge>
          <Badge variant="outline">{item.auctionStatusLabel}</Badge>
          {item.tradingStatusLabel !== '—' && (
            <Badge variant="default">{item.tradingStatusLabel}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {item.direction || 'Маршрут не задан'}
          </p>
          <p className="text-xs text-muted-foreground">
            Погрузка: {tryFormatDate(item.loadDate)} · Разгрузка: {tryFormatDate(item.unloadDate)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          <Field label="Груз" value={item.cargoName || '—'} />
          <Field label="Тип кузова" value={item.cargoBodyType || '—'} />
          <Field label="Вес, т" value={formatNumber(item.cargoWeight)} />
          <Field label="Объём, м³" value={formatNumber(item.cargoVolume)} />
          <Field label="Текущая цена" value={formatPrice(item.currentPrice)} />
          <Field label="Цена за км" value={formatPrice(item.pricePerKm)} />
          <Field label="№ заявки" value={item.orderUid || '—'} />
          {item.hasUserBet && (
            <Field
              label="Ваша ставка"
              value={item.userLastBet != null ? formatPrice(item.userLastBet) : '—'}
            />
          )}
        </dl>
      </CardContent>

      <CardFooter className="justify-end">
        <PrimaryActionLink action={action} auctionUuid={item.auctionUuid} />
      </CardFooter>
    </Card>
  )
}
