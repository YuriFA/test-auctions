import type { AuctionDetailVM } from '@entities/auction'
import {
  AuctionStatusBadge,
  AuctionTypeBadge,
  TradingStatusBadge,
  deriveAuctionCardPrimaryAction,
  formatDate,
  formatPrice,
  useAuctionDetail,
} from '@entities/auction'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  Skeleton,
} from '@shared/ui'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, CalendarClock, MapPin, Phone, Truck, Users } from 'lucide-react'
import { useMemo } from 'react'

export function AuctionDetail() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' })
  const query = useAuctionDetail(auctionUuid)

  if (query.isPending) {
    return (
      <PageContainer className="gap-4 max-w-5xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="gap-4 max-w-5xl">
        <BackLink />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Аукцион недоступен</h1>
        <Alert variant="destructive">
          <AlertTitle>Не удалось загрузить аукцион</AlertTitle>
          <AlertDescription>
            {query.error?.message || 'Произошла непредвиденная ошибка. Попробуйте ещё раз.'}
          </AlertDescription>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Повторить
          </Button>
        </Alert>
      </PageContainer>
    )
  }

  const vm = query.data
  if (!vm) {
    return (
      <PageContainer className="gap-4 max-w-5xl">
        <BackLink />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Аукцион не найден</h1>
        <Alert>
          <AlertTitle>Аукцион недоступен</AlertTitle>
          <AlertDescription>
            Возможно, ссылка устарела или аукцион был удалён.
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  return <AuctionDetailContent vm={vm} auctionUuid={auctionUuid} />
}

interface ContentProps {
  vm: AuctionDetailVM
  auctionUuid: string
}

function AuctionDetailContent({ vm, auctionUuid }: ContentProps) {
  const action = useMemo(
    () =>
      deriveAuctionCardPrimaryAction({
        auctionStatus: vm.auctionStatus,
        canSetBet: vm.canSetBet,
        hasUserBet: vm.hasUserBet,
      }),
    [vm.auctionStatus, vm.canSetBet, vm.hasUserBet],
  )

  return (
    <PageContainer className="flex flex-col gap-4 max-w-5xl">
      <BackLink />

      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {vm.cargoNum ? `Аукцион № ${vm.cargoNum}` : 'Аукцион без номера'}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <span>Заявка {vm.orderUid || '—'}</span>
            {vm.createdAt && <span>· создан {formatDate(vm.createdAt)}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <AuctionTypeBadge type={vm.aucType} label={vm.aucTypeLabel} />
          <AuctionStatusBadge status={vm.auctionStatus} label={vm.auctionStatusLabel} />
          <TradingStatusBadge status={vm.tradingStatus} label={vm.tradingStatusLabel} />
        </div>
      </header>

      <DetailActionBar action={action} auctionUuid={auctionUuid} vm={vm} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OrganizerCard vm={vm} />
        <ContactsCard vm={vm} />
        <PaymentCard vm={vm} />
        <YourBetCard vm={vm} />
      </div>

      <RoutesCard vm={vm} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CargoCard vm={vm} />
        <TradingCard vm={vm} />
      </div>
    </PageContainer>
  )
}

function BackLink() {
  return (
    <Button
      variant="link"
      size="sm"
      nativeButton={false}
      className="w-fit px-0 text-muted-foreground"
      render={<Link to="/auctions" search={{}} />}
    >
      <ArrowLeft className="size-4" aria-hidden />
      К списку аукционов
    </Button>
  )
}

interface DetailActionBarProps {
  action: ReturnType<typeof deriveAuctionCardPrimaryAction>
  auctionUuid: string
  vm: AuctionDetailVM
}

// Two distinct Link branches keep `to` a string literal — TanStack Router
// infers params typing from the literal. The disabled branch renders a plain
// Button. The bets-link is suppressed when the auction hides its history.
function DetailActionBar({ action, auctionUuid, vm }: DetailActionBarProps) {
  if (action.kind === 'disabled') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled>
          {action.label}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {action.route === 'bet' ? (
        <Button nativeButton={false} render={<Link to="/auctions/$auctionUuid/bet" params={{ auctionUuid }} />}>
          {action.label}
        </Button>
      ) : (
        <Button variant="outline" nativeButton={false} render={<Link to="/auctions/$auctionUuid/bets" params={{ auctionUuid }} />}>
          {action.label}
        </Button>
      )}
      {!vm.hideBetsHistory && (
        <Button variant="ghost" nativeButton={false} render={<Link to="/auctions/$auctionUuid/bets" params={{ auctionUuid }} />}>
          История ставок
        </Button>
      )}
    </div>
  )
}

function OrganizerCard({ vm }: { vm: AuctionDetailVM }) {
  const hasInn = Boolean(vm.organizerInn)
  const hasKpp = Boolean(vm.organizerKpp)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-muted-foreground" aria-hidden />
          Организатор
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="flex flex-col gap-2">
          <div className="font-medium">{vm.organizerName || '—'}</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
            {hasInn && (
              <div>
                <dt className="inline">ИНН </dt>
                <dd className="inline font-mono text-foreground">{vm.organizerInn}</dd>
              </div>
            )}
            {hasKpp && (
              <div>
                <dt className="inline">КПП </dt>
                <dd className="inline font-mono text-foreground">{vm.organizerKpp}</dd>
              </div>
            )}
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

function ContactsCard({ vm }: { vm: AuctionDetailVM }) {
  // hide_points_address_and_contacts also hides organizer-level contacts per
  // SDD-022 matrix. SDD-022 will own the rule centrally; detail reads the
  // flag directly today.
  if (vm.hidePointsAddressAndContacts) {
    return null
  }
  if (vm.contacts.length === 0) {
    return null
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Phone className="size-4 text-muted-foreground" aria-hidden />
          Контакты
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm">
          {vm.contacts.map((contact, idx) => (
            <li key={contact.uid || idx} className="flex flex-col gap-0.5">
              {contact.name && <div className="font-medium">{contact.name}</div>}
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                    {contact.phone}
                  </a>
                )}
                {contact.workPhone && (
                  <a href={`tel:${contact.workPhone}`} className="hover:text-foreground">
                    {contact.workPhone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                    {contact.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function RoutesCard({ vm }: { vm: AuctionDetailVM }) {
  if (vm.routes.length === 0) {
    return null
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          Маршрут
        </CardTitle>
        <CardDescription>{vm.routes.length} точек маршрута</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-4">
          {vm.routes.map((point, idx) => (
            <li key={idx} className="flex flex-col gap-1 border-l-2 border-border pl-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium">{point.opTypeLabel}</span>
                {point.cityName && (
                  <span className="text-sm text-muted-foreground">· {point.cityName}</span>
                )}
              </div>
              {!vm.hidePointsAddressAndContacts && point.loadingAddress && (
                <div className="text-xs text-muted-foreground">{point.loadingAddress}</div>
              )}
              {(point.startDate || point.endDate) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {point.startDate && (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-3" aria-hidden />
                      с {formatDate(point.startDate)}
                    </span>
                  )}
                  {point.endDate && <span>до {formatDate(point.endDate)}</span>}
                </div>
              )}
              {point.contractor && (
                <div className="text-xs text-muted-foreground">
                  {point.contractor}
                  {point.contractorInn && <span className="ml-2 font-mono">ИНН {point.contractorInn}</span>}
                </div>
              )}
              {point.cargo && (
                <div className="text-xs text-muted-foreground">
                  {point.cargo.name}
                  {point.cargo.weight && <span className="ml-2">{point.cargo.weight} т</span>}
                  {point.cargo.volume && <span className="ml-2">{point.cargo.volume} м³</span>}
                  {point.cargo.oversized && <span className="ml-2">· негабарит</span>}
                </div>
              )}
              {!vm.hidePointsAddressAndContacts && (point.contactName || point.contactPhone) && (
                <div className="text-xs text-muted-foreground">
                  {point.contactName}
                  {point.contactPhone && (
                    <a href={`tel:${point.contactPhone}`} className="ml-2 hover:text-foreground">
                      {point.contactPhone}
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

function CargoCard({ vm }: { vm: AuctionDetailVM }) {
  const car = vm.carRequirements
  const hasCar = car !== null && (Boolean(car?.type) || car?.weight != null || car?.volume != null)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="size-4 text-muted-foreground" aria-hidden />
          Груз и требования к ТС
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <DefRow label="Тип кузова" value={vm.cargoBodyType} />
          {vm.cargoDistance != null && <DefRow label="Расстояние" value={`${vm.cargoDistance} км`} />}
          {vm.cargoTruckCount != null && <DefRow label="Машин" value={String(vm.cargoTruckCount)} />}
          {vm.cargoTempFrom != null && vm.cargoTempTo != null && (
            <DefRow label="Температура" value={`${vm.cargoTempFrom}…${vm.cargoTempTo} °C`} />
          )}
        </dl>
        {hasCar && car && (
          <div className="mt-3 border-t pt-3">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Требования к ТС</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {car.type && <DefRow label="Тип" value={car.type} />}
              {car.weight != null && <DefRow label="Тоннаж" value={`${car.weight} т`} />}
              {car.volume != null && <DefRow label="Объём" value={`${car.volume} м³`} />}
              {car.length != null && <DefRow label="Длина" value={`${car.length} м`} />}
              {car.width != null && <DefRow label="Ширина" value={`${car.width} м`} />}
              {car.height != null && <DefRow label="Высота" value={`${car.height} м`} />}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function PaymentCard({ vm }: { vm: AuctionDetailVM }) {
  const hasDelay = vm.paymentDelay != null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Условия оплаты</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="grid grid-cols-1 gap-y-2">
          {vm.paymentCondition && <DefRow label="Условие" value={vm.paymentCondition} />}
          {vm.paymentForm && <DefRow label="Форма" value={vm.paymentForm} />}
          {hasDelay && (
            <DefRow
              label="Отсрочка"
              value={`${vm.paymentDelay} ${vm.paymentDelayTypeLabel}`.trim()}
            />
          )}
          {vm.paymentPrepay && <DefRow label="Предоплата" value={vm.paymentPrepay} />}
          {vm.paymentCurrencyCode && (
            <DefRow label="Валюта (ISO)" value={vm.paymentCurrencyCode} />
          )}
        </dl>
      </CardContent>
    </Card>
  )
}

function TradingCard({ vm }: { vm: AuctionDetailVM }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Параметры торгов</CardTitle>
        <CardDescription>
          {vm.bidMeasurementTypeLabel}
          {vm.startTime && ` · старт ${formatDate(vm.startTime)}`}
          {vm.stopTime && ` · стоп ${formatDate(vm.stopTime)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        {vm.noViewCargoPrice ? (
          <p className="text-muted-foreground">
            Цены скрыты организатором торгов.
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <PriceRow label="Текущая" value={vm.priceCurrent} sub={vm.priceCurrentNoVat} />
            <PriceRow label="Доступная" value={vm.priceAvailable} sub={vm.priceAvailableNoVat} />
            {vm.priceStart != null && <PriceRow label="Стартовая" value={vm.priceStart} />}
            {vm.priceMin != null && <PriceRow label="Мин." value={vm.priceMin} />}
            {vm.priceMax != null && <PriceRow label="Макс." value={vm.priceMax} />}
            {vm.priceStep != null && <PriceRow label="Шаг" value={vm.priceStep} />}
            {vm.pricePerKm != null && (
              <DefRow label="Цена за км" value={`${vm.pricePerKm} ₽/км`} />
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}

function PriceRow({
  label,
  value,
  sub,
}: {
  label: string
  value: number | null
  sub?: number | null
}) {
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

function YourBetCard({ vm }: { vm: AuctionDetailVM }) {
  // The user's own bet is rendered separately from the bets history (SDD-023)
  // — this card is the "current state" snapshot.
  if (!vm.hasUserBet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ваша ставка</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {vm.canSetBet
              ? 'Вы ещё не сделали ставку по этому аукциону.'
              : 'Ставки по этому аукциону недоступны.'}
          </p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ваша ставка</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="flex flex-col gap-2">
          {vm.userLastBet != null && (
            <DefRow label="Последняя ставка" value={formatPrice(vm.userLastBet)} />
          )}
          {vm.userLastBetWithVat != null && (
            <DefRow label="В т.ч. НДС" value={formatPrice(vm.userLastBetWithVat)} />
          )}
          {vm.userWin && (
            <div className="text-sm font-medium text-success">Вы текущий победитель</div>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
