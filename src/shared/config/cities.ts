export interface City {
  name: string
  gcId: number
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
