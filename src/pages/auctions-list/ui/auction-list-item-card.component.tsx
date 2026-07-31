import type { AuctionCardPrimaryAction, AuctionListItemVM } from '@entities/auction'
import { deriveAuctionCardPrimaryAction } from '@entities/auction'
import { cn } from '@shared/lib/cn'
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

interface PillProps {
  children: string
  tone?: 'neutral' | 'accent' | 'muted'
}

function Pill({ children, tone = 'neutral' }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[0.625rem] font-medium tracking-wide uppercase',
        tone === 'neutral' && 'border-border bg-background text-foreground',
        tone === 'accent' && 'border-primary/30 bg-primary/10 text-primary',
        tone === 'muted' && 'border-transparent bg-muted text-muted-foreground',
      )}
    >
      {children}
    </span>
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
      <span className="inline-flex h-7 items-center justify-center rounded-md border border-dashed border-border px-2 text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
        {action.label}
      </span>
    )
  }

  // Two distinct Link branches keep `to` a string literal — TanStack Router
  // infers params typing from the literal, so a computed value would lose it.
  if (action.route === 'bet') {
    return (
      <Link
        to="/auctions/$auctionUuid/bet"
        params={{ auctionUuid }}
        className="inline-flex h-7 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        {action.label}
      </Link>
    )
  }

  return (
    <Link
      to="/auctions/$auctionUuid/bets"
      params={{ auctionUuid }}
      className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {action.label}
    </Link>
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
    <article
      onMouseEnter={handleIntent}
      onFocus={handleIntent}
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors',
        'hover:border-primary/40 focus-within:border-primary/40',
      )}
    >
      {/* Stretched link covers the whole card for "click anywhere -> detail". */}
      <Link
        to="/auctions/$auctionUuid"
        params={{ auctionUuid: item.auctionUuid }}
        aria-label={`Открыть аукцион ${item.cargoNum || 'без номера'}`}
        className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      />

      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold">{item.cargoNum || 'Без номера заявки'}</h3>
        <Pill tone="muted">{item.aucTypeLabel}</Pill>
        <Pill>{item.auctionStatusLabel}</Pill>
        {item.tradingStatusLabel !== '—' && <Pill tone="accent">{item.tradingStatusLabel}</Pill>}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{item.direction || 'Маршрут не задан'}</p>
        <p className="text-xs text-muted-foreground">
          Погрузка: {tryFormatDate(item.loadDate)} · Разгрузка: {tryFormatDate(item.unloadDate)}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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

        {/* z-10 lifts the CTA above the stretched link so it stays clickable. */}
        <div className="relative z-10 self-start sm:self-end">
          <PrimaryActionLink action={action} auctionUuid={item.auctionUuid} />
        </div>
      </div>
    </article>
  )
}
