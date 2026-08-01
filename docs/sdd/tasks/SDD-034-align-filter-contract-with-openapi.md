# SDD-034 Align Filter Contract With OpenAPI

## Статус

Запланировано.

## Цель

Привести URL/search params, form controls и request builder списка в точное соответствие OpenAPI-контракту, особенно по date-time и typed filter semantics.

## Охват

- Исправить date filters (`load_date_*`, `create_date_*`) так, чтобы в request уходил корректный ISO 8601 `date-time` со смещением, а не голая дата `YYYY-MM-DD`.
- Определить явную политику конвертации UI date input -> API datetime:
  - local start-of-day / end-of-day с timezone offset;
  - либо отдельные datetime controls;
  - либо documented business transform в request builder.
- Проверить boolean filters `is_available` / `is_bidder` на полноту UX-модели: сейчас форма генерирует только `true | undefined`, а parser допускает `false`.
- Сверить все поля `AuctionsListFilters` с реально поддерживаемым подмножеством `AuctionListRequest` и явно задокументировать, какие contract fields намеренно не покрыты в UI.
- Добавить tests на parse/serialize/build request, которые ловят нарушение OpenAPI patterns и timezone semantics.

## Зависимости

- `SDD-015`
- `SDD-016`
- `SDD-018`

## Критерии приёмки

- Все date-related поля, которые попадают в API request, соответствуют формату `date-time` из OpenAPI.
- UI transform для дат задокументирован и покрыт unit-тестами.
- Request builder не отправляет значения в форме, которую backend по контракту не принимает.
- README/AI_USAGE/SDD не содержат скрытого расхождения между UX controls и API payload semantics.

## Non-goals

- Добавление всех возможных фильтров OpenAPI, если задача только в корректности уже существующих.
- Изобретение нового filter DSL поверх URL.

## Заметки и риски

- Senior review обычно прощает упрощённый UI, но не прощает тихое нарушение формата API request.
