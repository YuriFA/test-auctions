# SDD-014 Implement MSW Set Bet Endpoint

## Статус

Завершено.

## Цель

Реализовать endpoint мутации ставки с реалистичным поведением валидации.

## Охват

- Реализовать `POST /auctions/{auctionUuid}/bets`.
- Поддержать сценарии успеха, отсутствия ресурса и провала валидации.
- Возвращать ошибки валидации `application/problem+json` для `422`.

## Зависимости

- `SDD-006`
- `SDD-010`

## Критерии приёмки

- Валидация запроса следует схеме и бизнес-ограничениям.
- Провалы валидации соответствуют задокументированной форме ошибки.
- Успех обновляет общее runtime-состояние.

## Заметки и риски

- Этот endpoint должен не только принимать данные, но и менять app-видимое runtime-состояние.

## Заметки о реализации

- MSW-обработчик `POST /auctions/{auctionUuid}/bets` живёт в `src/shared/api/mocks/handlers/auctions-set-bet.ts` и является тонкой HTTP-обёрткой над `writeBet` из runtime-store (SDD-010). Handler резолвит path-параметр `:auctionUuid`, парсит JSON-тело, извлекает `price` и мапит `PlaceBetResult` в HTTP-ответ: 200 с `BetItem`-телом на успех, 404 `ProblemDetail` на неизвестный UUID, 422 `ValidationProblem` на некорректный JSON / отсутствующее тело / не-числовой `price` / `price <= 0`. Все ответы-ошибки идут с `content-type: application/problem+json`.
- Спецификация помечает 200-ответ как `unknown` («ответ проксируется от upstream», `docs/openapi.auctions.v0.json:172-174`), поэтому production-адаптер `placeBet` возвращает `void` и клиент тело не читает. Mock тем не менее отдаёт свежеразмещённый `BetItem`: `writeBet` уже его производит, он полезен для тестов и отладки, и forward-compatible если спецификация позже определит 200-схему.
- Разделение ответственности: handler владеет HTTP-конвертом и shape-валидацией (JSON-парсинг, тип `price`), store владеет бизнес-валидацией (`price > 0`) и всеми side-effect'ами (отвержение предыдущей активной ставки пользователя, пересчёт мест, обновление trading-блока в list и detail DTO).
- Path-паттерн `*/api/v1/auctions/:auctionUuid/bets` совпадает с GET bets-handler'ом (SDD-013), но MSW диспатчит по HTTP-методу (`http.post` vs `http.get`), поэтому два handler'а на одном пути сосуществуют без конфликта.
- Все 4 OpenAPI-эндпоинта теперь покрыты MSW: `POST /auctions/list` (SDD-011), `GET /auctions/{uuid}` (SDD-012), `GET /auctions/{uuid}/bets` (SDD-013), `POST /auctions/{uuid}/bets` (SDD-014). `mockHandlers` остаётся единым массивом для browser-worker и Node.
- Node-smoke (теперь vitest integration test `src/shared/api/mocks/handlers/auctions-set-bet.test.ts`, часть `pnpm test:run`) покрывает 9 сценариев / ~55 assertion: успех с `BetItem`-телом (id, `price_with_vat`, `price_no_vat < price_with_vat`, `is_rejected=false`, `place` заполнен); cross-endpoint консистентность — после set-bet list/detail/bets согласованно отражают новую текущую цену, `status_mobile=Leading`, `is_bidder=true`, `your.bet=true`, новая ставка видна в bets с `place=1`; повторный set-bet отвергает предыдущую активную ставку пользователя (`is_rejected=true`, `cancel_reason` заполнен, `place=null`) и default bets-запрос её скрывает; 422 на `price <= 0` (и 0, и отрицательное); 422 на отсутствующее поле `price`; 422 на не-числовой `price` (строка и null); 422 на пустое тело; 422 на malformed JSON с `errors[0].field === 'body'`; 404 + `application/problem+json` + `code: auction_not_found` на неизвестном UUID. Состояние сбрасывается через `resetMockRuntime()` перед каждым сценарием через `beforeEach`.
