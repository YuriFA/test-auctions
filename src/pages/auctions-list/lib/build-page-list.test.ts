import { describe, expect, it } from 'vitest'

import { buildPageList } from './build-page-list'

describe('buildPageList', () => {
  it('returns all pages when lastPage is within the compact threshold', () => {
    expect(buildPageList(1, 1)).toEqual([1])
    expect(buildPageList(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('pins first and last and centers a window in the middle of the range', () => {
    expect(buildPageList(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
  })

  it('drops the leading ellipsis when the window reaches the first page', () => {
    expect(buildPageList(2, 20)).toEqual([1, 2, 3, 'ellipsis', 20])
  })

  it('drops the trailing ellipsis when the window reaches the last page', () => {
    expect(buildPageList(19, 20)).toEqual([1, 'ellipsis', 18, 19, 20])
  })

  it('clamps the window start so it never overlaps the pinned first page', () => {
    expect(buildPageList(1, 20)).toEqual([1, 2, 'ellipsis', 20])
  })

  it('clamps the window end so it never overlaps the pinned last page', () => {
    expect(buildPageList(20, 20)).toEqual([1, 'ellipsis', 19, 20])
  })
})
