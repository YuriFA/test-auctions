import { cities, findCityByGcId, findCityByName, type City } from '@shared/config'

export type MockCity = City
export const mockCities: MockCity[] = cities
export function findMockCityByName(name: string): MockCity | undefined {
  return findCityByName(name)
}
export function findMockCityByGcId(gc_id: number): MockCity | undefined {
  return findCityByGcId(gc_id)
}
