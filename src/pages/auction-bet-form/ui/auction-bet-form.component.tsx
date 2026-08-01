import type { AuctionDetailVM } from '@entities/auction'
import { deriveAuctionRestrictions, useAuctionDetail } from '@entities/auction'
import { BetForm } from '@features/bet-form'
import { formatPrice } from '@shared/lib/format'
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
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'

export function AuctionBetForm() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
  const detail = useAuctionDetail(auctionUuid)
  const navigate = useNavigate()

  if (detail.isPending) {
    return <AuctionBetFormSkeleton />
  }

  if (detail.isError) {
    return (
      <AuctionBetFormError
        title="Аукцион недоступен"
        message={detail.error?.message ?? 'Не удалось загрузить аукцион.'}
        onRetry={() => detail.refetch()}
      />
    )
  }

  const vm = detail.data
  if (!vm) {
    return (
      <AuctionBetFormError
        title="Аукцион не найден"
        message="Возможно, ссылка устарела или аукцион был удалён."
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
    return <AuctionBetFormRestricted vm={vm} />
  }

  return (
    <AuctionBetFormContent
      vm={vm}
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
  onSuccess: () => void
}

function AuctionBetFormContent({ vm, onSuccess }: ContentProps) {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
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
      <BackLink auctionUuid={auctionUuid} />
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

function AuctionBetFormRestricted({ vm }: { vm: AuctionDetailVM }) {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
  return (
    <PageContainer className="flex max-w-2xl flex-col gap-4">
      <BackLink auctionUuid={auctionUuid} />
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

interface ErrorProps {
  title: string
  message: string
  onRetry?: () => void
}

function AuctionBetFormError({ title, message, onRetry }: ErrorProps) {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
  return (
    <PageContainer className="flex max-w-2xl flex-col gap-4">
      <BackLink auctionUuid={auctionUuid} />
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

function BackLink({ auctionUuid }: { auctionUuid: string }) {
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
