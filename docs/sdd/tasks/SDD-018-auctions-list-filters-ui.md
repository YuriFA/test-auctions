# SDD-018 Auctions List Filters UI

## Статус

Не начато.

## Цель

Реализовать UI фильтров: рендер контролов, вывод человекочитаемых лейблов и проводку событий изменения в URL через готовые хелперы SDD-015.

## Охват

- Рендер обязательного минимума контролов 1:1 с URL-контрактом SDD-015:
  - `cargo_num` (текстовый поиск по номеру заявки);
  - `status[]` (multi-select торговых статусов пользователя);
  - `statuses[]` (multi-select статусов аукциона, 1..7);
  - `auc_type[]` (multi-select `Request`/`Up`/`Down`/`FixPrice`);
  - `load_city`/`unload_city` (select из `mockCities` SDD-009);
  - `load_date_from`/`load_date_to` (date picker даты погрузки);
  - `is_available`/`is_bidder` (чекбоксы);
  - `current_price_from`/`current_price_to` (number input цены от/до).
- `weight_*`/`volume_*` НЕ отображать (D-014).
- Подписка контролов на текущие значения из типизированного объекта SDD-015 (односторонняя: URL → UI).
- На изменение значения контрола вызывать `serializeAuctionsListSearchParams(next)` и `navigate()` — никаких ручных `URLSearchParams`-конкатенаций в UI.
- Интегрировать словарь городов (`mockCities` из SDD-009).
- Состояние мобильного drawer'а фильтров хранится в `useFiltersUIStore` на Zustand (D-004). Само состояние фильтров — в URL (SDD-015), не в сторе; в сторе только UI-флаг «drawer открыт/закрыт».
- TDD: построить типизированный словарь лейблов enum'ов (`auc_type`, `status`, `body_type` и т. п.) в `entities/auction/lib` и покрыть его маппер тестами вперёд.

## Зависимости

- `SDD-009` (mock-словарь городов)
- `SDD-015` (parse, serialize, defaults-хелперы)
- `SDD-017` (query перечитывает URL и переотправляет запрос)

## TDD-порядок (для лейблов)

1. В `src/entities/auction/lib/` написать красные тесты на `describeAuctionType(type)`, `describeTradingStatus(status)`, `describeBodyType(body)` и т. п.:
   - каждое enum-значение из OpenAPI-контракта имеет осмысленный русский лейбл;
   - неизвестное значение (вне enum) → явный fallback (например, само значение или «—»), без исключения;
   - лейблы не collide'ят (разные enum'ы не дают одну строку).
2. Запустить тесты, убедиться, что они красные по правильной причине.
3. Реализовать минимальные мапперы как таблицы `Record<Enum, string>`, чтобы тесты позеленели.
4. Использовать эти мапперы в UI-компонентах фильтров (и позже в SDD-019 в карточке).

## Критерии приёмки

- Взаимодействия с фильтрами обновляют URL только через `serializeAuctionsListSearchParams` из SDD-015.
- Обновление или шеринг URL сохраняет состояние фильтров (round-trip закрыт в SDD-015).
- Городские фильтры используют `mockCities` (SDD-009).
- Лейблы enum'ов берутся из `entities/auction/lib` и покрыты `pnpm test`.
- `countActiveFilters` / `isDefaultFilters` используются для бейджа и кнопки «сбросить».
- Фильтры читаемы на mobile (`< sm`) и desktop; на mobile сворачиваются в drawer, состояние которого живёт в `useFiltersUIStore` (Zustand, D-004).
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).

## Non-goals

- В этой задаче НЕ пишется чистая фильтр-логика. Если в UI-компоненте возник transform (format/parse/coerce) — это сигнал, что он должен жить в SDD-015 (URL-контракт) или в `entities/auction/lib` (доменные мапперы), а не в `*.component.tsx`.
- Тестирование рендера UI вне scope logic-минимума AGENTS.md; при желании добавляется отдельно.

## Заметки и риски

- Не допускать, чтобы скрытое локальное состояние стало настоящим источником истины: URL (через SDD-015) — единственный источник, UI — только зеркало.
- Словарь лейблов — первый житель `entities/auction/lib`; это создаёт сегмент `lib` внутри слайса, что соответствует FSD-конвенции «purpose-named segments» (steiger допускает).
