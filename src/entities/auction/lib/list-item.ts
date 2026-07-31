import type { AuctionListItem } from '@shared/api'
import { extractAuctionUuid } from '@shared/api'

export type AuctionListItemVM = {
  auctionUuid: string
  cargoNum: string
  aucType: string | undefined
}

export function toAuctionListItemVM(item: AuctionListItem): AuctionListItemVM | null {
  const auctionUuid = extractAuctionUuid(item)
  if (!auctionUuid) {return null}
  return {
    auctionUuid,
    cargoNum: item.main?.cargo_num ?? '',
    aucType: item.main?.auc_type,
  }
}
