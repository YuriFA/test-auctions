# AI_USAGE.md

## Что делалось с помощью AI

- Изучены `docs/project_requirements.md` и `docs/openapi.auctions.v0.json`; извлечены проектные ограничения и риски контракта.
- SDD-декомпозиция на мелкие задачи; сформулированы AI-правила в `AGENTS.md`.
- Бутстрап React + TS + Vite: package-скрипты, tsconfig, Vite, oxlint, steiger FSD-анализ, oxfmt.
- Tailwind v4 + shadcn/ui (стиль base-mira) на FSD-алиасах (`@shared/ui`, `@shared/lib`); каждый shadcn-примитив разделён на `*.component.tsx` и `*.styles.ts` для `react(only-export-components)`.
- Code-based TanStack Router с типизированным router-контекстом, провайдер TanStack Query, маршруты `/`, `/auctions`, `/auctions/$auctionUuid`, `/auctions/$auctionUuid/bets`, `/auctions/$auctionUuid/bet`. Playwright-smoke (`scripts/route-smoke.mjs`) проверяет редирект, 4 маршрута и 404.
- Hey API codegen (`pnpm codegen`) → `src/shared/api/generated/`, изолирован и исключён из линта.
- Адаптер `shared/api`: `fetchAuctionList`/`fetchAuctionDetail`/`fetchBets`/`placeBet` поверх SDK + нормализация ошибок `ApiError`/`ApiValidationError` для `application/problem+json` и 422.
- Query-ключи `auctionKeys` + `betMutationInvalidationTargets` в `entities/auction`.
- Mock-датасет (`src/shared/api/mocks/`): 10 сид-аукционов, покрывающих все `AuctionStatus`, `AuctionType`, пользовательские ветки `TradingStatus`, restriction-флаги, null/empty-цены, пустые истории ставок, отменённая ставка пользователя; словарь городов, mock-пользователь, 4 конкурента.
- Единое MSW runtime-хранилище (`runtime/store.ts`): чтения + `writeBet` + `resetMockRuntime()`, сид через `structuredClone`. `writeBet` возвращает discriminated union `PlaceBetResult`, чтобы handler'ы мапили failure-ветки в HTTP без повторной валидации.
- MSW-handler'ы на все 4 эндпоинта: `POST /auctions/list` (SDD-011), `GET /auctions/{auctionUuid}` (SDD-012), `GET /auctions/{auctionUuid}/bets` (SDD-013), `POST /auctions/{auctionUuid}/bets` (SDD-014). Все ошибки идут с `content-type: application/problem+json`.
- URL-контракт фильтров списка в `features/auction-filters` (SDD-015): parse/serialize/defaults с round-trip-инвариантом, 47 TDD-тестов. Vitest + Zod установлены, `pnpm test`/`pnpm test:run` добавлены.
- Request builder `buildAuctionListRequest` в `features/auction-filters/lib/request-builder.ts` (SDD-016): транслирует типизированный объект фильтров в тело `AuctionListRequest`, пропуская default-значения, фильтруя UI-only enum (`auc_type: 'Unknown'`), не протекая в admin-only поля. 31 TDD-тест.
- Auctions list query + page composition (SDD-017): TanStack Query hook `useAuctionsList` в `entities/auction/api/` с `select`-маппингом DTO → `AuctionsListViewData` (маппер `toAuctionListItemVM` в `entities/auction/lib/`); prefetch-on-hover через `queryClient.prefetchQuery` во владельце list-page; состояния skeleton/empty/error через ранние return'ы; пагинация через URL search params; типизированный `useSearch` через `validateSearch` на route + кастомные `parseSearch`/`stringifySearch` на router (повторяющиеся ключи для массивов, без default-значений). Page-structure: shell `AuctionsPage` (frame + header) + content `AuctionsList` (hooks + ранние return'ы + success-рендер), Public API слайса экспортирует только shell. Первый реальный потребитель `shared/api` адаптера.

## Замечания о текущем покрытии

