import type { BetItem, BetListResponse } from '@shared/api'
import { describe, expect, it } from 'vitest'

import { toAuctionBetsVM } from './bets'

function makeBet(overrides: Partial<BetItem> = {}): BetItem {
  return {
    id: 1,
    created_at: '2026-08-01T10:00:00+03:00',
    subscriber_id: 100,
    contact_name: 'Иван',
    contact_phone: '+79991234567',
    price_with_vat: 100000,
    price_no_vat: 83333,
    organization_id: 1001,
    organization_inn: '7700000001',
    organization_name: 'ООО «ТестЛогистика»',
    is_rejected: false,
    is_counter: false,
    place: 1,
    is_win: true,
    run_number: 0,
    cancel_reason: '',
    ...overrides,
  }
}

function makeResponse(bets: BetItem[] = [makeBet()]): BetListResponse {
  return { bets }
}

describe('toAuctionBetsVM', () => {
  it('maps every field of a happy-path bet', () => {
    const vm = toAuctionBetsVM(
      makeResponse([
        makeBet({
          id: 42,
          created_at: '2026-08-01T10:00:00+03:00',
          price_with_vat: 100000,
          price_no_vat: 83333,
          organization_name: 'ООО «Атлант»',
          place: 2,
          is_win: false,
          is_rejected: false,
          cancel_reason: '',
        }),
      ]),
    )
    expect(vm.bets).toHaveLength(1)
    expect(vm.bets[0]).toEqual({
      id: 42,
      createdAt: '2026-08-01T10:00:00+03:00',
      priceWithVat: 100000,
      priceNoVat: 83333,
      organizationName: 'ООО «Атлант»',
      place: 2,
      isWin: false,
      isRejected: false,
      cancelReason: '',
    })
  })

  it('returns empty bets array for empty response', () => {
    const vm = toAuctionBetsVM(makeResponse([]))
    expect(vm.bets).toEqual([])
    expect(vm.participantCount).toBe(0)
  })

  it('collapses missing nullable price fields to null', () => {
    const vm = toAuctionBetsVM(
      makeResponse([makeBet({ price_with_vat: undefined, price_no_vat: undefined })]),
    )
    expect(vm.bets[0].priceWithVat).toBeNull()
    expect(vm.bets[0].priceNoVat).toBeNull()
  })

  it('maps cancelled bet with reason', () => {
    const vm = toAuctionBetsVM(
      makeResponse([
        makeBet({
          is_rejected: true,
          cancel_reason: 'Перебито новой ставкой',
          place: null,
          is_win: false,
        }),
      ]),
    )
    expect(vm.bets[0]).toMatchObject({
      isRejected: true,
      cancelReason: 'Перебито новой ставкой',
      place: null,
      isWin: false,
    })
  })

  it('treats missing cancel_reason as empty string', () => {
    const vm = toAuctionBetsVM(makeResponse([makeBet({ cancel_reason: undefined })]))
    expect(vm.bets[0].cancelReason).toBe('')
  })

  it('counts unique organizations across all bets (active + cancelled)', () => {
    const vm = toAuctionBetsVM(
      makeResponse([
        makeBet({ id: 1, organization_id: 1001, is_rejected: false }),
        makeBet({ id: 2, organization_id: 1001, is_rejected: false }),
        makeBet({ id: 3, organization_id: 2002, is_rejected: true }),
        makeBet({ id: 4, organization_id: 3003, is_rejected: false }),
      ]),
    )
    expect(vm.participantCount).toBe(3)
  })

  it('preserves incoming order of bets', () => {
    const vm = toAuctionBetsVM(
      makeResponse([
        makeBet({ id: 10, place: 3 }),
        makeBet({ id: 20, place: 1 }),
        makeBet({ id: 30, place: 2 }),
      ]),
    )
    expect(vm.bets.map((b) => b.id)).toEqual([10, 20, 30])
  })

  it('treats null place as null, not as 0', () => {
    const vm = toAuctionBetsVM(makeResponse([makeBet({ place: null })]))
    expect(vm.bets[0].place).toBeNull()
  })

  it('defaults organization_name to empty string when missing', () => {
    const vm = toAuctionBetsVM(makeResponse([makeBet({ organization_name: undefined })]))
    expect(vm.bets[0].organizationName).toBe('')
  })
})
