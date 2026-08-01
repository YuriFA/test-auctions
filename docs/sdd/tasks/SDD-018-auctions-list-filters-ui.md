# SDD-018 Auctions List Filters UI

## Статус

Завершено.

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
- Состояние открыт/закрыто sheet'а фильтров — локальный `useState` в компоненте-владельце (D-004: локальный UI-state не требует Zustand). Само состояние фильтров — в URL (SDD-015).
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
4. Использовать эти мапперы в UI-компонентах фильтров (и позже в SDD-020 в карточке).

## Критерии приёмки

- Взаимодействия с фильтрами обновляют URL только через `serializeAuctionsListSearchParams` из SDD-015.
- Обновление или шеринг URL сохраняет состояние фильтров (round-trip закрыт в SDD-015).
- Городские фильтры используют `mockCities` (SDD-009).
- Лейблы enum'ов берутся из `entities/auction/lib` и покрыты `pnpm test`.
- `countActiveFilters` / `isDefaultFilters` используются для бейджа и кнопки «сбросить».
- Фильтры открываются в side-sheet (shadcn `Sheet` поверх `@base-ui/react/dialog`) по клику на trigger-кнопку с бейджем `countActiveFilters`; один и тот же sheet работает на mobile и desktop. Состояние `open` — локальный `useState` в компоненте-владельце (D-004: локальный UI-state не требует Zustand).
- React-компоненты именуются с суффиксом `*.component.tsx` (D-003, требование `project_requirements.md` строки 103/139).

## Non-goals

- В этой задаче НЕ пишется чистая фильтр-логика. Если в UI-компоненте возник transform (format/parse/coerce) — это сигнал, что он должен жить в SDD-015 (URL-контракт) или в `entities/auction/lib` (доменные мапперы), а не в `*.component.tsx`.
- Тестирование рендера UI вне scope logic-минимума AGENTS.md; при желании добавляется отдельно.

## Заметки и риски

- Не допускать, чтобы скрытое локальное состояние стало настоящим источником истины: URL (через SDD-015) — единственный источник, UI — только зеркало.
- Словарь лейблов — первый житель `entities/auction/lib`; это создаёт сегмент `lib` внутри слайса, что соответствует FSD-конвенции «purpose-named segments» (steiger допускает).

## Заметки о реализации