- UI страницы списка теперь реальный end-to-end: фильтры (SDD-018) и карточка (SDD-020). Детальная страница и ставка всё ещё placeholder.
- `SDD-001..014` завершены. `SDD-015` (URL-контракт фильтров), `SDD-016` (request builder), `SDD-017` (list query + composition), `SDD-018` (фильтры UI), `SDD-020` (карточка списка) завершены. `SDD-021+` — detail/bets/bet-форма/мутации.
- `SDD-005`: TanStack Router в code-based режиме (`RouterProvider` + `QueryClientProvider` в `app.component.tsx`); QueryClient-синглтон в `app/lib/`; маршруты в `app/routes/`, страницы в `pages/<slice>/ui/`.
- `SDD-007`: адаптер превращает `RequestResult` Hey API в `ApiError`/`ApiValidationError`; граница `generated` держится на структуре папок и Public API.
- `SDD-008`: иерархические ключи делают bets потомком detail — план инвалидации читается как документация. steiger-правило `fsd/insignificant-slice` остаётся отключенным: `entities/auction` и `features/auction-filters` имеют по одному потребителю (`pages/auctions-list`) до SDD-018/20.
- `SDD-010`: один module-level `state.auctions` для всех handler'ов; мутация `writeBet` отвергает предыдущую активную ставку, пересчитывает места, обновляет trading-блок в list+detail DTO согласованно. 404 на неизвестном UUID, 422 на `price <= 0`.
- `SDD-011..014`: каждый handler — тонкая HTTP-обёртка над store, владеет только HTTP-конвертом; path-паттерн `*/api/v1/auctions/...` с leading-wildcard работает и в browser-worker, и в Node `setupServer`. Односегментный placeholder `:auctionUuid` + метод-диспатч MSW держат handlers без конфликтов.
- `SDD-014`: спецификация помечает 200-ответ set-bet как `unknown`; адаптер `placeBet` возвращает `void`, mock тем не менее отдаёт `BetItem` — forward-compatible.
- `SDD-015`: контракт в `features/auction-filters` (новый feature-слайс). Реализация без runtime-Zod — это прямая JSON-подобная трансформация; Zod пригодится в SDD-025. URL не содержит admin-only полей (`customer`, `per_page`).
- `SDD-016`: builder `buildAuctionListRequest` — чистая функция `AuctionsListFilters → AuctionListRequest`. Default-значения не отправляются (пустой фильтр → `{}`), `auc_type: 'Unknown'` отсекается (UI-only), `weight_*`/`volume_*` намеренно не маппятся (D-014). Canonical-имя `AuctionListRequest` добавлено в Public API `shared/api` (ранее был только alias `AuctionListFilters`).
- Smoke-скрипты: MSW-list (7 сценариев / 33 assertion), detail (6 / 25), bets (9 / 34), set-bet (9 / ~55) через `npx tsx scripts/msw-*-smoke.mjs`; UI-list (`scripts/list-page-smoke.mjs`, 4 проверки: h1, 10 карточек, hover-prefetch GET, пагинация) через `node scripts/list-page-smoke.mjs` при поднятом `pnpm dev`. В `pnpm check` не входят.

## Какие решения принял кандидат

