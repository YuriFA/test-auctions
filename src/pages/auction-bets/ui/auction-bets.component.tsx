import type { AuctionBetVM, AuctionBetsVM } from '@entities/auction'
import { useAuctionBets, useAuctionDetail } from '@entities/auction'
import { cn } from '@shared/lib/cn'
import { formatPrice } from '@shared/lib/currency'
import { formatDate } from '@shared/lib/date'
import { Alert, AlertDescription, AlertTitle, Badge, ErrorAlert, Skeleton } from '@shared/ui'
import { Crown } from 'lucide-react'

export function AuctionBets({ auctionUuid }: { auctionUuid: string }) {
  const detail = useAuctionDetail(auctionUuid)
  const betsQuery = useAuctionBets(auctionUuid, {
    enabled: !detail.data?.hideBetsHistory,
  })

  if (detail.isPending) {
    return <BetsListSkeleton rows={4} />
  }

  if (detail.isError) {
    return (
      <ErrorAlert
        title="Аукцион недоступен"
        description={detail.error?.message ?? 'Не удалось загрузить аукцион.'}
        onRetry={() => detail.refetch()}
      />
    )
  }

  const vm = detail.data
  if (!vm) {
    return (
      <Alert>
        <AlertTitle>Аукцион не найден</AlertTitle>
        <AlertDescription>Возможно, ссылка устарела или аукцион был удалён.</AlertDescription>
      </Alert>
    )
  }

  if (vm.hideBetsHistory) {
    return (
      <Alert>
        <AlertTitle>История скрыта</AlertTitle>
        <AlertDescription>Организатор скрыл историю ставок по этому аукциону.</AlertDescription>
      </Alert>
    )
  }

  if (betsQuery.isPending) {
    return <BetsListSkeleton rows={4} />
  }

  if (betsQuery.isError) {
    return (
      <ErrorAlert
        title="История недоступна"
        description={betsQuery.error?.message ?? 'Не удалось загрузить ставки.'}
        onRetry={() => betsQuery.refetch()}
      />
    )
  }

  const betsVM = betsQuery.data
  if (!betsVM || betsVM.bets.length === 0) {
    return (
      <Alert>
        <AlertTitle>Ставок пока нет</AlertTitle>
        <AlertDescription>По этому аукциону ещё никто не делал ставок.</AlertDescription>
      </Alert>
    )
  }

  return <BetsContent vm={betsVM} />
}

function BetsContent({ vm }: { vm: AuctionBetsVM }) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Участников: <span className="font-medium text-foreground">{vm.participantCount}</span> ·
        ставок: <span className="font-medium text-foreground">{vm.bets.length}</span>
      </p>
      <ol className="flex flex-col gap-2">
        {vm.bets.map((bet) => (
          <BetRow key={bet.id} bet={bet} />
        ))}
      </ol>
    </>
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

function BetsListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="h-16" />
      ))}
    </div>
  )
}
