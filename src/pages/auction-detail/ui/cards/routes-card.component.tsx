import type { AuctionDetailVM, AuctionRestrictions } from '@entities/auction'
import { formatDate } from '@shared/lib'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui'
import { CalendarClock, MapPin } from 'lucide-react'

export interface RoutesCardProps {
  vm: AuctionDetailVM
  restrictions: AuctionRestrictions
}

export function RoutesCard({ vm, restrictions }: RoutesCardProps) {
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
              {restrictions.canViewContacts && point.loadingAddress && (
                <div className="text-xs text-muted-foreground">{point.loadingAddress}</div>
              )}
              {(point.startDate || point.endDate) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {point.startDate && (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-3" aria-hidden />с{' '}
                      {formatDate(point.startDate)}
                    </span>
                  )}
                  {point.endDate && <span>до {formatDate(point.endDate)}</span>}
                </div>
              )}
              {point.contractor && (
                <div className="text-xs text-muted-foreground">
                  {point.contractor}
                  {point.contractorInn && (
                    <span className="ml-2 font-mono">ИНН {point.contractorInn}</span>
                  )}
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
              {restrictions.canViewContacts && (point.contactName || point.contactPhone) && (
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