- **Стек**: Hey API codegen (только SDK+типы), рукописный TanStack Query, code-based TanStack Router, Zustand для точечного UI-state, URL search params как источник истины для фильтров, Tailwind + shadcn/ui, история ставок как вложенный маршрут.
- **Именование**: `*.component.tsx` для всех React-компонентов, `.route.tsx` для маршрутов, `*.test.ts` для тестов (co-locate рядом с тестируемым модулем).
- **Границы**: сгенерированный OpenAPI-слой read-only и изолирован за `shared/api`; query-ключи в одной иерархической фабрике; mock-датасет не реэкспортируется из `shared/api/index.ts`; `msw/browser` изолирован в `mocks/browser.ts` и не реэкспортируется из `mocks/index.ts`.
- **`writeBet` возвращает discriminated union** `PlaceBetResult` вместо бросания — хранилище отвечает за данные, HTTP-семантика за handler'ом (SDD-014).
- **Направление аукциона** (`Down` — младшая выигрывает, `Up` — старшая) — единственный сигнал для ранжирования и перевычисления `available`.
- **Автоматическое отвержение предыдущей активной ставки** пользователя при новой (как в сиде `stoppedRejected`).
- **Path-паттерн `*/api/v1/auctions/...`** с leading-wildcard для browser+Node; односегментный `:auctionUuid` placeholder + MSW-диспатч по методу держат 4 handler'а без конфликтов.
- **MSW worker стартует с `await` перед `createRoot`**, поэтому ни один fetch не уходит до готовности воркера; dynamic import в `import.meta.env.DEV` вырезается Vite в production.
- **`tsx`** (не `--experimental-strip-types`) для smoke-скриптов — extensionless-импорты в generated не требуют renaming.
- **TDD per-task**: тесты пишутся вперёд в задаче, создающей тестируемый код (SDD-015/16/24/25); выделенная задача «Logic Tests» не заводится, TDD встроен в задачи-источники (см. `docs/sdd/decisions.md` D-008).
- **Двусторонний URL-контракт в SDD-015** (D-012): parse + serialize + defaults в одном модуле; default-значения не сериализуются.
- **Display-лейблы для enum'ов** (D-013) в `entities/auction/lib` как `Record<Enum, string>`; первый потребитель — SDD-018.
- **Mock-only расширение `main.auction_uuid`** (D-011) — закрывает контрактный разрыв (paths требуют `auctionUuid`, но DTO его не экспонируют); не протекает в production-типы.
- **Page structure: shell + content.** `AuctionsPage` (frame + header, ноль пропсов, ноль hooks) оборачивает `AuctionsList` (все hooks, ранние return'ы для skeleton/error/empty, success-рендер). Public API слайса экспортирует только shell, content — внутренний.
- **Export-naming без `Component`-суффикса.** Файлы остаются `*.component.tsx` (требование AGENTS.md), но идентификаторы экспорта короткие: `AuctionsList`, `RootLayout`, `Button`. Раньше был mix `AuctionsListComponent`/`Button` — привёл к единому стилю.
- **VM-mapping через `select` в query-hook'е**, не в рендере. `useAuctionsList` имеет `select: toAuctionsListViewData`, который мапит `AuctionListResponse` → `{ items: AuctionListItemVM[], currentPage, lastPage, total }`. Маппинг бегает один раз на новый snapshot, не на каждый render.
- **Типизированный URL search через `validateSearch`.** На route: `validateSearch: parseAuctionsListSearch` (возвращает `Partial<AuctionsListFilters>` — только non-default поля). На router: кастомные `parseSearch`/`stringifySearch` через `URLSearchParams` (повторяющиеся ключи для массивов, undefined/empty пропуски). `useSearch({ from: '/auctions' })` типизирован без `as`-cast'а. Page merge'ит partial с `DEFAULT_AUCTIONS_LIST_FILTERS` для downstream-потребителей.
- **Presentational-компоненты получают generic intent-callback'и.** Карточка принимает `onIntent?: (auctionUuid) => void` (hover/focus-триггер), не `onPrefetch`. Карточка не знает, что page делает с этим сигналом; page решает (prefetch query).
- **SDD-020: VM-mapper централизует nullable-обработку и enum→label.** `toAuctionListItemVM` построен так, чтобы карточка оставалась чистым рендером: каждое nullable-поле DTO схлопывается в `string | null` с явным fallback `''`/`null`, а enum'ы превращаются в русские лейблы через `describe*`. Карточка не импорит `AuctionStatus`/`describeAuctionStatus` и не знает о структуре DTO. 8 TDD-тестов покрывают happy-path, missing-uuid, missing-direction с fallback на города, null-price и missing-trading.
- **SDD-020: логика primary action живёт в чистой функции.** `deriveAuctionCardPrimaryAction` возвращает discriminated union одного из 4 состояний (`place-bet`/`change-bet`/`view-bets`/`disabled`). Терминальные статусы (`Finished`/`Stopped`/`Canceled`) форсят disabled с status-specific лейблом, перебивая `can_set_bet`. 8 TDD-тестов покрывают приоритет и все ветки. Карточка только рендерит результат; SDD-022/23/26 потребляют route без правок логики.
- **SDD-020: stretched-link вместо вложенных `<a>`.** Карточка — это `<article>` с одной stretched `<Link>` поверх всего контента (кликабельно всё) и второй `<Link>` для CTA с `z-10`, чтобы он перебивал stretched-overlay. HTML остаётся валидным (нет вложенных `<a>`), а CTA ведёт на корректный подсегмент (`/bet` или `/bets`) — два разных Link-рендера держат `to` строковым литералом для типизированного `params` TanStack Router.
- **SDD-020: `step` не попал в карточку.** List-DTO `trading.price` содержит только `{start, current, current_no_vat}`; `step` есть только в detail. Карточка не делает вид, что знает шаг, и не дёргает detail-эндпоинт — поле опущено и задокументировано здесь. Если будущая ревизия API добавит `step` в list-DTO, VM-маппер расширяется одним полем без правок UI.
- **Route collapse.** `/auctions` схлопнут в один route (parent + child index были boilerplate). `/auctions/$auctionUuid` оставлен parent'ом с `AuctionLayout` — у него 3 child-route'а (index/bets/bet-form) делят path-параметр.
- **Ловушка prop-drilling'а.** Промежуточная попытка вынести `AuctionList` отдельным компонентом с props `query/filters/onIntent/setPage` оказалась проп-дриллингом без реальной изоляции — инлайнила обратно, потом переразделила на shell/content где child самодостаточен (нулевые props у shell'а). Правило: split оправдан, когда у child'а своя ответственность и узкий интерфейс; если надо прокидывать 4+ связанных пропсов — не split.

