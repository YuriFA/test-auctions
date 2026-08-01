import type { AuctionDetailVM } from '@entities/auction'
import { formatDistance, formatLength, formatVolume, formatWeight } from '@shared/lib'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'
import { Truck } from 'lucide-react'

import { DefinitionRow } from '../definition-row.component'

export interface CargoCardProps {
  vm: AuctionDetailVM
}

export function CargoCard({ vm }: CargoCardProps) {
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
          <DefinitionRow label="Тип кузова" value={vm.cargoBodyType} />
          {vm.cargoDistance != null && (
            <DefinitionRow label="Расстояние" value={formatDistance(vm.cargoDistance)} />
          )}
          {vm.cargoTruckCount != null && (
            <DefinitionRow label="Машин" value={String(vm.cargoTruckCount)} />
          )}
          {vm.cargoTempFrom != null && vm.cargoTempTo != null && (
            <DefinitionRow label="Температура" value={`${vm.cargoTempFrom}…${vm.cargoTempTo} °C`} />
          )}
        </dl>
        {hasCar && car && (
          <div className="mt-3 border-t pt-3">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Требования к ТС</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {car.type && <DefinitionRow label="Тип" value={car.type} />}
              {car.weight != null && <DefinitionRow label="Тоннаж" value={formatWeight(car.weight)} />}
              {car.volume != null && <DefinitionRow label="Объём" value={formatVolume(car.volume)} />}
              {car.length != null && <DefinitionRow label="Длина" value={formatLength(car.length)} />}
              {car.width != null && <DefinitionRow label="Ширина" value={formatLength(car.width)} />}
              {car.height != null && <DefinitionRow label="Высота" value={formatLength(car.height)} />}
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
