# SDD-015 Search Params Schema

## Статус

Завершено.

## Цель

Определить двусторонний контракт между URL search params и типизированным объектом фильтров страницы списка, и заложить фундамент для TDD-потока последующих задач.

## Охват

- Поставить `vitest` как devDep и завести `pnpm test` / `pnpm test:run` скрипты. Vitest переиспользует Vite-трансформер и tsconfig path-алиасы (`@shared`, `@entities` ...), поэтому дополнительный конфиг минимален.
- Построить Zod-схему для search params.
- Определить fallback-значения.
- Поддержать выбранный набор фильтров.
- **Parse**: URL string → типизированный safe-объект.
- **Serialize**: типизированный объект → `URLSearchParams` (или эквивалент), готовый к подстановке в `navigate()`.
- **Defaults**: явное определение default-объекта + хелперы `isDefaultFilters(value)` и `countActiveFilters(value)` для UI (бейдж количества, кнопка «сбросить», чистый URL без default-значений).

## Зависимости

- `SDD-005`

## TDD-порядок

1. Установить vitest, добавить `pnpm test` и `pnpm test:run` в `package.json`, при необходимости — `vitest.config.ts` (с `resolve.alias`, зеркалирующим Vite).
2. Написать красные тесты на **parse** `parseAuctionsListSearchParams(rawQuery)`:
   - пустой / `undefined` ввод → fallback-объект;
   - невалидные значения (мусорные строки в числе, неизвестные enum-значения, отрицательная страница) → fallback, без исключений;
   - каждый валидный фильтр проходит через схему;
   - строки-массивы (`?status=Leading&status=Losing`) → массивы;
   - чёткие boolean и number coerцируются корректно.
3. Написать красные тесты на **serialize** `serializeAuctionsListSearchParams(value)`:
   - round-trip: `parse(serialize(x)) ≡ x` для любого валидного `x` (свойство, а не совпадение строк);
   - default-значения НЕ попадают в вывод (URL остаётся чистым);
   - массивы сериализуются как повторяющиеся ключи (`status=Leading&status=Losing`), не как CSV;
   - null/undefined поля пропускаются;
   - число и boolean форматируются как строки канонически.
4. Написать красные тесты на **defaults**:
   - `isDefaultFilters(defaults) === true`, `isDefaultFilters({ page: 2 }) === false` и т. п.;
   - `countActiveFilters` считает только поля, отличные от default;
   - reset-хелпер (если есть) возвращает canonical defaults.
5. Запустить тесты, убедиться, что они красные по правильной причине (нет реализации).
6. Реализовать Zod-схему и хелперы с минимальной логикой, чтобы тесты позеленели.
7. Рефакторить при необходимости, держать тесты зелёными.

## Критерии приёмки

- `pnpm test` запускается и проходит; `pnpm test:run` работает в CI-стиле (без watch).
- Невалидные search params не ломают страницу.
- Fallback-значения явные и предсказуемые.
- Round-trip parse∘serialize сохраняет фильтр-состояние.
- Default-значения не загрязняют URL после serialize.
- `isDefaultFilters` / `countActiveFilters` готовы к использованию из SDD-018.
- Парсинг URL способен поддержать request builder (SDD-016).

## Заметки и риски

- Корректность search params важна для роутинга, тестирования и воспроизводимости.
- Vitest ставится именно здесь, потому что это первая задача, порождающая logic-тесты; SDD-016, SDD-023, SDD-024 просто используют готовый раннер.
- Parse и serialize — две стороны одного контракта, поэтому живут в одном модуле и тестируются вместе. Разделение их по разным задачам нарушило бы инвариант round-trip.
- Не прятать тесты в `__tests__`-папках — co-locate рядом с тестируемым модулем (`*.spec.ts` или `*.test.ts`), чтобы steiger FSD-проверка и Public API оставались консистентными.
- SDD-018 (фильтры UI) потребляет эти хелперы; любой чисто-логический трансфер из UI в URL или обратно дорабатывается здесь, а не в UI-задаче.

## Заметки о реализации

- Контракт живёт в `src/features/auction-filters/lib/search-params.ts` — новый feature-слайс `auction-filters` создан с Public API `index.ts`. UI фильтров (SDD-018) добавит `ui/`-сегмент поверх `lib/` без изменения Public API.
- Vitest 4.1.10 установлен как devDep, `vitest.config.ts` зеркалит path-алиасы из `vite.config.ts`/`tsconfig.app.json`. Скрипты `pnpm test` (watch) и `pnpm test:run` (CI-style) добавлены в `package.json`. `tsconfig.node.json` расширен `vitest.config.ts` для типизации конфига.
- Zod 4.4.3 установлен как runtime-dep. Parse идёт через типизированную Zod-схему `auctionsListFiltersSchema: z.ZodType<AuctionsListFilters>` с permissive-трансформами на каждом поле — `schema.parse()` никогда не бросает, любой мусор на входе коллапсирует в defaults. Helper `toPlainObject(raw)` нормализует URLSearchParams в `Record<string, string[]>` (всегда массивы), так что схема видит консистентную форму и для single-value, и для repeated keys. Serialize и defaults остаются ручными — Zod не занимается сериализацией, а дефолты нужны и для serialize, и для UI badge. Схема экспортирована через Public API — SDD-018 может переиспользовать её для UI-формы.
- Контракт покрывает user-facing фильтры (минимум из `project_requirements.md`): `page`, `is_oldest`, `cargo_num`, `load_city`, `unload_city`, `auc_type[]`, `status[]`, `statuses[]` (1..7), `is_available`, `is_bidder`, `current_price_from/to`, `create_date_from/to`, `load_date_from/to`. Admin-only поля (`customer`, `customer_ids`, `auction_ids`) и транспортная `per_page` намеренно НЕ в URL — SDD-016 мапит typed-объект в полный `AuctionListRequest`.
- `parseAuctionsListSearchParams` пермиссивна: некорректный ввод коллапсирует в defaults, никаких исключений. `serializeAuctionsListSearchParams` НЕ пишет default-значения, чтобы URL оставался читаемым и устойчивым к изменению дефолтов; массивы — повторяющиеся ключи (`auc_type=Down&auc_type=Up`), не CSV.
- Round-trip-инвариант `parse(serialize(x)) ≡ x` покрыт тестами (47 assertion, ALL OK): default-filters, fully-populated filters, falsy `is_available: false` проходит через обе стороны.
- `isDefaultFilters` / `countActiveFilters` считают каждый не-default scalar за один активный фильтр (массив — за один, независимо от длины); булевый флаг активен и при `true`, и при `false`, если он не default (default для optionals — `undefined`).
