import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // `entities/auction` and `features/auction-filters` each currently have a
    // single consumer (the auctions list page). SDD-018 (filters UI) and
    // SDD-019 (card) will add more, after which this override can be dropped.
    // The rule is a hygiene hint, not a structural correctness check.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
])