## Какие AI-предложения были отклонены

- **Не приравнивать `auctionUuid` к `main.order_uid`**: логика роутинга спряталась бы за записью в `decisions.md`; mock-only расширение `main.auction_uuid` (D-011) видимое и forward-compatible.
- Не генерировать React Query-хуки из OpenAPI.
- Не экспортировать сгенерированные артефакты напрямую в feature/entity-слои.
- Не использовать localStorage как источник истины для фильтров.
- Не прятать поток ставок вне иерархии маршрута аукциона.
- Не прыгать в реализацию фич до декомпозиции и архитектурных ограничений.

## Что проверялось особенно внимательно

- OpenAPI-поля с `format: uuid` — Hey API эммитит их как `string`; `order_uid`, `auctionUuid`, UUID сид-аукционов используют каноническую форму.
- Контракто-чувствительные nullable-поля и различия enum'ов между list и detail.
- Валидация и обработка ошибок 422 (`ValidationProblem` с `errors[]`).
- DTO-driven UI-ограничения: скрытые контакты, скрытые цены, скрытая история ставок.
- URL-матчинг MSW: относительный путь сматчился в браузере, но не в Node — leading-wildcard решил обе среды.
- Пагинация за пределами диапазона: `page > last_page` исторически возвращала `meta.from > total`; фикс — `from=0, to=0` для пустой страницы, как Laravel-пагинатор.
- `await worker.start()` до `createRoot` — без race-condition между worker и первым fetch TanStack Query.
- Cross-endpoint консистентность после `writeBet`: smoke проверяет list/detail/bets согласованно.

## Какие риски остаются

- Инфраструктура зрелая, но UI не реализован — страницы placeholder.
- Продуктовые ожидания шире форм ответов OpenAPI, поэтому некоторые UI-значения придётся выводить из доступных данных.
- Схема детальная с многими nullable — риск случайных UI-допущений при реализации.
- Cross-endpoint консистентность проверена smoke как верифицированный инвариант; новый risk — будущие UI-мутации (SDD-027) не должны патчить кеш локально вместо инвалидации query-ключей.
- React Hook Form и Zod придут с UI-формой ставки (SDD-025+).
- shadcn-компоненты шипят с двумя экспортами; каждый `shadcn add` требует ручного разделения на `*.component.tsx` + `*.styles.ts`.
- Playwright-smoke (`scripts/route-smoke.mjs`) требует запущенного dev-сервера, в CI не подключён.
- Адаптер `shared/api` получил первого реального потребителя в SDD-017 (`useAuctionsList` → `fetchAuctionList` → SDK → MSW), но end-to-end-покрытие автоматическими тестами пока только через UI-smoke; logic-тесты по-прежнему покрывают чистую логику, а не adapter-call.
- Query-ключи определены и теперь потребляются: `auctionKeys.list` через `useAuctionsList`, `auctionKeys.detail` через hover-prefetch. `entities/auction` имеет первого потребителя (`pages/auctions-list`).
- Smoke-скрипты закоммичены в `scripts/`, но не в `pnpm check`; browser-smoke требует dev-сервера.
- Mock-only расширение `main.auction_uuid` (D-011) НЕ ДОЛЖНО протекать в production-типы.

## Что улучшилось бы при наличии ещё одного дня

- Заполнить пустые `widgets/` и `features/` слои следующими UI-задачами (SDD-021+: detail, bets, форма ставки, мутации).
- Расширить автоматические тесты помимо чисто логических.
- Уточнить визуальные состояния для мобильных и ошибочных сценариев.
- Расширить mock-сценарии для большего числа edge-case и комбинаций скрытых данных.
- Добавить подробные README-заметки о верификации с матрицей сценариев и скриншотами.
