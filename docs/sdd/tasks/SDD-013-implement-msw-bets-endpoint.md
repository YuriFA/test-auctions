# SDD-013 Implement MSW Bets Endpoint

## Статус

Завершено.

## Цель

Реализовать endpoint истории ставок в соответствии со схемой.

## Охват

- Реализовать `GET /auctions/{auctionUuid}/bets`.
- Поддержать на уровне приложения сценарии normal, empty и hidden-history.

## Зависимости

- `SDD-006`
- `SDD-010`

## Критерии приёмки

- Форма ответа соответствует `BetListResponse`.
- Возможны сценарии с пустой историей ставок.
- Возвращаемые данные могут поддерживать рендер UI для ранжирования, победителя и состояний отмены.

## Заметки и риски

- Гейтинг hidden-history относится к более широкому detail-driven флоу, а не к этому endpoint-у в одиночку.

## Заметки о реализации

- MSW-обработчик `GET /auctions/{auctionUuid}/bets` живёт в `src/shared/api/mocks/handlers/auctions-bets.ts` и является тонкой HTTP-обёрткой над `readAuctionBets` из runtime-store (SDD-010) — резолвит path-параметр `:auctionUuid`, читает опциональный query-флаг `all` (boolean, nullable по спецификации), мапит его в `includeCanceled`, возвращает `BetListResponse` (`{ bets: BetItem[] }`) на успех или `ProblemDetail` (404) с `content-type: application/problem+json` на промах.
- Флаг `all` трактуется строго: только литерал `"true"` включает отменённые ставки; любое другое значение (отсутствует, `"false"`, мусор) коллапсирует в `false`, как сделал бы пермиссивный бэкенд.
- Restriction `hide_bets_history` намеренно НЕ применяется в bets-endpoint. Это UI-level гейт, драйвимый detail DTO (SDD-021); endpoint всегда отдаёт реальные ставки и даёт UI-слою решить, показывать ли их.
- Path-паттерн `*/api/v1/auctions/:auctionUuid/bets` (leading-wildcard + односегментный placeholder + суффикс `/bets`) — единый для browser-worker и Node `setupServer`. Двухсегментный суффикс `/bets` гарантирует, что handler не сматчит detail-маршрут (SDD-012) и наоборот — smoke проверяет это явно в обе стороны (SDD-012 `/bets`-probe и SDD-013 detail-probe).
- Handler подключён в `src/shared/api/mocks/handlers/index.ts` после list и detail; `mockHandlers` остаётся единым массивом.
- Node-smoke (теперь vitest integration test `src/shared/api/mocks/handlers/auctions-bets.test.ts`, часть `pnpm test:run`) покрывает 9 сценариев / 34 assertion: полная форма `BetListResponse` на `downLeading` (поля `place`/`is_win`/`is_rejected`/`cancel_reason` на каждой ставке), default-запрос исключает rejected-ставку на `stoppedRejected`, `?all=true` включает её с `cancel_reason` и `place: null`, `?all=false` ведёт себя как default, мусорное `all=yes` коллапсирует в false, пустая история на `canceledEmpty` возвращает `{ bets: [] }` (не 404, не null), `hide_bets_history` на `finishedConfirmed` НЕ гейтит endpoint, 404 + `application/problem+json` + поля `ProblemDetail` на неизвестном UUID, bets-handler не перехватывает detail-маршрут.
