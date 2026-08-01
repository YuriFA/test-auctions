import type { AuctionDetailVM } from '@entities/auction'
import { deriveAuctionRestrictions, useAuctionDetail } from '@entities/auction'
import { BetForm } from '@features/bet-form'
import { formatPrice } from '@shared/lib/format'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  BackLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorStateCard,
  PageContainer,
  Skeleton,
} from '@shared/ui'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

export function AuctionBetForm() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
  const detail = useAuctionDetail(auctionUuid)
  const navigate = useNavigate()

  const backLink = (
    <BackLink to="/auctions/$auctionUuid" params={{ auctionUuid }}>
      К аукциону
    </BackLink>
  )

  if (detail.isPending) {
    return <AuctionBetFormSkeleton />
  }

  if (detail.isError) {
    return (
      <ErrorStateCard
        title="Аукцион недоступен"
        message={detail.error?.message ?? 'Не удалось загрузить аукцион.'}
        onRetry={() => detail.refetch()}
        backLink={backLink}
      />
    )
  }

  const vm = detail.data
  if (!vm) {
    return (
      <ErrorStateCard
        title="Аукцион не найден"
        message="Возможно, ссылка устарела или аукцион был удалён."
        backLink={backLink}
      />
    )
  }

  const restrictions = deriveAuctionRestrictions({
    canSetBet: vm.canSetBet,
    hideBetsHistory: vm.hideBetsHistory,
    hidePointsAddressAndContacts: vm.hidePointsAddressAndContacts,
    noViewCargoPrice: vm.noViewCargoPrice,
  })

  if (!restrictions.canPlaceBet) {
    return <AuctionBetFormRestricted vm={vm} backLink={backLink} />
  }

  return (
    <AuctionBetFormContent
      vm={vm}
      auctionUuid={auctionUuid}
      backLink={backLink}
      onSuccess={() =>
        navigate({
          to: '/auctions/$auctionUuid/bets',
          params: { auctionUuid },
        })
      }
    />
  )
}

interface ContentProps {
  vm: AuctionDetailVM
  auctionUuid: string
  backLink: React.ReactNode
  onSuccess: () => void
}

function AuctionBetFormContent({ vm, auctionUuid, backLink, onSuccess }: ContentProps) {
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
    <PageContainer className="flex max-w-2xl flex-col gap-4">
      {backLink}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ставка по аукциону</h1>
        <p className="text-sm text-muted-foreground">
          Аукцион {vm.cargoNum ? `№ ${vm.cargoNum}` : `заявка ${vm.orderUid}`}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Цена</CardTitle>
          <CardDescription>{describeConstraints(vm)}</CardDescription>
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
    </PageContainer>
  )
}

function describeConstraints(vm: AuctionDetailVM): string {
  const parts: string[] = []
  if (vm.priceMin != null) {
    parts.push(`от ${formatPrice(vm.priceMin)}`)
  }
  if (vm.priceMax != null) {
    parts.push(`до ${formatPrice(vm.priceMax)}`)
  }
  if (vm.priceStep != null) {
    parts.push(`шаг ${formatPrice(vm.priceStep)}`)
  }
  return parts.length > 0 ? parts.join(' · ') : 'Без явных ограничений'
}

function AuctionBetFormRestricted({
  vm,
  backLink,
}: {
  vm: AuctionDetailVM
  backLink: React.ReactNode
}) {
  return (
    <PageContainer className="flex max-w-2xl flex-col gap-4">
      {backLink}
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ставка недоступна</h1>
      <Alert>
        <AlertTitle>Нельзя поставить ставку</AlertTitle>
        <AlertDescription>
          Приём ставок по этому аукциону закрыт — например, торги завершены или ещё не начались.
        </AlertDescription>
      </Alert>
      <p className="text-sm text-muted-foreground">
        Аукцион {vm.cargoNum ? `№ ${vm.cargoNum}` : `заявка ${vm.orderUid}`}
      </p>
    </PageContainer>
  )
}

function AuctionBetFormSkeleton() {
  return (
    <PageContainer className="flex max-w-2xl flex-col gap-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40" />
    </PageContainer>
  )
}
