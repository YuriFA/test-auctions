# SDD-011 Implement MSW List Endpoint

## Статус

Завершено.

## Цель

Реализовать endpoint списка аукционов в соответствии со схемой.

## Охват

- Реализовать `POST /auctions/list`.
- Поддержать пагинацию.
- Поддержать обязательный минимум фильтров.

## Зависимости

- `SDD-006`
- `SDD-010`

## Критерии приёмки

- Форма ответа соответствует `AuctionListResponseBase`.
- Обработка запроса учитывает релевантные поля фильтров.
- Метаданные пагинации когерентны с отфильтрованными результатами.

## Заметки и риски

- Быть осторожным с date- и numeric-фильтрами.

## Заметки о реализации

- MSW-обработчик `POST /auctions/list` живёт в `src/shared/api/mocks/handlers/auctions-list.ts` и является тонкой HTTP-обёрткой над `readAuctionList` — парсит JSON-тело в `AuctionListRequest`, передаёт в runtime-store, возвращает `AuctionListResponseBase`. Вся filter-/sort-/pagination-логика остаётся в store (SDD-010), handler владеет только HTTP-конвертом: 200 с телом на успех, 422 `ValidationProblem` с явным `content-type: application/problem+json` на некорректном JSON (как требует `components/responses/ValidationFailed` спецификации).
- Path-паттерн `*/api/v1/auctions/list` (leading-wildcard) — единый для browser-worker (где SDK постит против текущего host) и Node `setupServer` (где у native fetch синтетический `http://localhost` origin). Относительный путь `/api/v1/auctions/list` сматчился в браузере, но не в Node.
- Handlers агрегированы в `src/shared/api/mocks/handlers/index.ts`, массив `mockHandlers` реэкспортирован через Public API `src/shared/api/mocks/index.ts`. Browser-worker изолирован в `src/shared/api/mocks/browser.ts` и НЕ реэкспортируется из `mocks/index.ts`, чтобы `msw/browser` не подтягивался в production-сборку и Node-тесты; `main.tsx` стартует worker только в `import.meta.env.DEV` через динамический `import("@shared/api/mocks/browser")` с `await` перед `createRoot`.
- Попутно исправлен баг пагинации SDD-010 (см. заметки выше): при `page > last_page` `meta.from` превышал `total`.
- Node-smoke `scripts/msw-list-smoke.mjs` покрывает 7 сценариев / 33 assertion: default body, pagination `per_page`+`page`, пустая страница за диапазоном, фильтр `auc_type`, текстовый `cargo_num`, malformed JSON → 422 с проверкой `content-type: application/problem+json`, flip `is_oldest`. Browser-smoke через Playwright против dev-сервера (`scripts/msw-browser-smoke.mjs`) подтверждает, что воркер регистрируется и fetch из page-context возвращает mock-данные.
