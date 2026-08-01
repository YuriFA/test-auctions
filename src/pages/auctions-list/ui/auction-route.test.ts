import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AuctionRoute } from './auction-route.component'

describe('AuctionRoute', () => {
  it('preserves an explicit direction label when it differs from the city pair', () => {
    const html = renderToStaticMarkup(
      createElement(AuctionRoute, {
        loadCity: 'Москва',
        unloadCity: 'Казань',
        direction: 'Москва → Казань через Самару',
      }),
    )

    expect(html).toContain('Москва → Казань через Самару')
  })
})
