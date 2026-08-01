import type { AuctionDetailVM, AuctionRestrictions } from '@entities/auction'
import { formatPrice, formatDate } from '@shared/lib'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui'

import { DefinitionRow } from '../definition-row.component'
import { PriceRow } from '../price-row.component'

export interface TradingCardProps {
  vm: AuctionDetailVM
  restrictions: AuctionRestrictions
}

export function TradingCard({ vm, restrictions }: TradingCardProps) {
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
        {!restrictions.canViewCargoPrice ? (
          <p className="text-muted-foreground">Цены скрыты организатором торгов.</p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <PriceRow label="Текущая" value={vm.priceCurrent} sub={vm.priceCurrentNoVat} />
            <PriceRow label="Доступная" value={vm.priceAvailable} sub={vm.priceAvailableNoVat} />
            {vm.priceStart != null && <PriceRow label="Стартовая" value={vm.priceStart} />}
            {vm.priceMin != null && <PriceRow label="Мин." value={vm.priceMin} />}
            {vm.priceMax != null && <PriceRow label="Макс." value={vm.priceMax} />}
            {vm.priceStep != null && <PriceRow label="Шаг" value={vm.priceStep} />}
            {vm.pricePerKm != null && (
              <DefinitionRow label="Цена за км" value={`${formatPrice(vm.pricePerKm)}/км`} />
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
