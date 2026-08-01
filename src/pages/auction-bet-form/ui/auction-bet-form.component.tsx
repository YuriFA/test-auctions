import type { AuctionDetailVM } from '@entities/auction'
import { deriveAuctionRestrictions, useAuctionDetail } from '@entities/auction'
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
import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export function AuctionBetForm({ auctionRef }: { auctionRef: string }) {
  const detail = useAuctionDetail(auctionRef)
  const navigate = useNavigate()

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

  const restrictions = deriveAuctionRestrictions({
    canSetBet: vm.canSetBet,
    hideBetsHistory: vm.hideBetsHistory,
    hidePointsAddressAndContacts: vm.hidePointsAddressAndContacts,
    noViewCargoPrice: vm.noViewCargoPrice,
  })

  if (!restrictions.canPlaceBet) {
    return <AuctionBetFormRestricted vm={vm} />
  }

  return (
    <AuctionBetFormContent
      vm={vm}
      auctionRef={auctionRef}
      onSuccess={() =>
        navigate({
          to: '/auctions/$auctionRef/bets',
          params: { auctionRef },
        })
      }
    />
  )
}

function AuctionBetFormContent({
  vm,
  auctionRef,
  onSuccess,
}: {
  vm: AuctionDetailVM
  auctionRef: string
  onSuccess: () => void
}) {
  const constraints = useMemo(
    () => ({
      min: vm.priceMin,
      max: vm.priceMax,
      step: vm.priceStep,
      base: vm.priceStart,
    }),
    [vm.priceMin, vm.priceMax, vm.priceStep, vm.priceStart],
  )

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Аукцион {vm.cargoNum ? `№ ${vm.cargoNum}` : `заявка ${vm.orderUid}`}
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Цена</CardTitle>
          <CardDescription>{describeConstraints(vm)}</CardDescription>
        </CardHeader>
        <CardContent>
          <BetForm
            auctionRef={auctionRef}
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
