/**
 * Mock cities dictionary used by the auctions list filters and by the seed
 * routes inside the mock dataset.
 *
 * The `load_city` / `unload_city` filters on `POST /auctions/list` accept a
 * free-form string, while `load_gc_id` / `unload_gc_id` accept the numeric
 * geography code. Both fields are exercised by the filter UI, so the mock
 * dictionary exposes the canonical name plus the GC ID, and route points
 * reuse the same names so filter results stay consistent.
 */

export interface MockCity {
  /** Canonical city name; matches `AuctionListRequest.load_city` / `unload_city`. */
  name: string;
  /** GC ID; matches `AuctionListRequest.load_gc_id` / `unload_gc_id`. */
  gc_id: number;
  /** Region label, surfaced in the filter dropdown for disambiguation. */
  region: string;
}

export const mockCities: MockCity[] = [
  { name: "Москва", gc_id: 1, region: "Московская область" },
  { name: "Санкт-Петербург", gc_id: 2, region: "Ленинградская область" },
  { name: "Екатеринбург", gc_id: 3, region: "Свердловская область" },
  { name: "Новосибирск", gc_id: 4, region: "Новосибирская область" },
  { name: "Казань", gc_id: 5, region: "Республика Татарстан" },
  { name: "Нижний Новгород", gc_id: 6, region: "Нижегородская область" },
  { name: "Самара", gc_id: 7, region: "Самарская область" },
  { name: "Ростов-на-Дону", gc_id: 8, region: "Ростовская область" },
  { name: "Уфа", gc_id: 9, region: "Республика Башкортостан" },
  { name: "Краснодар", gc_id: 10, region: "Краснодарский край" },
];

export function findMockCityByName(name: string): MockCity | undefined {
  return mockCities.find((city) => city.name === name);
}

export function findMockCityByGcId(gc_id: number): MockCity | undefined {
  return mockCities.find((city) => city.gc_id === gc_id);
}
