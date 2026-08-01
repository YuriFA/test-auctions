# SDD-032 Contract-Correct Routing Identity

## Статус

Готово. Удалено mock-only поле `main.auction_uuid` из list DTO, сидов и filler-датасета. Внешний route param приложения переименован в `auctionRef` и теперь строится от контрактного `main.order_uid`, а adapter-layer (`shared/api`) резолвит `auctionRef -> auctionUuid` через mock runtime lookup перед вызовом OpenAPI path-эндпоинтов. Production-код больше не читает invented field и не кастует DTO под несуществующее свойство. Проверка: `pnpm typecheck`, `pnpm test:run src/entities/auction/lib/list-item.test.ts src/shared/api/mocks/handlers/auctions-list.test.ts src/shared/api/mocks/handlers/auctions-set-bet.test.ts`, `pnpm test:e2e e2e/route.spec.ts e2e/list-page.spec.ts`.

## Цель

Убрать mock-only зависимость от `main.auction_uuid` и заменить её на честную модель `auctionRef` с локализованным resolver boundary между UI-router и OpenAPI path identity.

## Охват

- Зафиксировать контрактный разрыв между `POST /auctions/list` и detail/bets/bet routes: list DTO не содержит `auctionUuid`, тогда как route tree требует именно его.
- Удалить использование выдуманного поля `main.auction_uuid` из production-кода:
  - `src/shared/api/auctions.ts`
  - `src/entities/auction/lib/list-item.ts`
  - `src/pages/auctions-list/**`
- Перестроить routing identity через публичный `auctionRef`, который берётся из существующего DTO поля `order_uid`, но не подменяет им `auctionUuid` в API path'ах.
- Ввести явный adapter-level resolver `auctionRef -> auctionUuid`, локализованный в mock/runtime boundary.
- Удалить `auction_uuid` из mock list DTO и seed/filler данных.
- Обновить тесты, документацию и SDD-заметки, чтобы в проекте не осталось утверждений о допустимости invented field.

## Зависимости

- `SDD-007`
- `SDD-009`
- `SDD-011`
- `SDD-017`
- `SDD-020`

## Критерии приёмки

- В handwritten production-коде отсутствует чтение `main.auction_uuid` и отсутствуют defensive-cast'ы под это поле.
- Mock layer больше не расширяет OpenAPI list DTO полем, которого нет в контракте.
- Навигация из списка на detail/bets/bet остаётся рабочей через `auctionRef`, а OpenAPI path identity остаётся локализованной внутри resolver boundary.
- README, AI_USAGE и SDD больше не описывают invented field как приемлемую основу для routing.
- Добавлены тесты, которые защищают выбранную routing identity и ловят возврат к contract drift.

## Non-goals

- Полная переработка всего route tree, если проблема решается локальным adapter-level решением.
- Изменение OpenAPI-файла задним числом ради удобства UI.

## Заметки и риски

- Это остаётся mock-era workaround: backend по-прежнему не даёт list-level `auctionUuid`, поэтому resolver существует только как локальный мост до появления контрактного решения на API-стороне.
