import type { AuctionDetailVM } from '@entities/auction'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'
import { Users } from 'lucide-react'

import { DefinitionRow } from '../definition-row.component'

export interface OrganizerCardProps {
  vm: AuctionDetailVM
}

export function OrganizerCard({ vm }: OrganizerCardProps) {
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
          <DefinitionRow label="Название" value={vm.organizerName || '—'} />
          {vm.organizerInn && <DefinitionRow label="ИНН" value={vm.organizerInn} />}
          {vm.organizerKpp && <DefinitionRow label="КПП" value={vm.organizerKpp} />}
        </dl>
      </CardContent>
    </Card>
  )
}
