import type { AuctionDetailVM, AuctionRestrictions } from '@entities/auction'
import { formatPrice } from '@shared/lib'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'

import { DefinitionRow } from '../definition-row.component'

export interface YourBetCardProps {
  vm: AuctionDetailVM
  restrictions: AuctionRestrictions
}

export function YourBetCard({ vm, restrictions }: YourBetCardProps) {
  if (!vm.hasUserBet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ваша ставка</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {restrictions.canPlaceBet
              ? 'Вы ещё не сделали ставку по этому аукциону.'
              : 'Ставки по этому аукциону недоступны.'}
          </p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ваша ставка</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="flex flex-col gap-2">
          {vm.userLastBet != null && (
            <DefinitionRow label="Последняя ставка" value={formatPrice(vm.userLastBet)} />
          )}
          {vm.userLastBetWithVat != null && (
            <DefinitionRow label="В т.ч. НДС" value={formatPrice(vm.userLastBetWithVat)} />
          )}
          {vm.userWin && (
            <div className="text-sm font-medium text-success">Вы текущий победитель</div>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
