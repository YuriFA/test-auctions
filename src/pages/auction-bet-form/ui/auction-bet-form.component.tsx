import type { AuctionDetailVM } from '@entities/auction'
import { restrictionsFromVM, useAuctionDetail } from '@entities/auction'
import { BetForm, describeConstraints } from '@features/bet-form'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorAlert,
  Skeleton,
} from '@shared/ui'

export function AuctionBetForm({
  auctionUuid,
  onSuccess,
}: {
  auctionUuid: string
  onSuccess: () => void
}) {
  const detail = useAuctionDetail(auctionUuid)

  if (detail.isPending) {
    return <AuctionBetFormSkeleton />
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

  const restrictions = restrictionsFromVM(vm)

  if (!restrictions.canPlaceBet) {
    return <AuctionBetFormRestricted vm={vm} />
  }

  return <AuctionBetFormContent vm={vm} auctionUuid={auctionUuid} onSuccess={onSuccess} />
}

function AuctionBetFormContent({
  vm,
  auctionUuid,
  onSuccess,
}: {
  vm: AuctionDetailVM
  auctionUuid: string
  onSuccess: () => void
}) {
  const constraints = {
    min: vm.priceMin,
    max: vm.priceMax,
    step: vm.priceStep,
    base: vm.priceStart,
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Аукцион {vm.cargoNum ? `№ ${vm.cargoNum}` : `заявка ${vm.orderUid}`}
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Цена</CardTitle>
          <CardDescription>{describeConstraints(constraints)}</CardDescription>
        </CardHeader>
        <CardContent>
          <BetForm
            auctionUuid={auctionUuid}
            constraints={constraints}
            available={vm.priceAvailable}
            onSuccess={onSuccess}
          />
        </CardContent>
      </Card>
    </>
  )
}

function AuctionBetFormRestricted({ vm }: { vm: AuctionDetailVM }) {
  return (
    <>
      <Alert>
        <AlertTitle>Нельзя сделать ставку</AlertTitle>
        <AlertDescription>
          Приём ставок по этому аукциону закрыт — например, торги завершены или ещё не начались.
        </AlertDescription>
      </Alert>
      <p className="text-sm text-muted-foreground">
        Аукцион {vm.cargoNum ? `№ ${vm.cargoNum}` : `заявка ${vm.orderUid}`}
      </p>
    </>
  )
}

function AuctionBetFormSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-40" />
    </>
  )
}
