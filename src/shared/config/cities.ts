/**
 * Canonical cities lookup consumed by the auctions list filters and by the
 * mock seed routes. The filters reference city names; the mock dataset's
 * route points reuse the same names so filter results stay consistent.
 *
 * Until a real geography API lands this is the only source of city names in
 * the app — `src/shared/api/mocks/cities.ts` re-exports the same constants so
 * mock handlers do not duplicate the dictionary.
 */

export interface City {
  /** Canonical city name; matches `AuctionListRequest.load_city` / `unload_city`. */
  name: string
  /** GC ID; matches `AuctionListRequest.load_gc_id` / `unload_gc_id`. */
  gcId: number
  /** Region label, surfaced in the filter dropdown for disambiguation. */
  region: string
}

export const cities: City[] = [
  { name: 'Москва', gcId: 1, region: 'Московская область' },
  { name: 'Санкт-Петербург', gcId: 2, region: 'Ленинградская область' },
  { name: 'Екатеринбург', gcId: 3, region: 'Свердловская область' },
  { name: 'Новосибирск', gcId: 4, region: 'Новосибирская область' },
  { name: 'Казань', gcId: 5, region: 'Республика Татарстан' },
  { name: 'Нижний Новгород', gcId: 6, region: 'Нижегородская область' },
  { name: 'Самара', gcId: 7, region: 'Самарская область' },
  { name: 'Ростов-на-Дону', gcId: 8, region: 'Ростовская область' },
  { name: 'Уфа', gcId: 9, region: 'Республика Башкортостан' },
  { name: 'Краснодар', gcId: 10, region: 'Краснодарский край' },
]

export function findCityByName(name: string): City | undefined {
  return cities.find((city) => city.name === name)
}

export function findCityByGcId(gcId: number): City | undefined {
  return cities.find((city) => city.gcId === gcId)
}
