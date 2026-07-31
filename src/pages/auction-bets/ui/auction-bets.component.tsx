import type { AuctionBetsVM, AuctionBetVM } from '@entities/auction'
import { formatDate, formatPrice, useAuctionBets, useAuctionDetail } from '@entities/auction'
import { cn } from '@shared/lib/cn'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  PageContainer,
  Skeleton,
} from '@shared/ui'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Crown } from 'lucide-react'

export function AuctionBets() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' })
  const detail = useAuctionDetail(auctionUuid)
  const betsQuery = useAuctionBets(auctionUuid, {
    enabled: !detail.data?.hideBetsHistory,
  })

  if (detail.isPending) {
    return <AuctionBetsSkeleton />
  }

  if (detail.isError) {
    return (
      <AuctionBetsError
        title="Аукцион недоступен"
        message={detail.error?.message ?? 'Не удалось загрузить аукцион.'}
        onRetry={() => detail.refetch()}
      />
    )
  }

  const vm = detail.data
  if (!vm) {
    return (
      <AuctionBetsError
        title="Аукцион не найден"
        message="Возможно, ссылка устарела или аукцион был удалён."
      />
    )
  }

  if (vm.hideBetsHistory) {
    return <AuctionBetsRestricted />
  }

  if (betsQuery.isPending) {
    return <AuctionBetsSkeleton />
  }

  if (betsQuery.isError) {
    return (
      <AuctionBetsError
        title="История недоступна"
        message={betsQuery.error?.message ?? 'Не удалось загрузить ставки.'}
        onRetry={() => betsQuery.refetch()}
      />
    )
  }

  const betsVM = betsQuery.data
  if (!betsVM || betsVM.bets.length === 0) {
    return <AuctionBetsEmpty />
  }

  return <AuctionBetsContent vm={betsVM} />
}

function AuctionBetsContent({ vm }: { vm: AuctionBetsVM }) {
  return (
    <PageContainer className="flex max-w-5xl flex-col gap-4">
      <BackLink />
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">История ставок</h1>
        <p className="text-sm text-muted-foreground">
          Участников: <span className="font-medium text-foreground">{vm.participantCount}</span> ·
          ставок: <span className="font-medium text-foreground">{vm.bets.length}</span>
        </p>
      </header>
      <ol className="flex flex-col gap-2">
        {vm.bets.map((bet) => (
          <BetRow key={bet.id} bet={bet} />
        ))}
      </ol>
    </PageContainer>
  )
}

function BetRow({ bet }: { bet: AuctionBetVM }) {
  return (
    <li
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-card p-3 ring-1 sm:gap-4 sm:p-4',
        bet.isWin ? 'bg-success/5 ring-success/40' : 'ring-foreground/10',
      )}
    >
      <div className="flex min-w-10 flex-col items-center gap-1">
        <span className="text-lg leading-none font-semibold text-foreground sm:text-xl">
          {bet.place != null ? bet.place : '—'}
        </span>
        {bet.isWin && <Crown className="size-4 text-success" aria-hidden />}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium text-foreground">
          {bet.organizationName || 'Перевозчик не указан'}
        </span>
        {bet.createdAt && (
          <span className="text-xs text-muted-foreground">{formatDate(bet.createdAt)}</span>
        )}
        {bet.isRejected && bet.cancelReason && (
          <span className="text-xs text-destructive">Причина: {bet.cancelReason}</span>
        )}
      </div>

      <div className="flex flex-col items-end gap-0.5 text-right">
        <div className="flex items-center gap-1.5">
          {bet.isRejected && (
            <Badge variant="destructive" className="shrink-0">
              Отменена
            </Badge>
          )}
          <span className="text-lg font-semibold text-foreground tabular-nums sm:text-xl">
            {formatPrice(bet.priceWithVat)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          без НДС {formatPrice(bet.priceNoVat)}
        </span>
      </div>
    </li>
  )
}

function AuctionBetsRestricted() {
  return (
    <PageContainer className="flex max-w-5xl flex-col gap-4">
      <BackLink />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">История ставок</h1>
      <Alert>
        <AlertTitle>История скрыта</AlertTitle>
        <AlertDescription>Организатор скрыл историю ставок по этому аукциону.</AlertDescription>
      </Alert>
    </PageContainer>
  )
}

function AuctionBetsEmpty() {
  return (
    <PageContainer className="flex max-w-5xl flex-col gap-4">
      <BackLink />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">История ставок</h1>
      <Alert>
        <AlertTitle>Ставок пока нет</AlertTitle>
        <AlertDescription>По этому аукциону ещё никто не делал ставок.</AlertDescription>
      </Alert>
    </PageContainer>
  )
}

function AuctionBetsSkeleton() {
  return (
    <PageContainer className="flex max-w-5xl flex-col gap-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-16" />
        ))}
      </div>
    </PageContainer>
  )
}

interface ErrorProps {
  title: string
  message: string
  onRetry?: () => void
}

function AuctionBetsError({ title, message, onRetry }: ErrorProps) {
  return (
    <PageContainer className="flex max-w-5xl flex-col gap-4">
      <BackLink />
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Повторить
          </Button>
        )}
      </Alert>
    </PageContainer>
  )
}

function BackLink() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' })
  return (
    <Button
      variant="link"
      size="sm"
      nativeButton={false}
      className="w-fit px-0 text-muted-foreground"
      render={<Link to="/auctions/$auctionUuid" params={{ auctionUuid }} />}
    >
      <ArrowLeft className="size-4" aria-hidden />
      К аукциону
    </Button>
  )
}
