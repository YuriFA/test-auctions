# SDD-012 Implement MSW Detail Endpoint

## Статус

Завершено.

## Цель

Реализовать endpoint детальных данных аукциона в соответствии со схемой.

## Охват

- Реализовать `GET /auctions/{auctionUuid}`.
- Возвращать detail DTO с реалистичными комбинациями restriction и nullable.

## Зависимости

- `SDD-006`
- `SDD-010`

## Критерии приёмки

- Форма ответа соответствует `AuctionShowResponse`.
- Можно вернуть сценарии отсутствия ресурса и ошибок.
- Restriction-флаги явно представлены в mock-данных.

## Заметки и риски

- Этот endpoint двигает несколько экранов и правил, поэтому поведение скрытых полей должно быть тестируемым.

## Заметки о реализации

- MSW-обработчик `GET /auctions/{auctionUuid}` живёт в `src/shared/api/mocks/handlers/auctions-detail.ts` и является тонкой HTTP-обёрткой над `readAuctionDetail` из runtime-store (SDD-010) — резолвит path-параметр `:auctionUuid`, возвращает `AuctionShowResponse` (200) или `ProblemDetail` (404) с `content-type: application/problem+json`, как требует `components/responses/NotFound` спецификации.
- Вся DTO-логика (restriction-флаги `hide_bets_history`, `hide_points_address_and_contacts`, `no_view_cargo_price`, `can_set_bet`, trading-блок, контакты, маршруты, admitted-организации) формируется в seed (SDD-009) и поддерживается runtime-store (SDD-010); handler не дублирует эту логику.
- Path-паттерн `*/api/v1/auctions/:auctionUuid` (leading-wildcard + односегментный placeholder) — единый для browser-worker и Node `setupServer`, как в SDD-011; односегментный placeholder гарантирует, что соседний маршрут `/auctions/{auctionUuid}/bets` (SDD-013) здесь не сматчится.
- Handler подключён в `src/shared/api/mocks/handlers/index.ts` рядом с list-handler'ом; `mockHandlers` остаётся единым массивом для browser-worker и Node.
- Node-smoke (теперь vitest integration test `src/shared/api/mocks/handlers/auctions-detail.test.ts`, часть `pnpm test:run`) покрывает 6 сценариев / 25 assertion: полная форма `AuctionShowResponse` на `downLeading` (включая проверку, что `main.order_uid` отличается от path-UUID по D-011), restriction `hide_bets_history` на `finishedConfirmed`, связка `no_view_cargo_price` + `hide_points_address_and_contacts` на `fixPriceHidden`, `hide_points_address_and_contacts` на `downHiddenContacts`, 404 + `application/problem+json` + поля `code`/`title`/`message` на неизвестном UUID, отсутствие over-match на `/auctions/{uuid}/bets`.
