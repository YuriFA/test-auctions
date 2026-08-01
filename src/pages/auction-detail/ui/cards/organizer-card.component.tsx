import type { AuctionDetailVM } from '@entities/auction'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'
import { Users } from 'lucide-react'

export interface OrganizerCardProps {
  vm: AuctionDetailVM
}

export function OrganizerCard({ vm }: OrganizerCardProps) {
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