- Лейблы enum'ов живут в `entities/auction/lib/describe.ts` (отдельный коммит `feat: add auction enum labels and status codes`): `describeAuctionType`, `describeTradingStatus`, `describeAuctionStatus`, `describeAuctionStatusCode(code 1..7)`, плюс `AUCTION_STATUS_CODES` (7 кодов в порядке OpenAPI enum'а, без Canceled/Unknown). Fallback для неожиданных значений — `—`, без исключений. SDD-020 переиспользует те же функции в карточке.
- Числовые коды `statuses[]=1..7` взяты напрямую из комментариев OpenAPI-спеки (`docs/openapi.auctions.v0.json`, `AuctionListRequest.statuses`): 1=Planning … 7=Stopped, позиционно. Canceled(8) и Unknown явно вне фильтра.
- UI состоит из одного компонента `AuctionFilters` (`auction-filters.component.tsx`): кнопка «Фильтры (N)» + shadcn `Sheet` (side="right"), внутри которого рендерится `AuctionFiltersForm`. Один и тот же sheet используется на desktop и mobile — визуально не зависит от breakpoint. Состояние `open` — локальный `useState`, без zustand (один владелец, нет нужды в глобальном сторе).
- Поиск по номеру заявки (`AuctionSearchInput`) живёт в header страницы, а не в sheet — это primary action, и прятать его за открытие фильтров было неудобно. Коммитит на blur/Enter, как и остальные текстовые поля.
- Форма `auction-filters-form.component.tsx` рендерит 7 секций через `<fieldset>`/`<legend>`: Тип аукциона (4 checkbox), Статус аукциона (7 числовых кодов), Мой статус (6 TradingStatus), Маршрут (2 city select), Дата погрузки (2 date input), Текущая цена (2 number input), Дополнительно (is_available, is_bidder). Чекбоксы — вертикальный список `checkbox + label` без карточной обёртки (унified с полем «Дополнительно»). Weight/volume НЕ отображаются (D-014).
- Форма хранит локальный `draft` (`useState` + `useEffect`-sync с `initialFilters`, который memoизирован, чтобы избежать бесконечного цикла setState). На change обновляется только draft; URL остаётся нетронутым до явного Apply. Кнопка «Применить» коммитит весь draft через `navigate({ search: toAuctionsListSearch({ ...draft, page: 1 }) })` и зовёт `onApplied` (sheet закрывается). Кнопка «Сбросить» сбрасывает draft к `DEFAULT_AUCTIONS_LIST_FILTERS` без navigate. Любой cancel-путь (backdrop, X, Esc) теряет незакоммиченные изменения — это намеренно, draft живёт в форме, а не в URL.
- shadcn `Sheet` (`src/shared/ui/sheet.component.tsx`) построен поверх `@base-ui/react/dialog` с side-вариантами (`top`/`right`/`bottom`/`left`) и кнопкой закрытия (`XIcon` из lucide). Закрывается по клику на backdrop, по кнопке X и по Esc — все три поведения проверены smoke-скриптом. `SheetContent` использует `p-0` — внутренняя форма сама владеет отступами и sticky-футером.
- shadcn `Button` (`src/shared/ui/button.component.tsx`) — обновлён через `pnpm dlx shadcn add`; стили (cva) живут отдельно в `button.styles.ts`, чтобы не нарушать fast-refresh (oxlint rule `react/only-export-components`).
- Добавлены shadcn-примитивы `field`, `input`, `checkbox`, `label`, `select`, `separator` (через `pnpm dlx shadcn@latest add`), все переименованы под суффикс `*.component.tsx` (D-003). `field` используется для layout'а полей (Field + FieldLabel), `input` — для текстовых/числовых/дата-полей, `checkbox` — для multi-select и toggle, `select` — для выбора города. Internal sibling-imports внутри `field.component.tsx` указывают на `./label.component` и `./separator.component` (не через barrel, чтобы избежать круговой зависимости `index → field → index`).
- Словарь городов поднят из `mocks/cities.ts` в `@shared/config/cities.ts` (production Public API); mocks-файл стал тонким реэкспортом, чтобы не нарушать правило SDD-009:34 «вышележащие слои не импортируют `@shared/api/mocks` напрямую».
- Зависимость `zustand` удалена — единственным потребителем был `useFiltersUIStore`, который после перехода на локальный state в `AuctionFilters` больше не нужен.
- Зависимость `react-hook-form` добавлена и используется в `auction-filters-form.component.tsx`: `useForm<AuctionsListFilters>` с `defaultValues: initialFilters` и реактивным `values: initialFilters` (встроенный RHF-механизм для sync'а из URL без ручного `useEffect`). Все поля управляются через `Controller`, кроме простых строковых `load_date_*`, которые используют `register()`. Apply — это `handleSubmit(onSubmit)`, где `onSubmit` зовёт `navigate({ search: toAuctionsListSearch({ ...next, page: 1 }) })` и `onApplied()`. Reset — `form.reset({ ...DEFAULT_AUCTIONS_LIST_FILTERS })` без navigate (URL остаётся нетронутым до явного Apply). Состояние `isDefault` для disabled-кнопки «Сбросить» считается из `form.watch()` через `isDefaultFilters(values)`.
- Поиск `cargo_num` намеренно исключён из `countActiveFilters` (SDD-015): поиск — отдельный primary action в header'е страницы и не должен влиять на бейдж фильтров. Сам URL по-прежнему хранит `cargo_num`, и round-trip parse↔serialize остаётся полным; исключён только визуальный счётчик. `isDefaultFilters` для целей кнопки «Сбросить» в форме по-прежнему работает корректно, т.к. форма не оперирует `cargo_num`.
- Кнопка триггера фильтров и поле поиска выровнены по высоте `h-9` (через `className="h-9 ..."`). Базовая кнопка shadcn `size="sm"` даёт `h-6`, поэтому высота переопределена явно через `className`. Поиск использует shadcn `Input` с тем же `h-9` и `pl-9` под иконку-search.
- Sticky-футер с кнопками «Сбросить» и «Применить» живёт внутри `<form>` как `<div className="sticky bottom-0 border-t bg-popover px-6 py-4">`. Скроллится только верхняя часть формы (`flex-1 overflow-y-auto`), футер всегда виден. Это позволяет кнопкам оставаться доступными даже в длинных формах на мобильных.
- Smoke (теперь `e2e/filters-ui.spec.ts` под `@playwright/test`, часть `pnpm test:e2e`): ~15 checks — поиск в header + commit на blur, счётчик не растёт от поиска, кнопка «Фильтры» видна на всех viewport, inline-панели нет до открытия, sheet открывает 7 секций, checkbox (через `[data-slot="checkbox"]`, base-ui Button-based) не коммитит до Apply, Apply коммитит URL, закрывает sheet и обновляет счётчик до 1, закрытие по backdrop/X, mobile trigger (375px) открывает sheet.
- `fsd/insignificant-slice` остался отключенным в `steiger.config.ts`: `entities/auction` и `features/auction-filters` имеют по одному потребителю до SDD-020.
