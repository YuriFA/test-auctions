import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AuctionTrading } from './auction-trading.component'

describe('AuctionTrading', () => {
  it('renders the raw list price-per-km value instead of recomputing it from current price', () => {
    const html = renderToStaticMarkup(
      createElement(AuctionTrading, {
        item: {
          currentPrice: 45000,
          pricePerKm: 28.5,
        },
      }),
    )

    expect(html).toContain('28,5 ₽/км')
    expect(html).not.toMatch(/1(?:\s|&nbsp;| )?578(?:\s|&nbsp;| )?₽\/км/)
  })
})
