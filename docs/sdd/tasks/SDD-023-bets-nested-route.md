# SDD-023 Bets Nested Route

## Статус

Готово. Добавлен VM-mapper `toAuctionBetsVM` в `entities/auction/lib/bets.ts`
(9 TDD-тестов: happy-path, empty list, nullable-цены, отменённая ставка с
причиной, participantCount по уникальным organization_id, сохранение порядка
входящего массива, default empty string для отсутствующих строк). Query-hook
`useAuctionBets` в `entities/auction/api/use-auction-bets.ts` с
`enabled`-гейтом от `hide_bets_history`. Страница переписана как shell
`AuctionBetsPage` (frame-only) + content `AuctionBets` (все хуки и ранние
return'ы): skeleton/error/empty/restricted/list. Restricted-state рисуется
по `vm.hideBetsHistory` без запроса bets-эндпоинта (`useAuctionBets` получает
`enabled: !detail.data?.hideBetsHistory`). Список показывает: номер места,
победитель (Crown badge), отменена (destructive badge + причина), цену с/без
НДС, перевозчика, дату ставки; в шапке — participantCount и всего ставок.
Smoke: route-smoke расширен двумя bets-кейсами — `/auctions/{downLeading}/bets`
(h1="История ставок") и `/auctions/{finishedConfirmed}/bets`
(h1="История ставок" + alert="История скрыта"). `BetItem` и `BetListResponse`
добавлены в Public API `shared/api` (раньше список экспортировал только
адаптерный alias `BetsListResponse` без типа элемента ставки).

## Цель

Реализовать вложенный маршрут для истории ставок аукциона.

## Охват

- Добавить `/auctions/$auctionUuid/bets`.
- Связать доступ к маршруту с detail-driven ограничениями.
- Страница или вкладка ставок должна использовать `GET /auctions/{auctionUuid}/bets`.
  Показать:
  - список ставок
  - количество участников
  - цену с НДС / без НДС
  - перевозчика
  - место в рейтинге
  - признак победителя
  - признак отменённой ставки
  - причину отмены, если есть
  - empty state, если ставок нет
  - состояние, когда история ставок скрыта через `hide_bets_history`

## Зависимости

- `SDD-005`
- `SDD-021`
- `SDD-022`

## Критерии приёмки

- Маршрут bets резолвится как вложенный маршрут аукциона (`/auctions/$auctionUuid/bets`).
- Когда история скрыта (`hide_bets_history = true`), маршрут показывает restricted-состояние вместо нормального контента; bets-эндпоинт не запрашивается.
- Когда разрешено, маршрут может грузить данные bets.
- Лейаут читаем на mobile (`< sm`) и desktop.

## Заметки и риски

- Поведение маршрута должно быть консистентным при переходе по ссылке и при прямом вводе URL.
- Path-параметр `auctionUuid` строится от `main.auction_uuid` (D-011), не от `order_uid`.
- Семантика флага `hide_bets_history` принадлежит SDD-022; этот маршрут — только потребитель.
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).
