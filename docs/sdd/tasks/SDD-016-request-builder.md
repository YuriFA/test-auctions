# SDD-016 Request Builder

## Статус

Завершено.

## Цель

Транслировать провалидированные search params в форму запроса API списка.

## Охват

- Сопоставить search params с `AuctionListRequest`.
- Аккуратно обрабатывать поля date, number, boolean, enum и массивы.
- TDD: тесты на логику конверсии пишутся ПЕРВЫМИ, до реализации builder'а.

## Зависимости

- `SDD-006`
- `SDD-015` (включая готовый vitest-раннер)

## TDD-порядок

1. Написать красные тесты на `buildAuctionListRequest(parsed)`:
   - пустой parsed-объект → `{}` (никаких лишних полей);
   - каждый поддержанный фильтр маппится в корректное поле `AuctionListRequest` с правильным типом (number → number, дата-ISO → строка в формате контракта, enum-строка → enum-литерал, массив → массив);
   - неизвестные/UI-специфичные поля search params НЕ протекают в запрос;
   - диапазоны цены (`current_price_from`/`current_price_to`) попадают ровно в те ключи, что описаны в OpenAPI; `weight_*`/`volume_*` намеренно не маппятся (см. D-014);
   - URL-форма boolean (`"true"`/`"false"`) уже пришли провалидированными из SDD-015, builder просто пробрасывает их как настоящие boolean.
2. Запустить тесты, убедиться, что они красные по правильной причине.
3. Реализовать минимальный builder, чтобы тесты позеленели.
4. Рефакторить при необходимости.

## Критерии приёмки

- Построенные запросы соответствуют ожидаемой форме DTO.
- Отправляются только релевантные поля.
- Тесты покрывают обычные и edge-case входы и проходят в `pnpm test`.

## Заметки и риски

- Не допускать протекания UI-специфичных имён в сырое построение API-запроса.
- Builder — чистая функция, поэтому тесты не требуют MSW или моков; только `describe`/`it` с фикстурами.

## Заметки о реализации

- Builder живёт в `src/features/auction-filters/lib/request-builder.ts` и экспортирован через Public API слайса как `buildAuctionListRequest`. Тесты co-located в `request-builder.test.ts` (31 assertion, ALL OK).
- Возвращает `AuctionListRequest` из `@shared/api` (canonical-имя добавлено в Public API `shared/api/index.ts` ранее было недоступно — только alias `AuctionListFilters`). Импорт из `@shared/api/generated` напрямую запрещён правилом `fsd/no-public-api-sidestep`.
- Default-значения НЕ отправляются: пустой parsed → `{}`, `page !== 1` → `{page}`, `is_oldest === true` → `{is_oldest}`. Это держит тело запроса минимальным и устойчивым к изменению дефолтов, как в SDD-015 для URL.
- `auc_type: 'Unknown'` (в URL-фильтре) absent в API enum (`'Request'|'Up'|'Down'|'FixPrice'`) — фильтруется перед отправкой. Если после фильтрации массив пуст, ключ не появляется вовсе.
- Числовые range/dates/booleans кодируются только при наличии значения (`typeof === 'number'` / truthy / `typeof === 'boolean'`), что прямо соответствует optional-полям `AuctionListRequest`.
- `weight_*`/`volume_*` намеренно НЕ маппятся (D-014) — их нет ни в URL-контракте SDD-015, ни в builder, ни в UI SDD-018. Admin-only поля (`customer`, `customer_ids`, `auction_ids`, `per_page`) также отсутствуют. Тесты явно проверяют отсутствие этих ключей.
- Builder — первый потребитель canonical-имени `AuctionListRequest` из Public API `shared/api`; до этого использовался только alias `AuctionListFilters`.
