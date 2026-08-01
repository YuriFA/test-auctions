# SDD-032 Contract-Correct Routing Identity

## Статус

Запланировано.

## Цель

Убрать mock-only зависимость от `main.auction_uuid` и привести навигацию list -> detail к контрактно-корректной модели, которую можно защищать на Senior/Staff/Lead review без оговорок.

## Охват

- Зафиксировать контрактный разрыв между `POST /auctions/list` и detail/bets/bet routes: list DTO не содержит `auctionUuid`, тогда как route tree требует именно его.
- Удалить использование выдуманного поля `main.auction_uuid` из production-кода:
  - `src/shared/api/auctions.ts`
  - `src/entities/auction/lib/list-item.ts`
  - `src/pages/auctions-list/**`
- Перестроить routing identity одним из контрактно-честных способов:
  - либо сменить публичный route contract приложения на доступный из DTO идентификатор, если это допустимо в рамках задания;
  - либо ввести явный adapter/view-model workaround, который не расширяет DTO несуществующим полем и документирует ограничение;
  - либо поднять отдельный lookup-слой/таблицу соответствия, если он формируется без нарушения OpenAPI source-of-truth.
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
- Навигация из списка на detail/bets/bet остаётся рабочей и объяснимой без фразы "мок добавляет поле".
- README, AI_USAGE и SDD больше не описывают invented field как приемлемую основу для routing.
- Добавлены тесты, которые защищают выбранную routing identity и ловят возврат к contract drift.

## Non-goals

- Полная переработка всего route tree, если проблема решается локальным adapter-level решением.
- Изменение OpenAPI-файла задним числом ради удобства UI.

## Заметки и риски

- Это главный credibility issue всего задания: пока list->detail зависит от выдуманного поля, контрактная дисциплина считается проваленной.
- Если route contract придётся менять, это надо делать явно и последовательно, а не маскировать в seed data.
