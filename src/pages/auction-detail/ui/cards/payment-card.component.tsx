import type { AuctionDetailVM } from '@entities/auction'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'

import { DefinitionRow } from '../definition-row.component'

export interface PaymentCardProps {
  vm: AuctionDetailVM
}

export function PaymentCard({ vm }: PaymentCardProps) {
  const hasDelay = vm.paymentDelay != null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Условия оплаты</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <dl className="grid grid-cols-1 gap-y-2">
          {vm.paymentCondition && <DefinitionRow label="Условие" value={vm.paymentCondition} />}
          {vm.paymentForm && <DefinitionRow label="Форма" value={vm.paymentForm} />}
          {hasDelay && (
            <DefinitionRow
              label="Отсрочка"
              value={`${vm.paymentDelay} ${vm.paymentDelayTypeLabel}`.trim()}
            />
          )}
          {vm.paymentPrepay && <DefinitionRow label="Предоплата" value={vm.paymentPrepay} />}
          {vm.paymentCurrencyCode && (
            <DefinitionRow label="Валюта (ISO)" value={vm.paymentCurrencyCode} />
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
