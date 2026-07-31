/**
 * Mock-only re-export of the canonical cities dictionary.
 *
 * Implementation lives in `@shared/config/cities` so higher FSD layers can
 * consume it through the production Public API without reaching into the
 * mock package; this file keeps the historical `mockCities` /
 * `findMockCityByGcId` names available to MSW handlers and tests.
 */

import { cities, findCityByGcId, findCityByName, type City } from '@shared/config'

export type MockCity = City
export const mockCities: MockCity[] = cities
export function findMockCityByName(name: string): MockCity | undefined {
  return findCityByName(name)
}
export function findMockCityByGcId(gc_id: number): MockCity | undefined {
  return findCityByGcId(gc_id)
}
